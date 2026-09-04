import { useState } from "react";
import { getCurrentUser } from "../../services/authService";
import { Link } from "react-router-dom";
import {
  GraduationCap, Clock, Calendar, BookOpen, Layers,
  ChevronRight, UserCircle2, ArrowRight, X, FileText, Video
} from "lucide-react";

import { getCourses } from "../../services/platformService";

// Helper to get initials
function getInitials(name) {
  if (!name) return "L";
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
}

function CourseCatalogPage() {
  const user = getCurrentUser() || {};
  const [activeSemester, setActiveSemester] = useState("All Courses");
  const [selectedModule, setSelectedModule] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("../../services/platformService").then(({ getCourses }) => {
      getCourses().then(data => {
        setCourses(data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    });
  }, []);

  const programName = user.program || "Bachelor of Science";
  const facultyName = user.facultyName || "Faculty of General Studies";
  const currentYear = user.currentAcademicYear || "Year 1";
  
  const curriculum = {
    "All Courses": courses.map(c => ({
      id: c.id,
      code: c.external_id || "N/A",
      title: c.title,
      credits: 3, // default dummy
      lecturer: c.instructor_name || "Unknown Lecturer",
      status: "Enrolled",
      rawCourse: c
    }))
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* ─── HEADER SECTION ─── */}
      <div className="bg-[#0B5E3C] rounded-[2.5rem] p-10 lg:p-14 relative overflow-hidden text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              My Academic Program
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-4">
              {programName}
            </h1>
            <p className="text-emerald-100 font-bold uppercase tracking-widest text-sm md:text-base">
              {facultyName}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 min-w-[140px]">
              <div className="flex items-center gap-2 text-emerald-200 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Standing</span>
              </div>
              <p className="text-2xl font-black">{currentYear}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 min-w-[140px]">
              <div className="flex items-center gap-2 text-emerald-200 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Duration</span>
              </div>
              <p className="text-2xl font-black">4 Years</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CURRICULUM SECTION ─── */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 lg:p-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black text-[#0B5E3C] uppercase tracking-tight mb-2">
              Registered Curriculum
            </h2>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              {currentYear} Modules & Instructors
            </p>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-full self-start">
            {Object.keys(curriculum).map(sem => (
              <button
                key={sem}
                onClick={() => setActiveSemester(sem)}
                className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  activeSemester === sem 
                    ? "bg-[#0B5E3C] text-white shadow-md" 
                    : "text-slate-500 hover:text-[#0B5E3C] hover:bg-slate-200/50"
                }`}
              >
                {sem}
              </button>
            ))}
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          {curriculum[activeSemester].map((module) => (
            <div 
              key={module.id} 
              className="group border border-slate-200 rounded-[1.5rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 bg-white hover:bg-emerald-50/30"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-[#0B5E3C] group-hover:bg-[#0B5E3C] group-hover:text-white transition-colors flex-shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-200">
                      {module.code}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {module.credits} Credits
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[#0B5E3C] tracking-tight group-hover:text-emerald-800 transition-colors">
                    {module.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <UserCircle2 className="w-4 h-4 text-slate-400" />
                    Lecturer: <span className="text-slate-700">{module.lecturer}</span>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 mt-4 md:mt-0 pt-4 md:pt-0 border-t border-slate-100 md:border-none">
                {module.status === 'Enrolled' ? (
                  <button 
                    onClick={() => setSelectedModule(module)}
                    className="text-[10px] font-black px-4 py-2 bg-[#0B5E3C] text-white border border-transparent rounded-full uppercase tracking-widest shadow-sm hover:bg-[#08482E] transition-all cursor-pointer"
                  >
                    View Modules and Lectures Assigned
                  </button>
                ) : (
                  <span className="text-[10px] font-black px-4 py-1.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-full uppercase tracking-widest shadow-sm">
                    {module.status}
                  </span>
                )}
                
                {module.status === 'Enrolled' && (
                  <Link to="/app/repository" className="text-[10px] font-black text-emerald-600 hover:text-[#0B5E3C] uppercase tracking-widest flex items-center gap-1 group/link">
                    Go Repository
                    <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedModule && (() => {
        const c = selectedModule.rawCourse;
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="bg-[#0B5E3C] p-8 text-white relative">
                <button 
                  onClick={() => setSelectedModule(null)}
                  className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="space-y-2">
                  <span className="text-[10px] font-black bg-amber-400 text-slate-900 px-3 py-1 rounded-full uppercase tracking-widest">
                    {selectedModule.code} • {selectedModule.credits} Credits
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight">{selectedModule.title}</h3>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                {/* Lecturer Info */}
                <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-[1.5rem] p-6">
                  <h4 className="text-[10px] font-black text-[#0B5E3C] uppercase tracking-[0.2em] mb-4">Assigned Lecturer</h4>
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-lg">
                      {selectedModule.lecturer?.split(" ").pop()?.[0] || "L"}
                    </div>
                    <div className="space-y-1">
                      <p className="font-black text-slate-950 text-base">{selectedModule.lecturer}</p>
                      <p className="text-xs font-bold text-[#0B5E3C] uppercase tracking-widest">Lecturer</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{c.category || facultyName}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs text-slate-600 font-medium">
                        <span>Academic Year: {c.skill_level || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-slate-600 leading-relaxed italic">{c.description || "No bio available."}</p>
                </div>

                {/* Lectures List */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lectures & Content Posted</h4>
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 italic">Access these materials in the Repository.</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-100 p-6 bg-slate-50 flex justify-end">
                <button 
                  onClick={() => setSelectedModule(null)}
                  className="px-6 py-3 bg-[#0B5E3C] text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  Close View
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default CourseCatalogPage;
