const BADGE_TONE = {
  brand: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  gold: "bg-amber-50 text-amber-700 border border-amber-200"
};

function InfoCard({ icon: Icon, title, subtitle, tone = "brand", dark = false, rotate = "" }) {
  return (
    <div
      className={`p-5 rounded-3xl shadow-lg border transition-all duration-500 hover:rotate-0 hover:shadow-xl ${rotate} ${
        dark ? "bg-[#0B5E3C] border-emerald-900 text-white" : "bg-white border-slate-200/90"
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${dark ? "bg-white/15 text-amber-400" : BADGE_TONE[tone] || BADGE_TONE.brand}`}>
        <Icon className={`w-5 h-5 ${dark ? "text-amber-400" : tone === "gold" ? "text-amber-600" : "text-emerald-700"}`} />
      </div>
      <p className={`font-black text-sm uppercase tracking-tight leading-tight ${dark ? "text-white" : "text-[#0B5E3C]"}`}>{title}</p>
      <p className={`text-xs font-semibold mt-1 ${dark ? "text-emerald-100" : "text-slate-500"}`}>{subtitle}</p>
    </div>
  );
}

export default InfoCard;
