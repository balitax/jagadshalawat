export type MethodType = "bank_transfer" | "emoney" | "va";

export interface PaymentChannel {
  id: string;
  type: MethodType;
  label: string;
  name: string;
  reference: string;
  holder?: string;
  note?: string;
  bankPrefix?: string;
  accent: string;
}

export const CHANNELS: Record<MethodType, PaymentChannel[]> = {
  bank_transfer: [
    {
      id: "bsi",
      type: "bank_transfer",
      label: "Bank Transfer",
      name: "Bank Syariah Indonesia",
      reference: "1117230606",
      holder: "Achmad Jafar Al Kadafi",
      bankPrefix: "BSI",
      accent: "from-emerald-500/20 to-emerald-500/5",
    },
  ],
  emoney: [
    {
      id: "ovo-dana",
      type: "emoney",
      label: "E-money",
      name: "OVO / DANA",
      reference: "085755322554",
      holder: "Achmad Jafar Al Kadafi",
      bankPrefix: "E-Wallet",
      accent: "from-amber-500/20 to-amber-500/5",
    },
  ],
  va: [
    {
      id: "bca",
      type: "va",
      label: "Virtual Account",
      name: "Bank Central Asia",
      reference: "3901085755322554",
      bankPrefix: "BCA",
      accent: "from-blue-500/20 to-blue-500/5",
    },
    {
      id: "bri",
      type: "va",
      label: "Virtual Account",
      name: "Bank Rakyat Indonesia",
      reference: "88810085755322554",
      note: "Hanya aktif pukul 00.30–21.30 WIB.",
      bankPrefix: "BRI",
      accent: "from-sky-500/20 to-sky-500/5",
    },
    {
      id: "mandiri",
      type: "va",
      label: "Virtual Account",
      name: "Bank Mandiri",
      reference: "89508085755322554",
      bankPrefix: "Mandiri",
      accent: "from-yellow-500/20 to-yellow-500/5",
    },
    {
      id: "btn",
      type: "va",
      label: "Virtual Account",
      name: "Bank Tabungan Negara",
      reference: "8528085755322554",
      bankPrefix: "BTN",
      accent: "from-orange-500/20 to-orange-500/5",
    },
  ],
};

export const METHOD_LABELS: Record<MethodType, string> = {
  bank_transfer: "Transfer Bank",
  emoney: "E-money",
  va: "Virtual Account",
};

export function getChannel(id: string): PaymentChannel | undefined {
  return (Object.values(CHANNELS) as PaymentChannel[][]).flat().find((c) => c.id === id);
}
