import { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { z } from "zod";
import Header from "../components/Header";
import CurveConfigPanel from "../components/CurveConfigPanel";

import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Keypair, VersionedTransaction, Connection } from "@solana/web3.js";
import { useUnifiedWalletContext, useWallet } from "@jup-ag/wallet-adapter";
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
});

interface CreateMeteoraTokenResponse {
  transactions: string[];
  mint: string;
  ata: string;
  metadataUri: string;
  pool: string;
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
}

interface FormValues {
  tokenName: string;
  tokenSymbol: string;
  tokenLogo: File | undefined;
  website?: string;
  twitter?: string;
}

export default function CreatePool() {
  const { publicKey, signTransaction } = useWallet();
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);
  const { connection, setShowModal } = useUnifiedWalletContext();

  const [isLoading, setIsLoading] = useState(false);
  const [poolCreated, setPoolCreated] = useState(false);
  const [previewData, setPreviewData] = useState<
    (CreateMeteoraTokenResponse & { payload: any }) | null
  >(null);
  // Initial pool parameters
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [buyAmount, setBuyAmount] = useState<number>(0);
  // Advanced curve configuration
  const [showCurveConfig, setShowCurveConfig] = useState<boolean>(false);
  const [curveConfigOverrides, setCurveConfigOverrides] = useState<
    Record<string, any>
  >({});

  const form = useForm({
    defaultValues: {
      tokenName: "",
      tokenSymbol: "",
      tokenLogo: undefined,
      website: "",
      twitter: "",
    } as FormValues,
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        if (!signTransaction) {
          toast.error("Wallet not connected");
          return;
        }
        if (!value.tokenLogo) {
          toast.error("Token logo is required");
          return;
        }
        const reader = new FileReader();
        const imageUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(value.tokenLogo!);
        });
        // Build portal parameters: initial deposit, initial swap, plus optional curve overrides
        const portalParams: Record<string, any> = {
          amount: investmentAmount,
          buyAmount: buyAmount,
          priorityFee: 0,
        };
        if (Object.keys(curveConfigOverrides).length > 0) {
          portalParams.curveConfig = curveConfigOverrides;
        }
        const payload = {
          walletAddress: address,
          token: {
            name: value.tokenName,
            ticker: value.tokenSymbol,
            description: value.tokenName,
            websiteUrl: value.website || undefined,
            twitter: value.twitter || undefined,
            imageUrl,
          },
          isLockLiquidity: false,
          portalParams,
        };
        const res = await fetch(
          "https://tknz.fun/.netlify/functions/create-token-meteora",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Preview failed");
        }
        const data: CreateMeteoraTokenResponse = await res.json();
        setPreviewData({ ...data, payload });
      } catch (err: any) {
        console.error("Error previewing pool creation:", err);
        toast.error(err.message || "Failed to preview pool creation");
        setIsLoading(false);
      }
    },
    validators: {
      onSubmit: poolSchema,
    },
  });

  // Execute previewed transactions, then call confirm and notify endpoints
  const handleConfirm = async () => {
    if (!previewData) return;
    setIsLoading(true);
    try {
      // Sign and submit each VersionedTransaction
      for (const b64 of previewData.transactions) {
        const tx = VersionedTransaction.deserialize(Buffer.from(b64, "base64"));
        // Preserve any server-side signatures and append wallet signature
        const signedTx = await signTransaction(tx);
        const ourSig = signedTx.signatures.find((s) =>
          s.publicKey.equals(publicKey!),
        )?.signature;
        if (ourSig) tx.addSignature(publicKey!, ourSig);
        const raw = tx.serialize();
        const sig = await connection.sendRawTransaction(raw);
        await connection.confirmTransaction(sig, "confirmed");
      }
      // Confirm on backend
      const confirmUrl =
        "https://tknz.fun/.netlify/functions/confirm-token-creation";
      const confirmRes = await fetch(confirmUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...previewData.payload, ...previewData }),
      });
      const confirmJson = await confirmRes.json();
      // Notify backend
      const notifyUrl =
        "https://tknz.fun/.netlify/functions/notify-token-creation";
      await fetch(notifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...previewData.payload,
          ...previewData,
          createdAt: confirmJson.createdAt,
        }),
      });
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
        <title>Create Pool - Virtual Curve</title>
        <meta
          name="description"
          content="Create a new token pool on Virtual Curve with customizable price curves."
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
              <h1 className="text-4xl font-bold mb-2">Create Pool</h1>
              <p className="text-gray-300">
                Launch your token with a customizable price curve
              </p>
            </div>
          </div>

          {poolCreated && !isLoading ? (
            <PoolCreationSuccess />
          ) : previewData ? (
            <div className="space-y-8">
              <div className="bg-white/5 rounded-xl p-8 backdrop-blur-sm border border-white/10">
                <h2 className="text-2xl font-bold mb-4">
                  Preview Pool Creation
                </h2>
                <p>Deposit SOL: {previewData.depositSol}</p>
                {previewData.buySol > 0 && (
                  <p>Purchase SOL: {previewData.buySol}</p>
                )}
                <div className="mt-6 flex gap-4 justify-end">
                  <Button onClick={handleConfirm} disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Confirm & Launch Pool"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setPreviewData(null)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
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
                      ),
                    })}
                  </div>
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

              {/* Pool Parameters Section */}
              <div className="bg-white/5 rounded-xl p-8 backdrop-blur-sm border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Pool Parameters</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="initialInvestment"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Initial Investment (SOL)
                    </label>
                    <input
                      id="initialInvestment"
                      type="number"
                      step="0.01"
                      min="0"
                      value={investmentAmount}
                      onChange={(e) =>
                        setInvestmentAmount(parseFloat(e.target.value) || 0)
                      }
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="initialSwap"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Initial Swap (SOL)
                    </label>
                    <input
                      id="initialSwap"
                      type="number"
                      step="0.01"
                      min="0"
                      value={buyAmount}
                      onChange={(e) =>
                        setBuyAmount(parseFloat(e.target.value) || 0)
                      }
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                    />
                  </div>
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

              {form.state.errors && form.state.errors.length > 0 && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 space-y-2">
                  {form.state.errors.map((error, index) =>
                    Object.entries(error || {}).map(([, value]) => (
                      <div key={index} className="flex items-start gap-2">
                        <p className="text-red-200">
                          {value.map((v) => v.message).join(", ")}
                        </p>
                      </div>
                    )),
                  )}
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
  const { setShowModal } = useUnifiedWalletContext();

  if (!publicKey) {
    return (
      <Button type="button" onClick={() => setShowModal(true)}>
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
            href="/explore-pools"
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
