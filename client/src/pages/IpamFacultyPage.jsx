import { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, BookOpen, Search, Filter, Clock, Users, Award,
  Calculator, Cpu, Briefcase, Scale, BookMarked, GraduationCap,
  Building2, ChevronRight, ArrowRight, Loader2
} from "lucide-react";
import { universityService } from "../services/universityService";

const FACULTY_META = {
  "accounting-finance":              { icon: Calculator,  color: "from-emerald-600 to-teal-700",    bg: "bg-emerald-50",   text: "text-emerald-700",  border: "border-emerald-200" },
  "info-systems-tech":               { icon: Cpu,         color: "from-blue-600 to-indigo-700",     bg: "bg-blue-50",      text: "text-blue-700",     border: "border-blue-200" },
  "business-admin-entrepreneurship": { icon: Briefcase,   color: "from-amber-500 via-yellow-500 to-amber-600",    bg: "bg-amber-50",     text: "text-amber-800",    border: "border-amber-300" },
  "leadership-governance":           { icon: Scale,       color: "from-[#85754E] via-[#6B5E3C] to-[#4F462B]",   bg: "bg-[#F5F2EB]",    text: "text-[#5C4F3D]",   border: "border-[#D9D1C3]" },
  "extra-mural-studies":             { icon: BookMarked,  color: "from-rose-600 to-pink-700",       bg: "bg-rose-50",      text: "text-rose-700",     border: "border-rose-200" }
};

const LEVEL_COLORS = {
  "Degree":       "bg-brand-50 text-brand-700 border-brand-200",
  "Postgraduate": "bg-purple-50 text-purple-700 border-purple-200",
  "Diploma":      "bg-amber-50 text-amber-700 border-amber-200",
  "Certificate":  "bg-rose-50 text-rose-700 border-rose-200"
};

