import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Compass, Award, GraduationCap, Building2, CheckCircle2, ArrowRight,
  Calculator, Cpu, Briefcase, Scale, BookMarked, Search, Filter,
  Clock, Users, MapPin, Sparkles, MessageSquare, ChevronRight
} from "lucide-react";
import { universityService } from "../services/universityService";

const FACULTIES_CONFIG = [
  {
    id: "f1",
    name: "Accounting & Finance",
    slug: "accounting-finance",
    icon: Calculator,
    color: "from-emerald-600 to-teal-700",
    bg: "bg-emerald-50 text-emerald-700",
    border: "border-emerald-200",
    activeTab: "bg-emerald-700 text-white shadow-lg",
    description: "Focuses on accounting, financial management, banking, investment, taxation, auditing and financial economics.",
    programme_count: 5,
    dean: "Dr James Kollie"
  },
  {
    id: "f2",
    name: "Information Systems & Technology",
    slug: "info-systems-tech",
    icon: Cpu,
    color: "from-blue-600 to-indigo-700",
    bg: "bg-blue-50 text-blue-700",
    border: "border-blue-200",
    activeTab: "bg-blue-700 text-white shadow-lg",
    description: "Responsible for IPAM's computing, information systems, networking, cybersecurity, web development and IT education.",
    programme_count: 4
  },
  {
    id: "f3",
    name: "Business Administration & Entrepreneurship",
    slug: "business-admin-entrepreneurship",
    icon: Briefcase,
    color: "from-amber-500 via-yellow-500 to-amber-600",
    bg: "bg-amber-50 text-amber-800",
    border: "border-amber-300",
    activeTab: "bg-amber-600 text-white shadow-lg",
    description: "Focuses on business management, entrepreneurship, human resources, procurement, logistics, marketing and project management.",
    programme_count: 6,
    dean: "Dr Ernest Udeh"
  },
  {
    id: "f4",
    name: "Leadership & Governance",
    slug: "leadership-governance",
    icon: Scale,
    color: "from-[#85754E] via-[#6B5E3C] to-[#4F462B]",
    bg: "bg-[#F5F2EB] text-[#5C4F3D]",
    border: "border-[#D9D1C3]",
    activeTab: "bg-[#6B5E3C] text-white shadow-lg",
    description: "Focuses on leadership, governance, public administration, public policy, public-sector management and development.",
    programme_count: 3
  },
  {
    id: "f5",
    name: "Extra-Mural Studies",
    slug: "extra-mural-studies",
    icon: BookMarked,
    color: "from-rose-600 to-pink-700",
    bg: "bg-rose-50 text-rose-700",
    border: "border-rose-200",
    activeTab: "bg-rose-700 text-white shadow-lg",
    description: "Extends university education into provincial communities with professional diplomas and certificate programmes.",
    programme_count: 6
  }
];

const APPROVED_PROGRAMMES = {
  "accounting-finance": [
    "BSc (Hons) in Financial Economics",
    "BSc in Applied Accounting",
    "BSc in Auditing, Taxation and Internal Control",
    "BSc in Banking and Finance",
    "BSc In Financial Services"
  ],
  "info-systems-tech": [
    "BSc Information Systems",
    "BSc Information Technology",
    "BSc In Computer Networking",
    "Diploma in Information Systems"
  ],
  "business-admin-entrepreneurship": [
    "BSc in Business Administration",
    "BSc in Entrepreneurship and Innovation",
    "BSc in Human Resource Management",
    "BSc in Procurement,Logistics and Supply Chain Management",
    "BSc of Science in Project Management",
    "BSc of Science in Sales and Marketing"
  ],
  "leadership-governance": [
    "BSc in Leadership and Sustainable Development",
    "BSc of Science in Public Policy",
    "BSc of Science in Public Sector Management"
  ],
  "extra-mural-studies": [
    "Diploma in Applied Accounting",
    "Diploma in Banking and Finance",
    "Diploma in Business Administration",
    "Diplomas in Financial Services",
    "Diploma in Information Technology",
    "Diploma in Procurement and Supply"
  ]
};

const programmeKey = (name) => (name || "")
  .toLowerCase()
  .replace(/b\.sc\.?/g, "bsc")
  .replace(/\bin\b/g, "")
  .replace(/[^a-z0-9]/g, "");

function TrainingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFaculty = searchParams.get("faculty") || "accounting-finance";
  const initialLevel = searchParams.get("level") || "all";

  const [selectedFacultySlug, setSelectedFacultySlug] = useState(initialFaculty);
  const [levelFilter, setLevelFilter] = useState(initialLevel);
  const [searchQuery, setSearchQuery] = useState("");
  const [faculties, setFaculties] = useState(FACULTIES_CONFIG);
  const [allProgrammes, setAllProgrammes] = useState([]);
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

  // Update selected faculty when query param changes
  useEffect(() => {
    const fac = searchParams.get("faculty");
    if (fac) setSelectedFacultySlug(fac);
    const lvl = searchParams.get("level");
    if (lvl) setLevelFilter(lvl);
  }, [searchParams]);

  const handleFacultyClick = (slug) => {
    setSelectedFacultySlug(slug);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set("faculty", slug);
      return next;
    });
    const el = document.getElementById("programs-view-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const handleLevelClick = (lvl) => {
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

  const filteredProgrammes = useMemo(() => {
    const liveProgrammes = allProgrammes.filter(p => {
      const matchFaculty = p.faculty_slug === selectedFacultySlug || (activeFaculty && p.faculty_id === activeFaculty.id);
      return matchFaculty;
    });

    const uniqueProgrammes = new Map();
    liveProgrammes.forEach(programme => {
      const key = programmeKey(programme.name);
      if (key && !uniqueProgrammes.has(key)) uniqueProgrammes.set(key, programme);
    });

    const approvedNames = APPROVED_PROGRAMMES[selectedFacultySlug] || [];
    approvedNames.forEach((name, index) => {
      const key = programmeKey(name);
      if (!uniqueProgrammes.has(key)) {
        uniqueProgrammes.set(key, {
          id: `approved-${selectedFacultySlug}-${index}`,
          name,
          level: name.startsWith("Diploma") || name.startsWith("Diplomas") ? "Diploma" : "Degree",
          duration: name.startsWith("Diploma") || name.startsWith("Diplomas") ? "2 Years" : "4 Years",
          description: `IPAM programme in ${name}.`,
          career_areas: []
        });
      }
    });

    let list = Array.from(uniqueProgrammes.values());

    if (levelFilter !== "all") {
      if (levelFilter === "Degree") {
        list = list.filter(p => p.level === "Degree");
      } else if (levelFilter === "Postgraduate") {
        list = list.filter(p => p.level === "Postgraduate" || p.level === "Postgraduate Diploma");
      } else if (levelFilter === "Diploma") {
        list = list.filter(p => p.level === "Diploma");
      } else if (levelFilter === "Certificate") {
        list = list.filter(p => p.level === "Certificate");
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
  }, [allProgrammes, selectedFacultySlug, activeFaculty, levelFilter, searchQuery]);

  return (
    <div className="space-y-20 pb-24">
      {/* ── Hero Section ── */}
      <section className="relative text-center pt-20 pb-24 -mx-4 sm:-mx-6 lg:-mx-8 px-6 bg-[#0B5E3C] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-200 text-[10px] font-black uppercase tracking-[0.2em]">
            <Compass className="w-4 h-4 text-amber-400" />
            IPAM E-Learning Resources
          </div>
          <h1 className="text-4xl sm:text-6xl font-[900] leading-tight uppercase tracking-tight">
            Academic <span className="text-amber-400">Specializations</span>
          </h1>
          <p className="text-base sm:text-lg text-brand-100 leading-relaxed max-w-2xl mx-auto font-medium">
            Explore learning resources organized by module, built for IPAM-USL's students and lecturers.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-widest">Downloadable Materials</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-widest">5 Faculties · 39 Programmes</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── APEL Recognition Section ── */}
      <section className="container mx-auto px-6">
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col lg:flex-row items-stretch">
          <div className="lg:w-1/2 p-10 lg:p-16 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-50 text-[#0B5E3C] rounded-2xl flex items-center justify-center shadow-sm">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prior Learning Pathway</span>
                <h2 className="text-2xl sm:text-3xl font-[900] text-[#0B5E3C] uppercase tracking-tight leading-none">
                  Secure, Role-Based <br />Access
                </h2>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed text-base font-medium italic">
              "IPAM-USL's e-learning platform gives students and lecturers secure, role-based access — so each user sees only what's relevant to them."
            </p>
            <div className="space-y-3">
              {[
                "Secure user authentication",
                "Course learning materials in one place",
                "Academic communication through notifications",
                "Distinct student and lecturer roles"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-[#0B5E3C] font-black text-xs uppercase tracking-wider">{text}</span>
                </div>
              ))}
            </div>
            <Link 
              to="/contact" 
              className="inline-flex items-center justify-center px-8 py-4 bg-[#0B5E3C] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-800 transition-all hover:scale-105"
            >
              Contact
            </Link>
          </div>
          <div className="lg:w-1/2 bg-[#0B5E3C] relative p-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-950 opacity-40" />
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
              <div className="p-8 bg-white rounded-[2rem] shadow-2xl">
                <p className="text-4xl font-[900] text-[#0B5E3C]">1980</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Established Legacy</p>
              </div>
              <div className="p-8 bg-amber-500 rounded-[2rem] shadow-2xl text-slate-950">
                <p className="text-4xl font-[900]">100%</p>
                <p className="text-[10px] font-black uppercase tracking-widest mt-2">Downloadable Materials</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Faculty Selector Tabs (Click on Any Faculty to See All Its Programs) ── */}
      <section id="specialization-explorer" className="container mx-auto px-6 space-y-8 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Interactive Faculty Directory
          </div>
          <h2 className="text-3xl sm:text-4xl font-[900] text-[#0B5E3C] uppercase tracking-tight">
            Explore Programmes by Faculty
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Select a faculty below to inspect all its undergraduate degrees, master tracks, and diplomas.
          </p>
        </div>

        {/* 5 Faculty Navigation Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {FACULTIES_CONFIG.map((fac) => {
            const isSelected = selectedFacultySlug === fac.slug;
            const Icon = fac.icon;
            return (
              <button
                key={fac.id}
                type="button"
                onClick={() => handleFacultyClick(fac.slug)}
                aria-pressed={isSelected}
                aria-label={`View ${fac.name} programmes`}
                className={`p-5 rounded-2xl text-left border transition-all duration-300 flex flex-col justify-between group ${
                  isSelected
                    ? "bg-[#0B5E3C] text-white border-[#0B5E3C] shadow-xl scale-[1.02]"
                    : "bg-white text-slate-800 border-slate-200 hover:border-emerald-400 hover:shadow-md"
                } cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? "bg-white/20 text-amber-400" : fac.bg
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {fac.programme_count} Progs
                  </span>
                </div>
                <div>
                  <h3 className={`text-xs font-black uppercase tracking-tight line-clamp-2 ${
                    isSelected ? "text-white" : "text-slate-900 group-hover:text-[#0B5E3C]"
                  }`}>
                    {fac.name}
                  </h3>
                  <p className={`text-[11px] font-medium mt-1 line-clamp-2 ${
                    isSelected ? "text-brand-100" : "text-slate-500"
                  }`}>
                    {fac.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Filter & Search Bar ── */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${activeFaculty?.name || 'programmes'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B5E3C]/20 focus:border-[#0B5E3C]"
            />
          </div>

          {/* Level Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Level:</span>
            {[
              { id: "all", label: "All Levels" },
              { id: "Degree", label: "Undergraduate (BSc)" },
              { id: "Postgraduate", label: "Postgraduate (MSc/MBA/PhD)" },
              { id: "Diploma", label: "Diplomas" },
              { id: "Certificate", label: "Certificates" }
            ].map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => handleLevelClick(lvl.id)}
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

        {/* ── Section Containing All Programs for the Clicked Faculty ── */}
        <div id="programs-view-section" className="bg-white border border-slate-200 rounded-[2.5rem] p-8 lg:p-12 shadow-xl space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  Active Faculty
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Showing {filteredProgrammes.length} of {activeFaculty?.programme_count || filteredProgrammes.length} Programmes
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-[900] text-[#0B5E3C] uppercase tracking-tight">
                {activeFaculty?.name}
              </h3>
              <p className="text-slate-600 text-sm font-medium max-w-2xl">
                {activeFaculty?.description}
              </p>
            </div>
            <Link
              to={`/ipam/${selectedFacultySlug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B5E3C] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-md self-start md:self-center"
            >
              Faculty Main Page <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Programmes Grid */}
          {filteredProgrammes.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-slate-400 font-bold text-sm">No programmes matched your filter or search.</p>
              <button
                onClick={() => { setLevelFilter("all"); setSearchQuery(""); }}
                className="px-4 py-2 bg-emerald-50 text-[#0B5E3C] rounded-xl text-xs font-black uppercase tracking-wider"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProgrammes.map((prog) => {
                const isPostgrad = prog.level === "Postgraduate" || prog.level === "Postgraduate Diploma";
                const isDipCert = prog.level === "Diploma" || prog.level === "Certificate";
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
                        to={`/ipam/${selectedFacultySlug}/${prog.id}`}
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

      {/* ── Career Guidance Advisory CTA ── */}
      <section className="container mx-auto px-6 py-8 text-center max-w-4xl">
        <div className="bg-slate-50 border border-slate-200 p-10 rounded-[3rem] space-y-6">
          <h2 className="text-3xl font-[900] text-[#0B5E3C] uppercase tracking-tight">UniPam E-Learning IPAM</h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium max-w-2xl mx-auto">
            Everything you need to access course materials and manage your learning is right here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link 
              to="/contact" 
              className="px-8 py-4 bg-[#0B5E3C] text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-800 transition-all hover:scale-105"
            >
              Contact Support
            </Link>
            <span className="px-8 py-4 bg-white text-[#0B5E3C] border border-slate-200 rounded-full font-black text-xs uppercase tracking-widest">
              40 Programmes
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TrainingPage;
