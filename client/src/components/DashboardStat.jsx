import { Link } from "react-router-dom";

function DashboardStat({ icon: Icon, value, suffix, label, linkText, linkTo, color }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200/80 shadow-sm flex flex-col items-center justify-center text-center group hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0B5E3C] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5 text-emerald-700" />
        </div>
      )}
      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{label}</div>
      <div className="text-4xl sm:text-5xl font-[900] text-[#0B5E3C] mb-3">
        {value}
        {suffix && <span className="text-sm font-bold text-slate-400 ml-1 align-middle">{suffix}</span>}
      </div>
      {linkText && (
        <Link to={linkTo} className={`text-[10px] font-black uppercase tracking-widest ${color || 'text-[#0B5E3C]'} hover:text-emerald-700 hover:underline underline-offset-4 transition-colors`}>
          {linkText}
        </Link>
      )}
    </div>
  );
}

export default DashboardStat;
