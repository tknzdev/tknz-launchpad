import { useMemo, useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { z } from "zod";
import Header from "../components/Header";
import CurveConfigPanel from "../components/CurveConfigPanel";

import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { VersionedTransaction, Connection } from "@solana/web3.js";
import { useUnifiedWalletContext, useUnifiedWallet, useWallet } from "@jup-ag/wallet-adapter";
import { Buffer } from "buffer";
import { toast } from "sonner";

// Define the schema for form validation
const poolSchema = z.object({
  tokenName: z.string().min(3, "Token name must be at least 3 characters"),
  tokenSymbol: z.string().min(1, "Token symbol is required"),
  tokenLogo: z.instanceof(File, { message: "Token logo is required" }),
  website: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .or(z.literal("")),
  twitter: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .or(z.literal("")),
// Optional initial buy amount in tokens
  buyAmount: z.number().min(0).optional(),
});

interface CreateMeteoraTokenResponse {
  transactions: string[];
  mint: string;
  ata: string;
  metadataUri: string;
  pool: string;
  poolConfigKey?: string;
  decimals: number;
  initialSupply: number;
  initialSupplyRaw: string;
  depositSol: number;
  depositLamports: number;
  feeSol: number;
  feeLamports: number;
  isLockLiquidity: boolean;
  buySol: number;
  buyLamports: number;
  tokenMetadata: any;
}

interface FormValues {
  tokenName: string;
  tokenSymbol: string;
  tokenLogo: File | undefined;
  website?: string;
  twitter?: string;
  /** Optional initial buy amount in tokens */
  buyAmount?: number;
}

/**
 * Shape returned by the /pool-configs function.
 */
interface PoolConfig {
  pubkey: string;
  label?: string;
  description?: string;
  // Catch-all for any extra fields the backend might add in the future
  [key: string]: any;
}

export default function CreatePool() {
  const { publicKey, signTransaction, signMessage } = useWallet();
  const unifiedUI = useUnifiedWalletContext();
  
  console.log('CreatePool: unified wallet context:', unifiedUI);
  console.log('CreatePool: publicKey from useWallet', publicKey);
  console.log('CreatePool: window.tknz available?', typeof window !== 'undefined' && !!window.tknz);


  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
  const connection = useMemo(() => new Connection(rpcUrl, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000, // 60 seconds
  }), [rpcUrl]);

  const [isLoading, setIsLoading] = useState(false);
  const [poolCreated, setPoolCreated] = useState(false);
  const [previewData, setPreviewData] = useState<
    (CreateMeteoraTokenResponse & { payload: any }) | null
  >(null);

  /**
   * For the new pre-config flow we only need the partially-signed transaction
   * (plus a couple of extra fields) returned by the create-pool Netlify
   * function.  Once present we show a confirmation step that will sign and
   * broadcast it.
   */
  const [poolCreateTx, setPoolCreateTx] = useState<
    | { 
        transactions: string[]; 
        mint: string; 
        poolConfigKey: string; 
        feeSol: number; 
        feeLamports: number; 
        name: string; 
        symbol: string; 
        uri: string;
        pool?: string;
        token?: any;
      }
    | null
  >(null);
  
  // Advanced curve configuration
  const [showCurveConfig, setShowCurveConfig] = useState<boolean>(false);
  const [curveConfigOverrides, setCurveConfigOverrides] = useState<
    Record<string, any>
  >({});

  /**
   * Pool configuration options fetched from the backend.  The selected option's
   * pubkey is sent when creating the pool.
   */
  const [poolConfigs, setPoolConfigs] = useState<PoolConfig[]>([]);
  const [selectedConfigPubkey, setSelectedConfigPubkey] = useState<string | null>(null);


  // Fetch available pool configs once on mount
  useEffect(() => {
    (async () => {
      try {
        const url =
          process.env.NEXT_PUBLIC_POOL_CONFIGS_URL ||
          'https://tknz.fun/.netlify/functions/pool-configs';
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load pool configs: ${res.status}`);
        const json = await res.json();
        if (json?.configs && Array.isArray(json.configs)) {
          setPoolConfigs(json.configs as PoolConfig[]);
          // Pre-select first config if nothing chosen yet
          if (!selectedConfigPubkey && json.configs.length > 0) {
            setSelectedConfigPubkey(json.configs[0].pubkey);
          }
        }
      } catch (err) {
        console.error('Error fetching pool configs', err);
        toast.error('Failed to load pool configurations');
      }
    })();
  }, []);

  const form = useForm({
    defaultValues: {
      tokenName: "",
      tokenSymbol: "",
      tokenLogo: undefined,
      website: "",
      twitter: "",
      buyAmount: undefined
    } as FormValues,
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        if (!publicKey) {
          toast.error('Wallet not connected');
          return;
        }
        if (!selectedConfigPubkey) {
          toast.error('Please select a pool configuration');
          return;
        }

        if (!value.tokenLogo) {
          toast.error('Token logo is required');
          return;
        }

        // Convert uploaded logo to data URL (acts as metadata URI placeholder)
        const reader = new FileReader();
        const imageUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(value.tokenLogo!);
        });

        const payload: any = {
          walletAddress: publicKey.toBase58(),
          configKey: selectedConfigPubkey,
          token: {
            name: value.tokenName,
            ticker: value.tokenSymbol,
            description: value.tokenName,
            imageUrl,
            websiteUrl: value.website || undefined,
            twitter: value.twitter || undefined,
          },
        // Optional initial buy amount in tokens
          buyAmount: value.buyAmount || 0
        };

        const url =
          process.env.NEXT_PUBLIC_CREATE_POOL_URL ||
          'https://tknz.fun/.netlify/functions/create-pool';

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Server error (${res.status})`);
        }

        const json = await res.json();

        if (!json?.transactions || !json?.transactions.length) throw new Error('Invalid response from server');

        setPoolCreateTx({
          transactions: json.transactions,
          mint: json.mint,
          poolConfigKey: json.poolConfigKey,
          feeSol: json.feeSol,
          feeLamports: json.feeLamports,
          name: value.tokenName,
          pool: json.pool,
          symbol: value.tokenSymbol,
          uri: json.metadataUri || '',
          token: json.tokenMetadata,
        });
      } catch (err: any) {
        console.error('Error preparing pool creation', err);
        toast.error(err.message || 'Failed to prepare pool creation');
      } finally {
        setIsLoading(false);
      }
    },
    validators: {
      onSubmit: poolSchema,
    },
  });

