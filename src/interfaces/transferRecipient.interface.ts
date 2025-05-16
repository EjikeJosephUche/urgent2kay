export interface IBulkTransfer {
  currency: string;
  source: string;
  transfers: ITransferRecipient[];
}

export interface ITransferRecipient {
  name: string;
  accountNumber: string;
  bankCode: string;
  amount: number;
  reason?: string;
  recipientCode?: string;
  transferCode?: string;
  status?: "pending" | "success" | "failed";
}
