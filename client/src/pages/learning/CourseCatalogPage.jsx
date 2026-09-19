import { useState, useEffect } from "react";
import { getCurrentUser, hydrateCurrentUser } from "../../services/authService";
import { Link } from "react-router-dom";
import {
  GraduationCap, Clock, Calendar, BookOpen,
  UserCircle2, ArrowRight, X, Loader2, FolderOpen, Mail, Building2, User
} from "lucide-react";
import { getCourses } from "../../services/platformService";

// Helper to get initials
function getInitials(name) {
  if (!name) return "L";
  return name
    .split(" ")
    .filter(Boolean)
    .map(n => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function CourseCatalogPage() {
  const [user, setUser] = useState(() => getCurrentUser() || {});
  const [activeSemester, setActiveSemester] = useState("All Courses");
  const [selectedModule, setSelectedModule] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydrate current user profile to get latest faculty, department, academic year from admin edits
    hydrateCurrentUser()
      .then(freshUser => {
        if (freshUser) {
          setUser(getCurrentUser() || {});
        }
      })
      .catch(() => {})
      .finally(() => {
        getCourses()
          .then(data => {
            setCourses(data || []);
          })
          .catch(err => {
            console.error("Failed to load courses:", err);
            setCourses([]);
          })
          .finally(() => {
            setLoading(false);
          });
      });
  }, []);

  const programName = user.program || user.department || "Bachelor of Science";
  const facultyName = user.facultyName || user.faculty || "Faculty of Information Systems & Technology";
  const currentYear = user.currentAcademicYear
    ? `Year ${user.currentAcademicYear}`
    : (user.academicYear || "Year 1");

  const curriculum = {
    "All Courses": courses.map(c => ({
      id: c.id,
      code: c.external_id || "N/A",
      title: c.title,
      credits: 3,
      lecturer: c.instructor_name || c.instructor?.name || "Assigned Lecturer",
      lecturerEmail: c.instructor?.email || "",
      lecturerFaculty: c.instructor?.faculty || c.category || facultyName,
      lecturerDepartment: c.instructor?.department || programName,
      lecturerAcademicYear: c.instructor?.academicYear || c.skill_level || currentYear,
      academicYear: c.skill_level || c.level || currentYear,
      status: "Enrolled",
      rawCourse: c
    }))
  };

  const activeModules = curriculum[activeSemester] || [];

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

            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-4 uppercase">
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
              <p className="text-2xl font-black">{user.currentAcademicYear || "1"}</p>
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
              {activeModules.length} Modules &amp; Instructors
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

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-[#0B5E3C] mb-3" />
            <p className="text-xs font-black uppercase tracking-widest">Loading Modules &amp; Assigned Lecturers...</p>
          </div>
        ) : activeModules.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-slate-50/60 rounded-[2rem] border border-dashed border-slate-200 p-8">
            <FolderOpen className="w-14 h-14 text-slate-300 mx-auto mb-4" />
            <h3 className="text-base font-black text-slate-800 uppercase tracking-tight mb-2">
              No Modules or Lecturers Assigned Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              No lecturers have been assigned to <strong>{facultyName}</strong> — <strong>{programName}</strong> for <strong>{currentYear}</strong>. When your department coordinators assign your curriculum, it will appear here.
            </p>
          </div>
        ) : (
          /* Modules List */
          <div className="space-y-4">
            {activeModules.map(module => (
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
                  {module.status === "Enrolled" ? (
                    <button
                      onClick={() => setSelectedModule(module)}
                      className="text-[10px] font-black px-5 py-2.5 bg-[#0B5E3C] text-white border border-transparent rounded-full uppercase tracking-widest shadow-sm hover:bg-[#08482E] transition-all cursor-pointer"
                    >
                      View Modules and Lectures Assigned
                    </button>
                  ) : (
                    <span className="text-[10px] font-black px-4 py-1.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-full uppercase tracking-widest shadow-sm">
                      {module.status}
                    </span>
                  )}

                  {module.status === "Enrolled" && (
                    <Link
                      to="/app/repository"
                      className="text-[10px] font-black text-emerald-600 hover:text-[#0B5E3C] uppercase tracking-widest flex items-center gap-1 group/link"
                    >
                      Go Repository
                      <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── MODAL: VIEW MODULES & LECTURERS ASSIGNED ─── */}
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
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight uppercase">
                    {selectedModule.title}
                  </h3>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Assigned Lecturer Info */}
                <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-[1.5rem] p-6">
                  <h4 className="text-[10px] font-black text-[#0B5E3C] uppercase tracking-[0.2em] mb-4">
                    Assigned Lecturer Details
                  </h4>
                  <div className="flex gap-4 items-start">
                    <div className="w-14 h-14 rounded-2xl bg-[#0B5E3C] text-white flex items-center justify-center font-black text-xl flex-shrink-0 shadow-md">
                      {getInitials(selectedModule.lecturer)}
                    </div>
                    <div className="space-y-1.5 flex-grow">
                      <p className="font-black text-slate-950 text-lg uppercase tracking-tight">
                        {selectedModule.lecturer}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md uppercase tracking-wider text-[10px]">
                          Lecturer
                        </span>
                        {selectedModule.lecturerFaculty && (
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-md uppercase tracking-wider text-[10px]">
                            {selectedModule.lecturerFaculty}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 text-xs text-slate-600 font-medium">
                        {selectedModule.code && selectedModule.code !== "N/A" && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-bold">Module Code:</span>
                            <span className="font-bold text-slate-800">{selectedModule.code}</span>
                          </div>
                        )}
                        {selectedModule.academicYear && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-bold">Academic Year:</span>
                            <span className="font-bold text-slate-800">
                              {selectedModule.academicYear.toString().startsWith("Year")
                                ? selectedModule.academicYear
                                : `Year ${selectedModule.academicYear}`}
                            </span>
                          </div>
                        )}
                        {selectedModule.lecturerDepartment && (
                          <div className="flex items-center gap-1.5 sm:col-span-2">
                            <span className="text-slate-400 font-bold">Department/Program:</span>
                            <span className="font-bold text-slate-800">{selectedModule.lecturerDepartment}</span>
                          </div>
                        )}
                        {selectedModule.lecturerEmail && (
                          <div className="flex items-center gap-1.5 sm:col-span-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-bold text-slate-800">{selectedModule.lecturerEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {c.description && (
                    <p className="mt-4 text-xs text-slate-600 leading-relaxed italic bg-white/70 p-3 rounded-xl border border-emerald-100/50">
                      {c.description}
                    </p>
                  )}
                </div>

                {/* Course Content Access */}
                <div className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-6 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                      Course Materials &amp; Lecture Handouts
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Access lecture notes, past exams, and uploaded materials for this module.
                    </p>
                  </div>
                  <Link
                    to="/app/repository"
                    onClick={() => setSelectedModule(null)}
                    className="px-5 py-2.5 bg-[#0B5E3C] hover:bg-[#08482E] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm"
                  >
                    Open Repository &rarr;
                  </Link>
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
