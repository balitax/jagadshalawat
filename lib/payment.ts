export type MethodType = "bank_transfer" | "emoney" | "va";

export interface PaymentChannel {
  id: string;
  type: MethodType;
  label: string;
  name: string;
  reference: string;
  holder?: string | null;
  note?: string | null;
  bankPrefix?: string | null;
  accent: string;
}

export const METHOD_LABELS: Record<MethodType, string> = {
  bank_transfer: "Transfer Bank",
  emoney: "E-money",
  va: "Virtual Account",
};
