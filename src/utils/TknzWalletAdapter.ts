import {
  BaseWalletAdapter,
  WalletError,
  WalletReadyState,
  type WalletName,
} from '@solana/wallet-adapter-base';

import {
  PublicKey,
  Transaction,
  VersionedTransaction,
  Connection,
  type SendOptions,
  type TransactionSignature,
} from '@solana/web3.js';

import { Buffer } from 'buffer';

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

/** Casts a literal string to the branded `WalletName` type expected by the
 * `@solana/wallet-adapter` packages. This is purely a compile-time construct –
 * the runtime value remains the same string. */
const brandedName = <T extends string>(name: T) => name as WalletName<T>;

// -----------------------------------------------------------------------------
// Adapter implementation
// -----------------------------------------------------------------------------

const WALLET_NAME = brandedName('Tknz Extension');

/**
 * Wallet adapter that bridges the `window.tknz` SDK injected by the TKNZ
 * browser extension to the Solana wallet-adapter interface used by the
 * Launchpad. Only the capabilities currently required by the dApp have been
 * implemented – namely connect/disconnect, transaction signing and
 * transmission.
 */
export class TknzWalletAdapter extends BaseWalletAdapter<'Tknz Extension'> {
  // -------------------------------------------------------------------------
  // Static descriptors
  // -------------------------------------------------------------------------

  name = WALLET_NAME;
  url = 'https://chrome.google.com/webstore/detail/tknz/eejballiemiamlndhkblapmlmjdgaaoi';
  icon = 'https://raw.githubusercontent.com/tknz/brand/main/icon-128.png';

  /**
   * Determines availability. We return Loadable when the SDK is not yet injected
   * to allow connect() to poll and wait for the extension injection.
   */
  get readyState(): WalletReadyState {
    if (typeof window === 'undefined') return WalletReadyState.Unsupported;
    // If SDK is injected, treat as Installed; otherwise Loadable to enable polling in connect()
    return (window as any).tknz
      ? WalletReadyState.Installed
      : WalletReadyState.Loadable;
  }

  // -------------------------------------------------------------------------
  // Runtime state
  // -------------------------------------------------------------------------

  private _publicKey: PublicKey | null = null;
  private _connecting = false;

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  /**
   * The launchpad currently only sends legacy transactions. If support for
   * versioned transactions is required in the future this can be updated to
   * `[0]`.
   */
  supportedTransactionVersions = undefined;

  // -------------------------------------------------------------------------
  // Adapter API
  // -------------------------------------------------------------------------

  async connect(): Promise<void> {
    if (this.connected || this.connecting) return;

    if (this.readyState === WalletReadyState.Unsupported) {
      throw new WalletError('Tknz wallet is not supported in this environment');
    }

    this._connecting = true;

    // Wait for the extension SDK to be injected into the page (max 5s)
    const maxWaitMs = 5000;
    const pollIntervalMs = 50;
    const startTime = Date.now();
    while (!(window as any).tknz && Date.now() - startTime < maxWaitMs) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => setTimeout(res, pollIntervalMs));
    }
    if (!(window as any).tknz) {
      this._connecting = false;
      throw new WalletError('Tknz wallet extension not detected');
    }

    const { success, publicKey } = await new Promise<{
      success: boolean;
      publicKey?: string;
    }>((resolve) => {
      let timeoutId: number;
      const handler = (e: MessageEvent) => {
        if (e.data?.source === 'tknz' && e.data.type === 'CONNECT_RESPONSE') {
          window.removeEventListener('message', handler);
          clearTimeout(timeoutId);
          resolve({ success: e.data.success, publicKey: e.data.publicKey });
        }
      };
      window.addEventListener('message', handler);

      // Trigger handshake via injected SDK.
      (window as any).tknz?.connect();

      // Fallback timeout to ensure connect() always resolves
      timeoutId = window.setTimeout(() => {
        window.removeEventListener('message', handler);
        resolve({ success: false });
      }, 5000);
    });

    if (!success || !publicKey) {
      this._connecting = false;
      throw new WalletError('Failed to connect to Tknz wallet');
    }

    try {
      this._publicKey = new PublicKey(publicKey);
      this.emit('connect', this._publicKey);
    } catch (err) {
      this._connecting = false;
      throw new WalletError('Invalid public key returned by Tknz wallet');
    }

    this._connecting = false;
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;
    this._publicKey = null;
    this.emit('disconnect');
  }

  async sendTransaction(
    transaction: Transaction,
    connection: Connection,
    options: SendOptions = {},
  ): Promise<TransactionSignature> {
    const signed = (await this.signTransaction(transaction)) as Transaction;
    return connection.sendRawTransaction(signed.serialize(), options);
  }

  async signTransaction(tx: Transaction): Promise<Transaction> {
    const raw = tx.serialize({ requireAllSignatures: false });
    const base64 = Buffer.from(raw).toString('base64');

    return new Promise<Transaction>((resolve, reject) => {
      const handler = (e: MessageEvent) => {
        if (e.data?.source === 'tknz' && e.data.type === 'SIGN_TRANSACTION_RESPONSE') {
          window.removeEventListener('message', handler);

          if (!e.data.signedTransaction) {
            reject(new WalletError('No signed transaction returned by wallet'));
            return;
          }

          try {
            const signed = VersionedTransaction.deserialize(Buffer.from(e.data.signedTransaction, 'base64'));
            // Cast because wallet-adapter expects the legacy Transaction type.
            resolve(signed as unknown as Transaction);
          } catch (err) {
            reject(new WalletError('Failed to deserialize signed transaction'));
          }
        }
      };

      window.addEventListener('message', handler);
      (window as any).tknz?.signTransaction(base64);
    });
  }

  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    const serialized = txs.map((tx) => Buffer.from(tx.serialize({ requireAllSignatures: false })).toString('base64'));

    return new Promise<Transaction[]>((resolve, reject) => {
      const handler = (e: MessageEvent) => {
        if (e.data?.source === 'tknz' && e.data.type === 'SIGN_ALL_TRANSACTIONS_RESPONSE') {
          window.removeEventListener('message', handler);

          if (!Array.isArray(e.data.signedTransactions)) {
            reject(new WalletError('No signed transactions returned by wallet'));
            return;
          }

          try {
            const signed = e.data.signedTransactions.map((b64: string) =>
              VersionedTransaction.deserialize(Buffer.from(b64, 'base64')) as unknown as Transaction,
            );
            resolve(signed);
          } catch {
            reject(new WalletError('Failed to deserialize signed transactions'));
          }
        }
      };

      window.addEventListener('message', handler);
      (window as any).tknz?.signAllTransactions(serialized);
    });
  }
}

// -----------------------------------------------------------------------------
// Global augmentation – make TypeScript aware of the injected SDK so that
// `window.tknz` accesses do not raise type-checking errors elsewhere.
// -----------------------------------------------------------------------------

declare global {
  interface Window {
    tknz?: {
      connect(): void;
      signTransaction(tx: string): void;
      signAllTransactions(txs: string[]): void;
      signMessage(msg: string): void;
      getPublicKey(): void;
      initTokenCreate(coin: any): void;
    };
  }
}
