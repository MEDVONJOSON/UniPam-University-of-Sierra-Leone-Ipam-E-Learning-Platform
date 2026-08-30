import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, Clock, Users, BookOpen, GraduationCap,
  Briefcase, Building2, CheckCircle2, Award, Loader2, ArrowRight,
  FileText, Star, Globe
} from "lucide-react";
import { universityService } from "../services/universityService";

const LEVEL_COLORS = {
  "Degree":       "bg-brand-50 text-brand-700 border-brand-200",
  "Postgraduate": "bg-purple-50 text-purple-700 border-purple-200",
  "Diploma":      "bg-amber-50 text-amber-700 border-amber-200",
  "Certificate":  "bg-rose-50 text-rose-700 border-rose-200"
};

function IpamProgramPage() {
  const { facultySlug, programId } = useParams();
  const [prog, setProg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    universityService.getIpamProgramById(programId)
      .then(data => { if (alive) setProg(data); })
      .catch(() => { if (alive) setError("Programme not found."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [programId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error || !prog) {
    return (
      <div className="text-center py-32 space-y-4">
        <p className="text-slate-500">{error || "Programme not found."}</p>
        <Link to={`/ipam/${facultySlug}`} className="text-brand-600 font-black text-sm uppercase tracking-widest">
          ← Back to Faculty
        </Link>
      </div>
    );
  }

  const levelStyle = LEVEL_COLORS[prog.level] || "bg-slate-50 text-slate-700 border-slate-200";
  const hasTuition = prog.tuition && Object.keys(prog.tuition).length > 0;
  const hasCareerAreas = Array.isArray(prog.career_areas) && prog.career_areas.length > 0;

  return (
    <div className="space-y-10 pb-24">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 font-black uppercase tracking-widest pt-4 flex-wrap">
        <Link to="/ipam" className="hover:text-[#0B5E3C] transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> IPAM
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {facultySlug && (
          <>
            <Link to={`/ipam/${facultySlug}`} className="hover:text-[#0B5E3C] transition-colors">
              {prog.faculty_name || facultySlug}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-[#0B5E3C] truncate max-w-xs">{prog.name}</span>
      </nav>

      {/* ── Hero Card ── */}
      <section className="bg-[#0B5E3C] rounded-[3rem] p-12 lg:p-16 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 max-w-4xl">
          {/* Level badge */}
          <span className={`inline-block text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border mb-6 ${levelStyle}`}>
            {prog.level}
          </span>
          <h1 className="text-3xl sm:text-5xl font-[900] uppercase tracking-tight leading-tight mb-8">
            {prog.name}
          </h1>

          {/* Quick facts */}
          <div className="flex flex-wrap gap-4">
            {prog.duration && (
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-xl border border-white/20">
                <Clock className="w-4 h-4 text-brand-300" />
                <span className="text-xs font-black uppercase tracking-widest">{prog.duration}</span>
              </div>
            )}
            {prog.mode && (
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-xl border border-white/20">
                <Globe className="w-4 h-4 text-brand-300" />
                <span className="text-xs font-black uppercase tracking-widest">{prog.mode}</span>
              </div>
            )}
            {prog.faculty_name && (
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-xl border border-white/20">
                <Building2 className="w-4 h-4 text-brand-300" />
                <span className="text-xs font-black uppercase tracking-widest">{prog.faculty_name}</span>
              </div>
            )}
            {prog.department_name && (
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-xl border border-white/20">
                <GraduationCap className="w-4 h-4 text-brand-300" />
                <span className="text-xs font-black uppercase tracking-widest">{prog.department_name}</span>
              </div>
            )}
            {prog.status && (
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-xl border border-white/20">
                <Star className="w-4 h-4 text-brand-300" />
                <span className="text-xs font-black uppercase tracking-widest">{prog.status}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main Content ── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          {prog.description && (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 lg:p-10 shadow-sm">
              <h2 className="text-xl font-black text-[#0B5E3C] uppercase tracking-tight mb-5 flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-600" />
                Programme Overview
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium text-base">{prog.description}</p>
            </div>
          )}

          {/* Career Areas */}
          {hasCareerAreas && (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 lg:p-10 shadow-sm">
              <h2 className="text-xl font-black text-[#0B5E3C] uppercase tracking-tight mb-6 flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-emerald-600" />
                Career Opportunities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {prog.career_areas.map((career, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-800">{career}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Entry Requirements */}
          {prog.entry_requirements && (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 lg:p-10 shadow-sm">
              <h2 className="text-xl font-black text-[#0B5E3C] uppercase tracking-tight mb-5 flex items-center gap-3">
                <Award className="w-5 h-5 text-amber-500" />
                Entry Requirements
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium">{prog.entry_requirements}</p>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">
          {/* Apply CTA */}
          <div className="bg-[#0B5E3C] rounded-3xl p-8 text-white text-center">
            <GraduationCap className="w-10 h-10 mx-auto mb-4 text-brand-300" />
            <h3 className="text-lg font-black uppercase tracking-tight mb-3">Start Your Journey</h3>
            <p className="text-brand-100 text-sm font-medium mb-6">Apply online through the IPAM admissions portal.</p>
            <Link
              to="/register"
              className="block w-full py-4 bg-white text-[#0B5E3C] rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-50 transition-all shadow-xl mb-3"
            >
              Apply Now
            </Link>
            <Link
              to="/contact"
              className="block w-full py-4 border border-white/30 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all"
            >
              Enquire
            </Link>
          </div>

          {/* Programme Info */}
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5">
            <h3 className="text-base font-black text-[#0B5E3C] uppercase tracking-tight">Programme Details</h3>
            {[
              { label: "Level", value: prog.level, icon: Award },
              { label: "Duration", value: prog.duration, icon: Clock },
              { label: "Mode", value: prog.mode || "In person", icon: Globe },
              { label: "Faculty", value: prog.faculty_name, icon: Building2 },
              { label: "Department", value: prog.department_name, icon: Users }
            ].filter(d => d.value).map((d, i) => {
              const DIcon = d.icon;
              return (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <DIcon className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.label}</p>
                    <p className="font-bold text-slate-700">{d.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tuition */}
          {hasTuition && (
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
              <h3 className="text-base font-black text-[#0B5E3C] uppercase tracking-tight mb-5">Indicative Tuition</h3>
              <div className="space-y-3">
                {Object.entries(prog.tuition).map(([year, fee]) => (
                  <div key={year} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{year}</span>
                    <span className="text-sm font-black text-[#0B5E3C]">{fee}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-3">Fees are indicative and subject to change. Contact admissions for current rates.</p>
            </div>
          )}

          {/* Back Link */}
          <Link
            to={`/ipam/${facultySlug}`}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0B5E3C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to {prog.faculty_name || "Faculty"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default IpamProgramPage;