function IpamFacultyPage() {
  const { facultySlug } = useParams();
  const navigate = useNavigate();

  const [faculty, setFaculty] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");

    Promise.all([
      universityService.getIpamFaculties(),
      universityService.getIpamPrograms()
    ])
      .then(([faculties, allProgs]) => {
        if (!alive) return;
        const fac = (faculties || []).find(f => f.slug === facultySlug);
        if (!fac) { setError("Faculty not found."); setLoading(false); return; }
        setFaculty(fac);
        const progs = (allProgs || []).filter(p => p.faculty_slug === facultySlug || p.faculty_id === fac.id);
        setProgrammes(progs);
        return universityService.getIpamDepartments(fac.id);
      })
      .then(depts => {
        if (alive && depts) setDepartments(depts);
      })
      .catch(() => { if (alive) setError("Failed to load faculty data."); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [facultySlug]);

  const levels = useMemo(() => {
    const unique = [...new Set(programmes.map(p => p.level).filter(Boolean))];
    return ["all", ...unique];
  }, [programmes]);

  const filtered = useMemo(() => {
    return programmes.filter(p => {
      const q = search.trim().toLowerCase();
      const lvl = levelFilter === "all" || p.level === levelFilter;
      const sq = !q || (p.name || "").toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q);
      return lvl && sq;
    });
  }, [programmes, search, levelFilter]);

  const meta = FACULTY_META[facultySlug] || { icon: BookOpen, color: "from-slate-600 to-slate-700", bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" };
  const Icon = meta.icon;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error || !faculty) {
    return (
      <div className="text-center py-32 space-y-4">
        <p className="text-slate-500">{error || "Faculty not found."}</p>
        <Link to="/ipam" className="text-brand-600 font-black text-sm uppercase tracking-widest">← Back to IPAM</Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 font-black uppercase tracking-widest pt-4">
        <Link to="/ipam" className="hover:text-[#0B5E3C] transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> IPAM
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#0B5E3C]">{faculty.name}</span>
      </nav>

      {/* ── Faculty Header ── */}
      <section className={`relative bg-gradient-to-br ${meta.color} rounded-[3rem] p-12 lg:p-16 text-white overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="relative z-10 max-w-3xl">
          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
            <Icon className="w-8 h-8" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-3">IPAM Faculty</p>
          <h1 className="text-3xl sm:text-5xl font-[900] uppercase tracking-tight leading-tight mb-6">
            {faculty.name}
          </h1>
          <p className="text-white/80 text-lg leading-relaxed font-medium">{faculty.description}</p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 mt-8">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
              <BookOpen className="w-4 h-4 text-white/70" />
              <span className="text-xs font-black uppercase tracking-widest">{faculty.programme_count} Programmes</span>
            </div>
            {departments.length > 0 && (
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                <Building2 className="w-4 h-4 text-white/70" />
                <span className="text-xs font-black uppercase tracking-widest">{departments.length} Department{departments.length !== 1 ? "s" : ""}</span>
              </div>
            )}
            {faculty.dean && (
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                <Users className="w-4 h-4 text-white/70" />
                <span className="text-xs font-black uppercase tracking-widest">Dean: {faculty.dean}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Departments ── */}
      {departments.length > 0 && (
        <section>
          <h2 className="text-lg font-black text-[#0B5E3C] uppercase tracking-tight mb-4">Departments</h2>
          <div className="flex flex-wrap gap-3">
            {departments.map(dept => (
              <div key={dept.id} className={`flex items-center gap-2 px-4 py-2.5 ${meta.bg} ${meta.text} border ${meta.border} rounded-xl`}>
                <Building2 className="w-3.5 h-3.5" />
                <span className="text-[11px] font-black uppercase tracking-widest">{dept.name}</span>
                {dept.hod && <span className="text-[10px] opacity-70">· HoD: {dept.hod}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Programme Filter Bar ── */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search programmes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B5E3C]/20 focus:border-[#0B5E3C] transition-all bg-white"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          {levels.map(lv => (
            <button
              key={lv}
              onClick={() => setLevelFilter(lv)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                levelFilter === lv
                  ? "bg-[#0B5E3C] text-white border-transparent shadow-md"
                  : "bg-white text-slate-500 border-slate-200 hover:border-[#0B5E3C] hover:text-[#0B5E3C]"
              }`}
            >
              {lv === "all" ? `All (${programmes.length})` : `${lv} (${programmes.filter(p => p.level === lv).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Programme List ── */}
      <section>
        <h2 className="text-2xl font-[900] text-[#0B5E3C] uppercase tracking-tight mb-6">
          Programmes
          <span className="ml-3 text-base font-black text-slate-400">({filtered.length})</span>
        </h2>
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No programmes match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(prog => (
              <Link
                key={prog.id}
                to={`/ipam/${facultySlug}/${prog.id}`}
                className="group bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-black text-[#0B5E3C] uppercase tracking-tight leading-tight group-hover:text-emerald-700 transition-colors">
                    {prog.name}
                  </h3>
                  <span className={`flex-shrink-0 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${LEVEL_COLORS[prog.level] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                    {prog.level}
                  </span>
                </div>

                {prog.description && (
                  <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-2">{prog.description}</p>
                )}

                <div className="flex items-center gap-4 mt-auto pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {prog.duration}
                  </div>
                  {prog.mode && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      {prog.mode}
                    </div>
                  )}
                  <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-[#0B5E3C] flex items-center gap-1 group-hover:gap-2 transition-all">
                    Details <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section className="bg-slate-50 border border-slate-200 rounded-[3rem] p-12 text-center">
        <h3 className="text-2xl font-[900] text-[#0B5E3C] uppercase tracking-tight mb-4">Ready to Apply?</h3>
        <p className="text-slate-600 font-medium mb-8 max-w-xl mx-auto">
          Join the {faculty.name} faculty at IPAM. Contact our admissions team to get started with your application.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <Link to="/register" className="px-8 py-4 bg-[#0B5E3C] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-xl">
            Apply Now
          </Link>
          <Link to="/contact" className="px-8 py-4 border-2 border-slate-200 text-[#0B5E3C] rounded-2xl font-black uppercase tracking-widest hover:border-[#0B5E3C] transition-all">
            Contact Admissions
          </Link>
        </div>
      </section>
    </div>
  );
}

export default IpamFacultyPage;
