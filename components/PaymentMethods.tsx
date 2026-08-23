import { CHANNELS, METHOD_LABELS, MethodType } from "@/lib/payment";
import { CopyButton } from "./CopyButton";
import { SectionHeader } from "./SectionHeader";
import { CornerBrackets } from "./CornerBrackets";
import { Landmark, Wallet, Building2, AlertCircle } from "lucide-react";

const TYPE_ICONS: Record<MethodType, typeof Landmark> = {
  bank_transfer: Landmark,
  emoney: Wallet,
  va: Building2,
};

export function PaymentMethods() {
  return (
    <section id="rekening" className="shell scroll-mt-24 py-16 sm:py-24">
      <SectionHeader
        eyebrow="Rekening Kas & Acara"
        title="Salurkan"
        highlight="dengan amanah"
        subtitle="Pilih metode yang paling mudah bagi anda — transfer bank, e-money, atau virtual account dari bank terdekat."
      />

      <div className="mt-10 grid gap-5">
        {(Object.keys(CHANNELS) as MethodType[]).map((type) => {
          const Icon = TYPE_ICONS[type];
          const channels = CHANNELS[type];
          return (
            <div key={type} className="reveal">
              <div className="glass card-lift h-full rounded-3xl p-5 sm:p-6">
                <CornerBrackets />
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold-2">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-parchment">
                      {METHOD_LABELS[type]}
                    </h3>
                    <p className="text-xs text-parchment-3">
                      {channels.length} kanal tersedia
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {channels.map((ch) => (
                    <div
                      key={ch.id}
                      className={`card-lift rounded-2xl bg-gradient-to-br ${ch.accent} border border-white/5 p-4`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-parchment">
                            {ch.bankPrefix}
                          </p>
                          <p className="text-xs text-parchment-3">{ch.name}</p>
                        </div>
                        <CopyButton value={ch.reference} />
                      </div>
                      <p className="mt-3 break-all font-mono text-base font-semibold tracking-wider text-parchment sm:text-lg">
                        {ch.reference}
                      </p>
                      {ch.holder && (
                        <p className="mt-1 text-xs text-parchment-3">
                          a.n. {ch.holder}
                        </p>
                      )}
                      {ch.note && (
                        <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-200/80">
                          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          {ch.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="reveal mt-6 rounded-2xl border border-dashed border-gold/25 bg-gold/[0.03] p-4 text-center text-sm text-parchment-2">
        Bank lain? Hubungi pengurus untuk{" "}
        <span className="text-gold-2">request Virtual Account</span> yang sesuai.
      </div>
    </section>
  );
}
