import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  GraduationCap, Users, BookOpen, Building2, ArrowRight,
  Calculator, Cpu, Briefcase, Scale, BookMarked,
  MapPin, Target, Rocket, CheckCircle2, Award, Globe,
  Clock, Search, Filter, Sparkles, ChevronRight, History
} from "lucide-react";
import { universityService } from "../services/universityService";

// Faculty icon & styling metadata
const FACULTY_META = {
  "accounting-finance": { 
    id: "f1",
    name: "Accounting & Finance",
    slug: "accounting-finance",
    icon: Calculator,  
    color: "from-emerald-600 to-teal-700",    
    bg: "bg-emerald-50 text-emerald-700",   
    border: "border-emerald-200",
    programme_count: 8,
    dean: "Dr James Kollie",
    description: "Financial Accounting, Auditing, Taxation, Banking, Investment, Financial Services and Financial Economics."
  },
  "info-systems-tech": { 
    id: "f2",
    name: "Information Systems & Technology",
    slug: "info-systems-tech",
    icon: Cpu,         
    color: "from-blue-600 to-indigo-700",     
    bg: "bg-blue-50 text-blue-700",      
    border: "border-blue-200",
    programme_count: 3,
    description: "Responsible for IPAM's computing, information systems, networking, cybersecurity, web development and IT education."
  },
  "business-admin-entrepreneurship": { 
    id: "f3",
    name: "Business Administration & Entrepreneurship",
    slug: "business-admin-entrepreneurship",
    icon: Briefcase,   
    color: "from-amber-500 via-yellow-500 to-amber-600",    
    bg: "bg-amber-50 text-amber-800",     
    border: "border-amber-300",
    programme_count: 13,
    dean: "Dr Ernest Udeh",
    description: "Business management, entrepreneurship, human resources, procurement, logistics, marketing and project management."
  },
  "leadership-governance": { 
    id: "f4",
    name: "Leadership & Governance",
    slug: "leadership-governance",
    icon: Scale,       
    color: "from-[#85754E] via-[#6B5E3C] to-[#4F462B]",   
    bg: "bg-[#F5F2EB] text-[#5C4F3D]",    
    border: "border-[#D9D1C3]",
    programme_count: 7,
    description: "Public sector leadership, governance, public administration, public policy, development management and policy analysis."
  },
  "extra-mural-studies": { 
    id: "f5",
    name: "Extra-Mural Studies",
    slug: "extra-mural-studies",
    icon: BookMarked,  
    color: "from-rose-600 to-pink-700",       
    bg: "bg-rose-50 text-rose-700",      
    border: "border-rose-200",
    programme_count: 8,
    description: "Extending university learning into provincial communities through accredited professional diploma and certificate education."
  }
};

const STATS = [
  { value: "7,000+", label: "Students",        icon: Users },
  { value: "300+",   label: "Faculty Members", icon: GraduationCap },
  { value: "39",     label: "Programmes",      icon: BookOpen },
  { value: "5",      label: "Faculties",       icon: Building2 }
];

function IpamPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const levelParam = searchParams.get("level") || "all";
  const facultyParam = searchParams.get("faculty") || "accounting-finance";

  const [faculties, setFaculties] = useState(Object.values(FACULTY_META));
  const [allProgrammes, setAllProgrammes] = useState([]);
  const [selectedFacultySlug, setSelectedFacultySlug] = useState(facultyParam);
  const [levelFilter, setLevelFilter] = useState(levelParam);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([
      universityService.getIpamFaculties(),
      universityService.getIpamPrograms()
    ]).then(([facs, progs]) => {
      if (alive) {
        if (facs && facs.length > 0) setFaculties(facs);
        if (progs && progs.length > 0) setAllProgrammes(progs);
      }
    }).catch(() => {
      // Fallback works automatically
    }).finally(() => {
      if (alive) setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  // Sync with searchParams
  useEffect(() => {
    const lvl = searchParams.get("level");
    if (lvl) {
      setLevelFilter(lvl);
      const el = document.getElementById("programmes-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    const fac = searchParams.get("faculty");
    if (fac) setSelectedFacultySlug(fac);
  }, [searchParams]);

  const handleFacultySelect = (slug) => {
    setSelectedFacultySlug(slug);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set("faculty", slug);
      return next;
    });
    const el = document.getElementById("faculty-detail-viewer");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const handleLevelSelect = (lvl) => {
    setLevelFilter(lvl);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (lvl === "all") next.delete("level");
      else next.set("level", lvl);
      return next;
    });
  };

  const activeFaculty = useMemo(() => {
    return faculties.find(f => f.slug === selectedFacultySlug) || faculties[0];
  }, [faculties, selectedFacultySlug]);

  // When levelFilter is active from Explore menu (e.g. ?level=Degree),
  // user might want to see all programmes of that level, or programmes for the selected faculty.
  const isGlobalLevelView = levelFilter !== "all" && !searchParams.get("faculty");

  const displayedProgrammes = useMemo(() => {
    let list = allProgrammes;

    if (!isGlobalLevelView) {
      list = list.filter(p => p.faculty_slug === selectedFacultySlug || (activeFaculty && p.faculty_id === activeFaculty.id));
    }

    if (levelFilter !== "all") {
      if (levelFilter === "Degree") {
        list = list.filter(p => p.level === "Degree");
      } else if (levelFilter === "Postgraduate") {
        list = list.filter(p => p.level === "Postgraduate" || p.level === "Postgraduate Diploma");
      } else if (levelFilter === "Certificate" || levelFilter === "Diploma") {
        list = list.filter(p => p.level === "Certificate" || p.level === "Diploma");
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        (p.name || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.career_areas || []).some(c => c.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allProgrammes, selectedFacultySlug, activeFaculty, levelFilter, searchQuery, isGlobalLevelView]);

  return (
    <div className="space-y-24 pb-24">
      {/* ── Hero ── */}
      <section className="relative text-center pt-20 pb-28 -mx-4 sm:-mx-6 lg:-mx-8 px-8 bg-[#0B5E3C] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute -bottom-1 left-0 right-0 h-24 bg-white" style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }} />
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-200 text-[10px] font-black uppercase tracking-[0.2em]">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            University of Sierra Leone
          </div>
          <h1 className="text-4xl sm:text-6xl font-[900] leading-tight uppercase tracking-tight">
            Institute of Public<br />
            <span className="text-amber-400">Administration & Management</span>
          </h1>
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-brand-100 leading-relaxed font-medium">
            IPAM is the business, management, technology, and public administration arm of the University of Sierra Leone —
            developing entrepreneurs, managers, administrators and business leaders who contribute to Sierra Leone's national economic growth.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-widest">Tower Hill, Freetown</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-widest">TEC Accredited</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-widest">USL Business Campus</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="container mx-auto px-6 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 bg-emerald-50 text-[#0B5E3C] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#0B5E3C] group-hover:text-white transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-3xl font-[900] text-[#0B5E3C]">{s.value}</p>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Mission, Vision & History (Official USL Text) ── */}
      <section className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mission */}
        <div className="bg-[#0B5E3C] p-10 rounded-[35px] text-white relative overflow-hidden group shadow-xl flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 transition-transform group-hover:scale-150 duration-700" />
          <div>
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="text-2xl font-[900] mb-3 uppercase tracking-tight">IPAM Mission</h2>
            <p className="text-brand-100 leading-relaxed font-medium text-sm sm:text-base">
              To develop knowledgeable, skilled and innovative entrepreneurs, managers, administrators and business leaders who can contribute to Sierra Leone's economic and national development.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 text-xs font-bold text-amber-400 uppercase tracking-wider">
            Entrepreneurship & Leadership
          </div>
        </div>

        {/* Vision */}
        <div className="bg-white border border-slate-200 p-10 rounded-[35px] shadow-sm relative overflow-hidden group flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-emerald-50 text-[#0B5E3C] rounded-2xl flex items-center justify-center mb-6">
              <Rocket className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-[900] text-[#0B5E3C] mb-3 uppercase tracking-tight">IPAM Vision</h2>
            <p className="text-slate-600 leading-relaxed font-medium text-sm sm:text-base italic">
              "To be a center of excellence in business, management, public administration and leadership education, producing innovative leaders and entrepreneurs who contribute to good governance, sustainable development and national economic growth."
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-[#0B5E3C] uppercase tracking-wider">
            Center of Academic Excellence
          </div>
        </div>

        {/* History */}
        <div className="bg-slate-900 p-10 rounded-[35px] text-white relative overflow-hidden group shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-white/10 text-amber-400 rounded-2xl flex items-center justify-center mb-6">
              <History className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-[900] mb-3 uppercase tracking-tight">IPAM History</h2>
            <p className="text-slate-300 leading-relaxed font-medium text-xs sm:text-sm">
              IPAM was established on <strong>5 November 1980</strong>, with its origins linked to government efforts in the 1970s to reform civil-service and administrative training. It was created to provide specialized education and training in public administration and management and subsequently expanded into business, finance, information technology, entrepreneurship and governance. Today, IPAM serves as the business and management arm of the University of Sierra Leone.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 text-xs font-bold text-amber-400 uppercase tracking-wider">
            Established 5 November 1980
          </div>
        </div>
      </section>

      {/* ── Faculties Overview (Click to Reveal Programmes Section) ── */}
      <section id="programmes-section" className="container mx-auto px-6 scroll-mt-24 space-y-8">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-widest mb-2">
              <Building2 className="w-3.5 h-3.5" /> 5 Principal Academic Faculties
            </div>
            <h2 className="inline-block gold-underline text-3xl sm:text-4xl font-[900] text-[#0B5E3C] uppercase tracking-tight">
              Academic Faculties
            </h2>
            <p className="text-slate-600 max-w-xl font-medium mt-2 text-sm">
              Click on any faculty below to inspect all its accredited programmes in the section below.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-[#0B5E3C] uppercase tracking-widest border border-emerald-200 bg-emerald-50/50 px-4 py-2 rounded-xl">
              39 Total Programmes
            </span>
          </div>
        </div>

        {/* 5 Faculty Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {faculties.map((fac) => {
            const meta = FACULTY_META[fac.slug] || { icon: BookOpen, color: "from-slate-600 to-slate-700", bg: "bg-slate-50 text-slate-700", border: "border-slate-200" };
            const Icon = meta.icon;
            const isSelected = selectedFacultySlug === fac.slug && !isGlobalLevelView;
            return (
              <button
                key={fac.id}
                onClick={() => handleFacultySelect(fac.slug)}
                className={`group text-left bg-white border rounded-[2rem] p-6 hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
                  isSelected 
                    ? "ring-2 ring-[#0B5E3C] border-[#0B5E3C] shadow-lg bg-emerald-50/20 scale-[1.02]" 
                    : "border-slate-200 hover:border-emerald-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${meta.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                      isSelected ? "bg-[#0B5E3C] text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {fac.programme_count} Progs
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-[#0B5E3C] mb-2 uppercase tracking-tight leading-snug line-clamp-2">
                    {fac.name}
                  </h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed line-clamp-3">
                    {fac.description}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between w-full">
                  <span className="text-[10px] font-bold text-slate-400">
                    {isSelected ? "Selected" : "Click to view"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#0B5E3C] group-hover:translate-x-1 transition-transform">
                    View <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Dynamic Section: All Programmes for the Clicked Faculty (or Selected Level) ── */}
        <div id="faculty-detail-viewer" className="bg-white border border-slate-200 rounded-[2.5rem] p-8 lg:p-12 shadow-xl space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {isGlobalLevelView ? `${levelFilter} Programmes` : "Selected Faculty"}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {displayedProgrammes.length} Programmes Shown
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-[900] text-[#0B5E3C] uppercase tracking-tight">
                {isGlobalLevelView ? `All ${levelFilter} Offerings` : activeFaculty.name}
              </h3>
              <p className="text-slate-600 text-sm font-medium max-w-2xl">
                {isGlobalLevelView 
                  ? `Showing all accredited ${levelFilter} qualifications across all 5 faculties of IPAM.`
                  : activeFaculty.description}
              </p>
            </div>
            {!isGlobalLevelView && (
              <Link
                to={`/ipam/${selectedFacultySlug}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B5E3C] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-md self-start md:self-center"
              >
                Faculty Detail Page <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Level Filter Bar & Search */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search programmes or careers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B5E3C]/20 focus:border-[#0B5E3C]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Filter Level:</span>
              {[
                { id: "all", label: "All Levels" },
                { id: "Degree", label: "Undergraduate (BSc)" },
                { id: "Postgraduate", label: "Postgraduate (MSc/MBA/PhD)" },
                { id: "Diploma", label: "Diplomas & Certificates" }
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => handleLevelSelect(lvl.id)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    levelFilter === lvl.id
                      ? "bg-[#0B5E3C] text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Programmes Grid */}
          {displayedProgrammes.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-slate-400 font-bold text-sm">No programmes matched your filter or search query.</p>
              <button
                onClick={() => { setLevelFilter("all"); setSearchQuery(""); }}
                className="px-4 py-2 bg-emerald-50 text-[#0B5E3C] rounded-xl text-xs font-black uppercase tracking-wider"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedProgrammes.map((prog) => {
                const isPostgrad = prog.level === "Postgraduate" || prog.level === "Postgraduate Diploma";
                const isDipCert = prog.level === "Diploma" || prog.level === "Certificate";
                const facultySlug = prog.faculty_slug || (faculties.find(f => f.id === prog.faculty_id)?.slug) || selectedFacultySlug;
                return (
                  <div
                    key={prog.id}
                    className="bg-slate-50/70 border border-slate-200 rounded-2xl p-6 hover:bg-white hover:border-emerald-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                          isPostgrad 
                            ? 'bg-purple-50 text-purple-700 border-purple-200' 
                            : isDipCert 
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {prog.level}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {prog.duration}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-slate-900 mb-2.5 group-hover:text-[#0B5E3C] transition-colors leading-snug">
                        {prog.name}
                      </h4>

                      <p className="text-slate-500 text-xs font-medium leading-relaxed mb-4 line-clamp-3">
                        {prog.description}
                      </p>

                      {prog.career_areas && prog.career_areas.length > 0 && (
                        <div className="mb-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Career Pathways:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {prog.career_areas.slice(0, 3).map((career, cIdx) => (
                              <span key={cIdx} className="text-[10px] font-medium bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md">
                                {career}
                              </span>
                            ))}
                            {prog.career_areas.length > 3 && (
                              <span className="text-[10px] font-bold text-slate-400 self-center">
                                +{prog.career_areas.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between mt-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {prog.mode || "In person"}
                      </span>
                      <Link
                        to={`/ipam/${facultySlug}/${prog.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-black text-[#0B5E3C] group-hover:text-emerald-700 uppercase tracking-wider hover:underline"
                      >
                        View Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Summary of IPAM Academic Units ── */}
      <section className="bg-slate-50 border-y border-slate-200 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0B5E3C]">Academic Structure</span>
              <h2 className="text-3xl font-[900] text-[#0B5E3C] uppercase tracking-tight mt-1">IPAM Programme Structure</h2>
              <p className="text-slate-600 text-sm font-medium mt-2">
                Five academic units offering 39 accredited university programmes:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Faculty of Accounting & Finance", progs: "8 Programmes (5 Undergraduate, 3 Postgraduate)" },
                { title: "Faculty of Information Systems & Technology", progs: "3 Programmes (IS, IT & Networking degrees)" },
                { title: "Faculty of Business Administration & Entrepreneurship", progs: "13 Programmes (6 Undergraduate, 6 Masters/PhD, 1 PGDP)" },
                { title: "Faculty of Leadership & Governance", progs: "7 Programmes (3 Undergraduate, 4 Postgraduate)" },
                { title: "Extra-Mural Studies / Continuing Education", progs: "8 Programmes (1 Certificate, 7 Professional Diplomas)" }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3.5 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-[#0B5E3C] text-sm uppercase tracking-tight">{item.title}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">{item.progs}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="container mx-auto px-6">
        <div className="bg-[#0B5E3C] p-12 lg:p-16 rounded-[45px] text-white text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3" />
          <h2 className="text-3xl sm:text-4xl font-[900] mb-4 uppercase tracking-tight">Apply to IPAM Today</h2>
          <p className="text-brand-100 text-base sm:text-lg mb-8 max-w-2xl mx-auto font-medium">
            Join 7,000+ students at the University of Sierra Leone's premier business and management campus.
            Degree programmes, postgraduate tracks, and flexible extra-mural diplomas available.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link to="/register" className="px-10 py-4 bg-white text-[#0B5E3C] rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-slate-50 transition-all hover:scale-105">
              Start Learning
            </Link>
            <Link to="/contact" className="px-10 py-4 border border-white/30 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
              Contact Admissions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default IpamPage;
