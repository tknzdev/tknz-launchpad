// Type definitions for TKNZ extension API injected into the page
interface TknzExtension {
  initTokenCreate(options: {
    name: string;
    ticker: string;
    description: string;
    imageUrl: string;
    websiteUrl?: string;
    twitter?: string;
    telegram?: string;
    investmentAmount?: number;
  }): void;
  connect(): void;
  signTransaction(transaction: string): void;
  signAllTransactions(transactions: string[]): void;
  signMessage(message: string): void;
  getPublicKey(): void;
}

declare global {
  interface Window {
    tknz?: TknzExtension;
  }
}