// API endpoint URLs
const CREATE_API_URL = process.env.NEXT_PUBLIC_CREATE_TOKEN_URL || '/.netlify/functions/create-pool';
const SIGN_TXS_URL = process.env.NEXT_PUBLIC_SIGN_TXS_URL || '/.netlify/functions/sign-token-txs';
const CONFIRM_API_URL = process.env.NEXT_PUBLIC_CONFIRM_TOKEN_URL || '/.netlify/functions/confirm-token-creation';
const NOTIFY_API_URL = process.env.NEXT_PUBLIC_NOTIFY_TOKEN_URL || '/.netlify/functions/notify-token-creation';


// Execute previewed transactions, then call confirm and notify endpoints
const handleConfirm = async () => {
  if (!poolCreateTx) {
    toast.error("No preview data found");
    return;
  }
  
  if (!publicKey) {
    toast.error("Wallet not connected");
    return;
  }
  if (!signTransaction) {
    toast.error("Wallet does not support transaction signing");
    return;
  }
  
  // Validate that we have the required data
  if (!poolCreateTx.transactions || !poolCreateTx.transactions.length) {
    toast.error("Invalid transaction data received");
    return;
  }
  
  setIsLoading(true);
  try {
    // 1) Client-side signing of the transaction
    // There should only be ONE transaction from create-pool
    if (!poolCreateTx.transactions || poolCreateTx.transactions.length !== 1) {
      throw new Error(`Expected 1 transaction, got ${poolCreateTx.transactions?.length || 0}`);
    }
    
    const txBase64 = poolCreateTx.transactions[0];
    console.log('Deserializing transaction from create-pool...');
    
    let tx: VersionedTransaction;
    try {
      const buf = Buffer.from(txBase64, "base64");
      tx = VersionedTransaction.deserialize(buf);
      console.log('Transaction deserialized successfully');
    } catch (err) {
      console.error('Failed to deserialize transaction:', err);
      throw new Error('Invalid transaction format');
    }
    
    // Sign the transaction with the user's wallet
    console.log('Signing transaction with wallet...');
    let signedTx: VersionedTransaction;
    
    try {
      signedTx = await signTransaction(tx);
      console.log('Transaction signed successfully');
    } catch (err: any) {
      console.error('Failed to sign transaction:', err);
      
      // If it's a simulation error, provide guidance
      if (err.message?.includes('simulation') || err.message?.includes('revert')) {
        console.warn('⚠️ WALLET SIMULATION FAILED - Transaction may still work!');
        
        // Check wallet balance
        try {
          const balance = await connection.getBalance(publicKey);
          console.log('Wallet SOL balance:', balance / 1e9, 'SOL');
          
          const requiredSol = 0.1; // Estimated fees
          if (balance / 1e9 < requiredSol) {
            toast.error(`Insufficient SOL balance. You have ${(balance / 1e9).toFixed(4)} SOL, but need at least ${requiredSol.toFixed(4)} SOL`);
            throw new Error('Insufficient SOL balance');
          }
        } catch (balErr) {
          console.error('Could not check wallet balance:', balErr);
        }
        
        // Show instructions for Phantom wallet
        toast.info(
          <div>
            <p className="font-semibold">📋 Simulation Failed - But Transaction May Work!</p>
            <p className="text-sm mt-2">If using Phantom wallet:</p>
            <p className="text-sm">→ Look for Submit anyway button in the wallet popup</p>
            <p className="text-sm">→ Click it to proceed with the transaction</p>
            <p className="text-sm mt-2">The simulation can fail even when the actual transaction succeeds.</p>
          </div>,
          { duration: 15000 }
        );
      }
      
      throw err;
    }
    
    // Convert signed transaction to base64
    const signedTxBase64 = Buffer.from(signedTx.serialize()).toString("base64");
    console.log('Signed transaction converted to base64');
    
    // 2) Server-side counter-signing via sign-token-txs endpoint
    console.log('Sending to server for additional signatures...');
    console.log('Using SIGN_TXS_URL:', SIGN_TXS_URL);
    
    const signRes = await fetch(SIGN_TXS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress: publicKey.toBase58(),
        poolConfigKey: poolCreateTx.poolConfigKey || '',
        mint: poolCreateTx.mint,
        signedPoolTx: signedTxBase64,
      }),
    });

    if (!signRes.ok) {
      const errorBody = await signRes.text();
      console.error('Server signing error:', errorBody);
      throw new Error(`Signing error: ${signRes.status} ${signRes.statusText}`);
    }
    
    console.log('Server response received');
    const { signedPoolTx } = await signRes.json();
    
    if (!signedPoolTx) {
      throw new Error('Server did not return signed transaction');
    }
    
    console.log('Received fully-signed transaction from server');
    
    // Deserialize the fully-signed transaction
    const fullySignedTx = VersionedTransaction.deserialize(Buffer.from(signedPoolTx, 'base64'));
    console.log('Fully-signed transaction deserialized');
    
    // 3) Submit the fully-signed transaction to the blockchain
    console.log('Submitting transaction to blockchain...');
    
    let signature: string;
    try {
      signature = await connection.sendRawTransaction(fullySignedTx.serialize(), { 
        skipPreflight: true,
        maxRetries: 3,
      });
      console.log('Transaction submitted successfully. Signature:', signature);
    } catch (err: any) {
      console.error('Error submitting transaction:', err);
      throw new Error(`Failed to submit transaction: ${err.message}`);
    }
    
    // Wait for confirmation
    console.log('Waiting for transaction confirmation...');
    try {
      const latestBlockhash = await connection.getLatestBlockhash('confirmed');
      console.log('Got latest blockhash:', latestBlockhash.blockhash);
      
      const confirmation = await connection.confirmTransaction({
        signature: signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      }, 'confirmed');
      
      console.log('Confirmation result:', confirmation);
      
      if (confirmation.value.err) {
        console.error('Transaction failed on-chain:', confirmation.value.err);
        throw new Error(`Transaction failed on-chain: ${JSON.stringify(confirmation.value.err)}`);
      }
      
      console.log('Transaction confirmed on-chain!');
    } catch (err: any) {
      // If confirmation times out, check if the transaction actually succeeded
      console.warn('Confirmation error:', err.message);
      console.warn('Checking transaction status directly...');
      
      try {
        const status = await connection.getSignatureStatus(signature);
        console.log('Transaction status:', status);
        
        if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
          console.log('Transaction is confirmed despite timeout');
        } else if (status.value?.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
        } else {
          console.warn('Transaction status unknown after timeout, proceeding anyway');
        }
      } catch (statusErr) {
        console.error('Failed to check transaction status:', statusErr);
        console.warn('Could not verify transaction status, proceeding with caution');
      }
    }
    
    // 4) Confirm and notify backend with transaction signature
    console.log('Calling confirm endpoint...');
    const confirmRes = await fetch(CONFIRM_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        ...poolCreateTx,
        transactionSignatures: [signature], // Single signature in array for backwards compatibility
      }),
    });
    const confirmJson = await confirmRes.json();
    console.log('Confirm response:', confirmJson);
    
    console.log('Calling notify endpoint...');
    await fetch(NOTIFY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        ...poolCreateTx, 
        createdAt: confirmJson.createdAt,
        transactionSignatures: [signature], // Single signature in array for backwards compatibility
      }),
    });
    
    console.log('Pool creation completed successfully!');
    toast.success("Pool created successfully");
    setPoolCreated(true);
  } catch (err: any) {
      console.error("Error executing pool creation:", err);
      toast.error(err.message || "Failed to create pool");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Token - Tknz.fun</title>
        <meta
          name="description"
          content="Create a new token on Tknz.fun with customizable price curves."
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-b text-white">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="container mx-auto px-4 py-10">
          <CurveConfigPanel
            isOpen={showCurveConfig}
            onClose={() => setShowCurveConfig(false)}
            config={curveConfigOverrides}
            onChange={setCurveConfigOverrides}
          />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
            <div>
              <h1 className="text-4xl font-bold mb-2">Create Token</h1>
              <p className="text-gray-300">
                Launch your token with a pre-selected price curve.
              </p>
            </div>
          </div>

          {poolCreated && !isLoading ? (
            <PoolCreationSuccess />
          ) : poolCreateTx ? (
            <div className="space-y-8">
              <div className="bg-white/5 rounded-xl p-8 backdrop-blur-sm border border-white/10">
                <h2 className="text-2xl font-bold mb-6">Review & Confirm</h2>

                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Token Details</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Name:</span>
                        <span className="text-white font-medium">{poolCreateTx.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Symbol:</span>
                        <span className="text-white font-medium">{poolCreateTx.symbol}</span>
                      </div>
                    </div>
                  </div>

                  {poolCreateTx.poolConfigKey && (
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Configuration</p>
                      <p className="text-white font-mono text-xs break-all">{poolCreateTx.poolConfigKey}</p>
                    </div>
                  )}

                  {poolCreateTx.mint && (
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Base Mint</p>
                      <p className="text-white font-mono text-xs break-all">{poolCreateTx.mint}</p>
                    </div>
                  )}

                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Transaction Details</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-300 text-sm">Creation Fee:</p>
                        <p className="text-white font-medium text-lg">{poolCreateTx.feeSol} SOL</p>
                      </div>
                      {poolCreateTx.transactions && (
                        <div>
                          <p className="text-gray-300 text-sm">Transactions:</p>
                          <p className="text-white font-medium text-lg">{poolCreateTx.transactions.length}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-300 text-sm">
                      <span className="font-semibold">⚠️ Important:</span> You will need to sign {poolCreateTx.transactions?.length || 0} transaction{poolCreateTx.transactions?.length !== 1 ? 's' : ''} to create this pool. Make sure you have enough SOL for fees.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 justify-end mt-8">
                  <button
                    type="button"
                    onClick={() => setPoolCreateTx(null)}
                    disabled={isLoading}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 hover:border-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm} 
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <span className="iconify ph--spinner w-5 h-5 animate-spin mr-2" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span className="iconify ph--signature w-5 h-5 mr-2" />
                        <span>Sign & Launch</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="space-y-8"
            >
              {/* Token Details Section */}
              <div className="bg-white/5 rounded-xl p-8 backdrop-blur-sm border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Token Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <label
                        htmlFor="tokenName"
                        className="block text-sm font-medium text-gray-300 mb-1"
                      >
                        Token Name*
                      </label>
                      {form.Field({
                        name: "tokenName",
                        children: (field) => (
                          <input
                            id="tokenName"
                            name={field.name}
                            type="text"
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                            placeholder="e.g. Virtual Coin"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            required
                            minLength={3}
                          />
                        ),
                      })}
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="tokenSymbol"
                        className="block text-sm font-medium text-gray-300 mb-1"
                      >
                        Token Symbol*
                      </label>
                      {form.Field({
                        name: "tokenSymbol",
                        children: (field) => (
                          <input
                            id="tokenSymbol"
                            name={field.name}
                            type="text"
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                            placeholder="e.g. VRTL"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            required
                            maxLength={10}
                          />
                        ),
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="tokenLogo"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Token Logo*
                    </label>
                    {form.Field({
                      name: "tokenLogo",
                      children: (field) => (
                        <>
                          <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                            <span className="iconify w-6 h-6 mx-auto mb-2 text-gray-400 ph--upload-bold" />
                            <p className="text-gray-400 text-xs mb-2">
                              PNG, JPG or SVG (max. 2MB)
                            </p>
                            <input
                              type="file"
                              id="tokenLogo"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  field.handleChange(file);
                                }
                              }}
                            />
                            <label
                              htmlFor="tokenLogo"
                              className="bg-white/10 px-4 py-2 rounded-lg text-sm hover:bg-white/20 transition cursor-pointer"
                            >
                              Browse Files
                            </label>
                          </div>
                          {field.state.value instanceof File && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={URL.createObjectURL(field.state.value)}
                              alt="Logo Preview"
                              className="mt-4 mx-auto w-20 h-20 object-cover rounded-md"
                            />
                          )}
                        </>
                      ),
                    })}
                  </div>
                </div>
              </div>

              {/* Pool Configuration Section */}
              <div className="bg-white/5 rounded-xl p-8 backdrop-blur-sm border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Pool Configuration</h2>

                {poolConfigs.length === 0 ? (
                  <p className="text-gray-400">Loading available configurations…</p>
                ) : (
                  <div className="space-y-4">
                    {poolConfigs.map((cfg) => (
                      <label
                        key={cfg.pubkey}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedConfigPubkey === cfg.pubkey
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="radio"
                          className="mt-1 accent-cyan-500"
                          value={cfg.pubkey}
                          checked={selectedConfigPubkey === cfg.pubkey}
                          onChange={() => setSelectedConfigPubkey(cfg.pubkey)}
                        />
                        <div>
                          <p className="font-semibold text-white">{cfg.label || cfg.pubkey}</p>
                          {cfg.description && (
                            <p className="text-sm text-gray-300 whitespace-pre-line">
                              {cfg.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                {selectedConfigPubkey === null && poolConfigs.length > 0 && (
                  <p className="text-red-400 text-sm mt-2">Please select a configuration</p>
                )}
              </div>
              {/* Initial Buy Section */}
              <div className="bg-white/5 rounded-xl p-8 backdrop-blur-sm border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Initial Buy (optional)</h2>
                <div className="mb-4">
                  <label
                    htmlFor="buyAmount"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Initial Buy Amount (Tokens)
                  </label>
                  {form.Field({
                    name: "buyAmount",
                    children: (field) => (
                      <input
                        id="buyAmount"
                        name={field.name}
                        type="number"
                        step="1"
                        min="0"
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                        placeholder="e.g. 1000"
                        value={field.state.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            field.handleChange(undefined);
                          } else {
                            const parsed = parseFloat(val);
                            field.handleChange(isNaN(parsed) ? undefined : parsed);
                          }
                        }}
                      />
                    )
                  })}
                  <p className="text-xs text-gray-400 mt-1">
                    Enter the number of tokens you want to purchase immediately after pool creation
                  </p>
                </div>
              </div>

              {/* Social Links Section */}
              <div className="bg-white/5 rounded-xl p-8 backdrop-blur-sm border border-white/10">
                <h2 className="text-2xl font-bold mb-6">
                  Social Links (Optional)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="mb-4">
                    <label
                      htmlFor="website"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Website
                    </label>
                    {form.Field({
                      name: "website",
                      children: (field) => (
                        <input
                          id="website"
                          name={field.name}
                          type="url"
                          className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                          placeholder="https://yourwebsite.com"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      ),
                    })}
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="twitter"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Twitter
                    </label>
                    {form.Field({
                      name: "twitter",
                      children: (field) => (
                        <input
                          id="twitter"
                          name={field.name}
                          type="url"
                          className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                          placeholder="https://twitter.com/yourusername"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      ),
                    })}
                  </div>
                </div>
              </div>

              {/* Pool Parameters Section 
              <div className="bg-white/5 rounded-xl p-8 backdrop-blur-sm border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Pool Parameters</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => setShowCurveConfig(true)}
                    className="text-indigo-400 hover:text-indigo-200 text-sm"
                  >
                    Advanced Curve Options
                  </button>
                </div>
              </div>
              */}

              {form.state.errors && form.state.errors.length > 0 && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 space-y-2">
                  {form.state.errors.map((error, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <p className="text-red-200">
                        {typeof error === 'string' ? error : 'Please fix the errors above'}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <SubmitButton isSubmitting={isLoading} />
              </div>
            </form>
          )}
        </main>
      </div>
    </>
  );
}

const SubmitButton = ({ isSubmitting }: { isSubmitting: boolean }) => {
  const { publicKey } = useWallet();
  const unifiedLogic = useUnifiedWallet();
  console.log('SubmitButton render: publicKey=', publicKey);
  console.log('SubmitButton render: window.tknz=', typeof window !== 'undefined' && !!window.tknz);

  if (!publicKey) {
    const onClick = () => {
      unifiedLogic.select('Tknz Extension' as any);
      unifiedLogic.connect().catch((err) => {
        console.error('unified connect error:', err);
        if (err.message?.includes('Redirecting to Chrome Web Store')) {
          toast.info('Opening Chrome Web Store to install TKNZ extension...');
        } else {
          toast.error(err.message || 'Failed to connect wallet');
        }
      });
    };
    return (
      <Button type="button" onClick={onClick}>
        <span>Connect Wallet</span>
      </Button>
    );
  }

  return (
    <Button
      className="flex items-center gap-2"
      type="submit"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <span className="iconify ph--spinner w-5 h-5 animate-spin" />
          <span>Creating Pool...</span>
        </>
      ) : (
        <>
          <span className="iconify ph--rocket-bold w-5 h-5" />
          <span>Launch Pool</span>
        </>
      )}
    </Button>
  );
};

const PoolCreationSuccess = () => {
  return (
    <>
      <div className="bg-white/5 rounded-xl p-8 backdrop-blur-sm border border-white/10 text-center">
        <div className="bg-green-500/20 p-4 rounded-full inline-flex mb-6">
          <span className="iconify ph--check-bold w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Pool Created Successfully!</h2>
        <p className="text-gray-300 mb-8 max-w-lg mx-auto">
          Your token pool has been created and is now live on the Virtual Curve
          platform. Users can now buy and trade your tokens.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-white/10 px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition"
          >
            Explore Pools
          </Link>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="cursor-pointer bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 rounded-xl font-medium hover:opacity-90 transition"
          >
            Create Another Pool
          </button>
        </div>
      </div>
    </>
  );
};
