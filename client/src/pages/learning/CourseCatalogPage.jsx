import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/authService";
import { enrollInCourse, getCourses } from "../../services/platformService";
import {
  Search, Filter, BookOpen, Clock, Award, Star, ExternalLink,
  GraduationCap, TrendingUp, Loader2, CheckCircle2, AlertCircle, ChevronDown, Layout, HelpCircle, Globe, ArrowRight
} from "lucide-react";

const CATEGORY_COLORS = {
  "Academic": "bg-blue-50 text-blue-600 border-blue-100",
  "Short Course": "bg-emerald-50 text-emerald-600 border-emerald-100",
};

function CourseCatalogPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all"); 
  const [level, setLevel] = useState("all");
  const [message, setMessage] = useState("");
  const [enrollingId, setEnrollingId] = useState(null);

  useEffect(() => {
    let alive = true;
    async function loadCourses() {
      setLoading(true);
      setError("");
      try {
        const data = await getCourses();
        if (alive) setCourses(data || []);
      } catch (err) {
        if (alive) {
          setError("Failed to load courses.");
        }
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadCourses();
    return () => { alive = false; };
  }, []);

  const types = ["all", "Academic", "Short Course", "Professional Development"];
  const levels = ["all", "Beginner", "Intermediate", "Advanced"];

  const filtered = courses.filter((course) => {
    const q = query.trim().toLowerCase();
    const typeMatch = type === "all" || course.category === type;
    const lvlMatch = level === "all" || course.level === level;
    const qMatch = !q ||
      course.title.toLowerCase().includes(q) ||
      (course.provider?.name || "").toLowerCase().includes(q) ||
      course.category.toLowerCase().includes(q);
    return typeMatch && lvlMatch && qMatch;
  });

  const handleEnroll = (course) => {
    if (!getCurrentUser()) {
      navigate("/user-login");
      return;
    }
    setEnrollingId(course.id);
    enrollInCourse(course.id)
      .then((data) => {
        setMessage(`Enrolled in "${course.title}"!`);
        setTimeout(() => {
          if (course.isInternal) {
            navigate(`/course-player/${course.id}`);
          } else if (course.externalUrl) {
            window.open(course.externalUrl, "_blank");
            navigate("/user-dashboard");
          } else {
            navigate("/user-dashboard");
          }
          setMessage("");
        }, 1500);
      })
      .catch((err) => setMessage(err.message))
      .finally(() => setEnrollingId(null));
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header with Search */}
      <div className="relative bg-[#0d2d57] -mx-4 sm:-mx-6 lg:-mx-8 px-8 py-16 text-center text-white overflow-hidden mb-12">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
         <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-black mb-6 uppercase tracking-widest">
               Search Programs
            </div>
            <h1 className="text-3xl sm:text-5xl font-black mb-3 uppercase tracking-tight leading-tight">University Course Repository</h1>
            <p className="text-blue-200 mb-8 font-bold uppercase tracking-widest text-xs">Access Undergraduate, Postgraduate and Professional courses at USL</p>
            
            <div className="relative max-w-2xl mx-auto shadow-2xl">
               <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400">
                 <Search className="h-6 w-6" />
               </div>
               <input
                 type="text"
                 placeholder="Search faculties, courses, or college..."
                 className="block w-full pl-16 pr-32 py-5 border-none rounded-2xl bg-white text-slate-800 text-lg placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all font-black uppercase tracking-tight"
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
               />
               <button className="absolute right-3 top-3 bottom-3 px-6 bg-[#0d2d57] text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-900 transition-all">
                  Filter
               </button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
         
         {/* Sidebar Filters */}
         <div className="lg:col-span-1 space-y-8">
            <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
               <h4 className="text-[10px] font-black text-[#0d2d57] mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Layout className="w-4 h-4" /> Degree Category
               </h4>
               <div className="space-y-2">
                  {types.map((t) => (
                     <label key={t} className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border ${type === t ? 'bg-[#0d2d57] border-[#0d2d57] text-white shadow-lg' : 'bg-slate-50 border-slate-50 text-slate-500 hover:border-slate-200'}`}>
                        <input 
                          type="radio" 
                          name="type" 
                          checked={type === t} 
                          onChange={() => setType(t)}
                          className="hidden" 
                        />
                        <span className="text-xs font-black uppercase tracking-widest">
                           {t === 'all' ? 'All Faculties' : t}
                        </span>
                     </label>
                  ))}
               </div>

               <div className="mt-10 pt-10 border-t border-slate-100">
                  <h4 className="text-[10px] font-black text-[#0d2d57] mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Filter className="w-4 h-4" /> Complexity
                  </h4>
                  <div className="space-y-2">
                     {levels.map((l) => (
                        <label key={l} className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border ${level === l ? 'bg-[#0d2d57] border-[#0d2d57] text-white shadow-lg' : 'bg-slate-50 border-slate-50 text-slate-500 hover:border-slate-200'}`}>
                           <input 
                             type="radio" 
                             name="level" 
                             checked={level === l} 
                             onChange={() => setLevel(l)}
                             className="hidden" 
                           />
                           <span className="text-xs font-black uppercase tracking-widest">
                              {l === 'all' ? 'All Levels' : l}
                           </span>
                        </label>
                     ))}
                  </div>
               </div>
            </div>

            <div className="p-8 bg-[#0d2d57] rounded-[2.5rem] text-white shadow-xl shadow-blue-900/10">
               <HelpCircle className="w-8 h-8 text-blue-400 mb-4" />
               <h4 className="font-black uppercase tracking-tight text-base mb-2">Admission Help</h4>
               <p className="text-xs text-blue-200 leading-relaxed font-bold mb-6">Need help choosing a faculty? Talk to a USL student advisor.</p>
               <button className="w-full py-4 bg-white text-[#0d2d57] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all">Get Guidance</button>
            </div>
         </div>

         {/* Course Grid Area */}
         <div className="lg:col-span-3">
            {message && (
               <div className="mb-8 flex items-center gap-2 p-5 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <p>{message}</p>
               </div>
            )}

            {loading ? (
               <div className="flex items-center justify-center py-32">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
               </div>
            ) : (
               <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {filtered.map((course) => (
                        <article
                           key={course.id}
                           className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all duration-500 overflow-hidden flex flex-col"
                        >
                           <div className="relative h-56 bg-slate-100 overflow-hidden">
                               <img src={course.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={course.title} />
                               <div className="absolute top-6 right-6">
                                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${CATEGORY_COLORS[course.category] || "bg-white text-slate-800"}`}>
                                    {course.category}
                                  </span>
                               </div>
                           </div>
                           
                           <div className="p-10 flex flex-col flex-grow">
                              <h3 className="text-xl font-black text-[#0d2d57] mb-4 group-hover:text-blue-700 transition-colors leading-tight uppercase tracking-tight">
                                 {course.title}
                              </h3>

                              <div className="flex items-center gap-2 mb-8 text-xs font-black text-blue-600 uppercase tracking-widest">
                                 <Globe className="w-4 h-4" />
                                 {course.provider?.name}
                              </div>

                              <div className="grid grid-cols-2 gap-4 mb-10 pt-8 border-t border-slate-50">
                                 <div className="space-y-1">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">Duration</p>
                                    <p className="text-xs font-black text-[#0d2d57] uppercase">{course.duration}</p>
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">Faculty</p>
                                    <p className="text-xs font-black text-[#0d2d57] uppercase">{course.provider?.name}</p>
                                 </div>
                              </div>

                              <div className="mt-auto flex items-center justify-between gap-6">
                                 <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Fee Info</p>
                                    <p className="text-lg font-black text-[#0d2d57] uppercase tracking-tighter">{course.price}</p>
                                 </div>
                                 <button
                                   onClick={() => handleEnroll(course)}
                                   disabled={enrollingId === course.id}
                                   className="h-14 flex-grow bg-[#0d2d57] hover:bg-blue-900 text-white text-[10px] font-black rounded-2xl transition-all shadow-xl shadow-blue-900/10 flex items-center justify-center gap-3 uppercase tracking-widest px-4"
                                 >
                                    {enrollingId === course.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                       <>Enroll <ArrowRight className="w-4 h-4" /></>
                                    )}
                                 </button>
                              </div>
                           </div>
                        </article>
                     ))}
                  </div>

                  {filtered.length === 0 && (
                     <div className="text-center py-32 bg-white rounded-[40px] border border-slate-100 shadow-sm">
                        <Search className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-slate-400 mb-2 uppercase">No courses found</h3>
                        <p className="text-slate-400 font-bold">Try searching for "IPAM", "FBC", or "Engineering"</p>
                        <button onClick={() => {setQuery(""); setType("all"); setLevel("all");}} className="mt-8 px-10 py-4 bg-slate-50 text-blue-600 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-blue-50 transition-colors">Clear all filters</button>
                     </div>
                  )}
               </>
            )}
         </div>
      </div>
    </div>
  );
}

export default CourseCatalogPage;
