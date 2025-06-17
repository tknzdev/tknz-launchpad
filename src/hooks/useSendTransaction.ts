import { useState } from "react";
import { toast } from "sonner";
import { useWallet } from "@jup-ag/wallet-adapter";
import { Buffer } from "buffer";
import {
  Connection,
  Keypair,
  Transaction,
  sendAndConfirmRawTransaction,
} from "@solana/web3.js";

type SendTransactionOptions = {
  onSuccess?: (signature: string) => void;
  onError?: (error: string) => void;
  additionalSigners?: Keypair[];
};

export function useSendTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const { publicKey, signTransaction } = useWallet();

  const sendTransaction = async (
    transaction: Transaction,
    connection: Connection,
    options: SendTransactionOptions = {},
  ) => {
    if (!publicKey || !signTransaction) {
      const walletError = new Error("Wallet not connected");
      setError(walletError);
      toast.error("Wallet not connected. Please connect your wallet.");
      options.onError?.(walletError.message);
      return null;
    }

    setIsLoading(true);
    setError(null);
    setSignature(null);

    try {
      // Prepare transaction

      transaction.feePayer = transaction.feePayer || publicKey;
      if (!transaction.recentBlockhash) {
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
      }

      // Simulate transaction
      const simulation = await connection.simulateTransaction(transaction);

      if (simulation.value.err) {
        throw new Error(
          `Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`,
        );
      }

      let txSignature: string | null = null;
      if (typeof window !== 'undefined' && window.tknz?.signTransaction) {
        // Serialize transaction to base64
        const raw = transaction.serialize({ requireAllSignatures: false });
        const txBase64 = Buffer.from(raw).toString('base64');
        // Request extension to sign
        window.tknz.signTransaction(txBase64);
        // Await response
        const signedBase64: string = await new Promise((resolve, reject) => {
          const handler = (event: MessageEvent) => {
            if (event.data?.source === 'tknz' && event.data.type === 'SIGN_TRANSACTION_RESPONSE') {
              window.removeEventListener('message', handler);
              if (event.data.signedTransaction) {
                resolve(event.data.signedTransaction as string);
              } else {
                reject(new Error('No signed transaction from extension'));
              }
            }
          };
          window.addEventListener('message', handler);
        });
        // Deserialize signed transaction and send
        const signedRaw = Buffer.from(signedBase64, 'base64');
        txSignature = await sendAndConfirmRawTransaction(connection, signedRaw, { commitment: 'confirmed' });
      } else {
        const signedTransaction = await signTransaction(transaction);
        if (options.additionalSigners) {
          options.additionalSigners.forEach((signer) => {
            transaction.sign(signer);
          });
        }
        txSignature = await sendAndConfirmRawTransaction(
          connection,
          signedTransaction.serialize(),
          { commitment: 'confirmed' },
        );
      }
      setSignature(txSignature);
      options.onSuccess?.(txSignature);
      return txSignature;
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error";
      options.onError?.(`Transaction failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendTransaction,
    isLoading,
    error,
    signature,
  };
}
