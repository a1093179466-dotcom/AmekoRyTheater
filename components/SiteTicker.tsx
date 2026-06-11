import { getSiteSetting } from "@/lib/siteSetting";

export default async function SiteTicker() {
  const setting = await getSiteSetting();

  if (!setting.tickerEnabled || !setting.tickerText.trim()) {
    return null;
  }

  return (
    <section className="border-y border-white/10 bg-white/[0.04] py-3">
      <div className="mx-auto max-w-7xl overflow-hidden px-6">
        <div className="ameko-marquee whitespace-nowrap text-sm text-rose-100">
          {setting.tickerText}
        </div>
      </div>
    </section>
  );
}