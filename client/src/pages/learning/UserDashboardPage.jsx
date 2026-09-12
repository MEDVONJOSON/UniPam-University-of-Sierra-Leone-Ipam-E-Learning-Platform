import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../../services/authService";
import {
  getDashboardSummary,
  getEnrollments,
  getRepositoryMaterials,
  downloadCourseMaterial,
  getMyCourses
} from "../../services/platformService";
import {
  BookOpen, Award, Loader2, ChevronRight,
  GraduationCap, PlayCircle, User,
  Building2, Bell, Zap, ExternalLink, Download,
  FileText, Video, Link2, File, FileSpreadsheet, Image as ImageIcon, FolderOpen,
  Camera, ShieldAlert, Key, ShieldCheck, AlertCircle, X
} from "lucide-react";
import DashboardStat from "../../components/DashboardStat";

const TYPE_CONFIG = {
  pdf:          { Icon: FileText,       color: "#EF4444", bg: "#FEF2F2", label: "PDF" },
  video:        { Icon: Video,          color: "#6366F1", bg: "#EEF2FF", label: "Video" },
  doc:          { Icon: FileText,       color: "#3B82F6", bg: "#EFF6FF", label: "Document" },
  presentation: { Icon: File,           color: "#F97316", bg: "#FFF7ED", label: "Presentation" },
  spreadsheet:  { Icon: FileSpreadsheet,color: "#10B981", bg: "#F0FDF4", label: "Spreadsheet" },
  image:        { Icon: ImageIcon,      color: "#EC4899", bg: "#FDF2F8", label: "Image" },
  link:         { Icon: Link2,          color: "#0EA5E9", bg: "#F0F9FF", label: "External Link" },
};

function formatBytes(bytes) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const INITIAL_SUMMARY = { enrolled_courses: 0, completed_courses: 0, average_progress: 0, rewards: 0, eligible_certs: 0, credits: 0, weekly_progress: 0 };

function UserDashboardPage() {
  const user = getCurrentUser();
  const isLecturer = user?.role === "lecturer" || user?.role === "admin";

  const [summary, setSummary] = useState(INITIAL_SUMMARY);
  const [enrollments, setEnrollments] = useState([]);
  const [repositoryMaterials, setRepositoryMaterials] = useState([]);
  const [downloadedMaterials, setDownloadedMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingMap, setDownloadingMap] = useState({});

  async function loadDashboardData() {
    setLoading(true);
    setError("");
    try {
      const [summaryData, enrollmentData, repositoryMaterialsData, myCoursesData] = await Promise.all([
        getDashboardSummary(),
        !isLecturer ? getEnrollments() : Promise.resolve([]),
        getRepositoryMaterials(),
        isLecturer ? getMyCourses() : Promise.resolve([])
      ]);
      setSummary({ ...INITIAL_SUMMARY, ...(summaryData || {}) });
      setEnrollments(enrollmentData || []);
      setRepositoryMaterials(repositoryMaterialsData || []);
      setCourses(myCoursesData || []);
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDashboardData(); }, [isLecturer]);

  useEffect(() => {
    const key = `downloaded_materials_${user?.id || 'default'}`;
    try {
      const items = JSON.parse(localStorage.getItem(key) || "[]");
      setDownloadedMaterials(items);
    } catch (_) {
      setDownloadedMaterials([]);
    }
  }, [user?.id]);

  const handleReDownload = async (item) => {
    if (!item.course_id || !item.id) return;
    setDownloadingMap(prev => ({ ...prev, [item.id]: true }));
    setError("");
    try {
      await downloadCourseMaterial(item.course_id, item.id, item.original_filename || item.title || "learning-material");
    } catch (err) {
      setError(err.message || "Download failed. Please sign in again and try once more.");
    } finally {
      setDownloadingMap(prev => ({ ...prev, [item.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  // Real registration data from localStorage (set on register/login)
  const facultyName = user?.facultyName || "";
  const programName = user?.program || "";

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">

      {error && (
        <div className="bg-red-50 rounded-2xl p-4 border border-red-100 text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="font-semibold text-sm">{error}</p>
          <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ⚠️ DEFAULT PASSWORD SECURITY NOTICE BANNER (Only shows until password is changed) */}
      {!isLecturer && user?.hasChangedPassword === false && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border-2 border-amber-500/30 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/20">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-200">
                  Security Action Required
                </span>
                <h3 className="text-base font-black text-amber-950">Default Login Password Active</h3>
              </div>
              <p className="text-xs text-amber-900/80 font-semibold leading-relaxed max-w-2xl">
                You are currently logged in with your initial default password (your Student ID). Please update your password in your profile to secure your account. Once updated, this notice will disappear immediately.
              </p>
            </div>
          </div>
          <Link
            to="/app/profile"
            className="px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex-shrink-0 hover:scale-105"
          >
            Change Password Now &rarr;
          </Link>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          SECTION 1: STUDENT PROFILE OVERVIEW & IDENTITY CARD
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

         {/* Identity Card */}
         <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
            
            {isLecturer ? (
              <>
                <div className="relative flex-shrink-0 flex flex-col items-center gap-3">
                   <div className="relative">
                      <div className="w-32 h-32 rounded-full border-4 border-[#0B5E3C] p-1.5 flex items-center justify-center bg-emerald-50 transition-transform group-hover:scale-105 duration-500 overflow-hidden">
                         {user?.profilePhotoUrl ? (
                           <img src={user.profilePhotoUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                         ) : (
                           <User className="w-16 h-16 text-[#0B5E3C]" />
                         )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-[#0B5E3C] text-white p-2.5 rounded-full shadow-lg border-2 border-white">
                         <Camera className="w-5 h-5 text-amber-400" />
                      </div>
                   </div>
                   <div className="mt-2 px-3 py-1.5 bg-emerald-100/50 text-[#0B5E3C] rounded-full text-[10px] font-black uppercase tracking-widest">
                     VERIFIED LECTURER
                   </div>
                </div>

                <div className="flex-grow z-10 text-center md:text-left">
                   <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                      <Building2 className="w-3.5 h-3.5" />
                      {user?.facultyName || "FACULTY OF INFORMATION SYSTEMS & TECHNOLOGY"}
                   </div>
                   <h1 className="text-3xl font-black text-[#0B5E3C] mb-1.5 uppercase">
                      {user?.name || "DR. ERNEST UDEH, PH.D."}
                   </h1>
                   <p className="text-slate-500 text-xs font-bold uppercase tracking-tight">
                      {user?.department || "DEPARTMENT OF INFORMATION SYSTEMS"} · {user?.currentAcademicYear || "2025/2026"} ACADEMIC YEAR
                   </p>

                   <div className="mt-6 text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-3">MODULES LECTURING:</p>
                      <div className="flex flex-wrap gap-2">
                        {courses && courses.length > 0 ? (
                           courses.map((c, idx) => (
                             <span key={c.id} className={`px-3 py-1.5 border rounded-lg text-xs font-bold ${idx % 2 === 0 ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-emerald-50 border-emerald-100 text-emerald-700"}`}>
                               {c.title}
                             </span>
                           ))
                        ) : (
                           <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-lg text-xs font-bold italic">No courses assigned yet</span>
                        )}
                      </div>
                   </div>
                </div>
              </>
            ) : (
              <>
                <div className="relative flex-shrink-0">
                   <div className="w-32 h-32 rounded-full border-4 border-[#0B5E3C] p-1.5 flex items-center justify-center bg-slate-50 transition-transform group-hover:scale-105 duration-500 overflow-hidden">
                      {user?.profilePhotoUrl ? (
                        <img src={user.profilePhotoUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-16 h-16 text-slate-400" />
                      )}
                   </div>
                   <div className="absolute -bottom-2 -right-2 bg-[#0B5E3C] text-white p-2 rounded-full shadow-lg">
                      <GraduationCap className="w-4 h-4 text-amber-400" />
                   </div>
                </div>

                <div className="flex-grow z-10 text-center md:text-left">
                   {/* Faculty badge — from registration */}
                   {facultyName && (
                     <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                        {facultyName}
                     </div>
                   )}
                   <h1 className="text-3xl font-black text-[#0B5E3C] mb-1">Hi, {user?.name || "Student"}</h1>
                   {/* Program — from registration */}
                   <p className="text-slate-500 text-sm font-bold uppercase tracking-tight">
                      {programName || "—"}
                   </p>

                   <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-left">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Student ID</p>
                         <p className="text-sm font-black text-[#0B5E3C] tracking-wider uppercase">{user?.studentIdNumber || "—"}</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Email</p>
                         <p className="text-xs font-bold text-slate-600 truncate">{user?.email || "—"}</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Academic Year</p>
                         <p className="text-sm font-black text-[#0B5E3C] tracking-wider uppercase">
                            {user?.currentAcademicYear ? `Year ${user.currentAcademicYear}` : "—"}
                         </p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Semester</p>
                         <p className="text-sm font-black text-[#0B5E3C] tracking-wider uppercase">
                            {user?.currentSemester ? `Semester ${user.currentSemester}` : "—"}
                         </p>
                      </div>
                   </div>
                </div>
              </>
            )}

            <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden md:flex items-center justify-center opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
               <Building2 className="w-32 h-32 text-[#0B5E3C] -rotate-12" />
            </div>
         </div>

         {/* Academic Stats */}
         <DashboardStat
           label="Course Materials uploaded"
           value={repositoryMaterials.length || 0}
           linkText="Browse Library"
           linkTo="/app/repository"
           color="text-[#0B5E3C]"
         />
         <DashboardStat
           label="Materials Downloaded"
           value={downloadedMaterials.length || 0}
           color="text-[#0B5E3C]"
         />
         <DashboardStat
           label="Active Modules Available. To Download"
           value={Math.max(0, repositoryMaterials.length - downloadedMaterials.length)}
           suffix="Modules"
           color="text-emerald-700"
         />
      </div>

      {/* Navigation Pivot */}
      <div className="flex justify-center -mb-5 relative z-10">
         <div className="bg-white border border-slate-200 px-10 py-3 rounded-full shadow-lg flex items-center gap-3">
            <span className="text-xs font-black text-[#0B5E3C] uppercase tracking-[0.2em]">Learning Environment</span>
            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />
         </div>
      </div>

      {/* Content Area */}
      <div className="space-y-12">

         {/* ════════════════════════════════════════════════════════════════════
             SECTION 3: DOWNLOADED LEARNING MATERIALS
         ════════════════════════════════════════════════════════════════════ */}
         <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 lg:p-12">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h2 className="text-2xl font-black text-[#0B5E3C] uppercase tracking-tight">Downloaded Learning Materials</h2>
                  <p className="text-slate-500 text-sm font-medium">Access your offline study resources</p>
               </div>
               <Link to="/app/repository" className="text-xs font-black text-emerald-700 uppercase tracking-widest hover:underline underline-offset-8">Browse Repository</Link>
            </div>

            {downloadedMaterials.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {downloadedMaterials.map((item) => {
                     const typeCfg = TYPE_CONFIG[item.material_type] || TYPE_CONFIG.doc;
                     const { Icon: TypeIcon, color: typeColor, bg: typeBg } = typeCfg;
                     const isDownloading = Boolean(downloadingMap[item.id]);
                     return (
                        <div key={item.id} className="group bg-slate-50/70 border border-slate-200 rounded-[2.5rem] p-8 hover:bg-white hover:border-emerald-300 hover:shadow-2xl transition-all duration-300">
                           <div className="flex items-start justify-between mb-8">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black group-hover:scale-105 transition-transform" style={{ backgroundColor: typeBg, color: typeColor }}>
                                    <TypeIcon className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.course_code || 'General'}</p>
                                    <h3 className="text-lg font-black text-[#0B5E3C] group-hover:text-emerald-800 transition-colors line-clamp-1 uppercase tracking-tight">{item.title}</h3>
                                 </div>
                              </div>
                              <div className="flex-shrink-0">
                                 <span className="text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-sm bg-emerald-50 text-emerald-800 border border-emerald-100">
                                    Downloaded
                                 </span>
                              </div>
                           </div>

                           <div className="space-y-2 text-xs text-slate-500">
                              <p className="line-clamp-2">{item.description || 'No description provided.'}</p>
                              {item.course_title && (
                                 <div className="flex items-center gap-1.5 truncate text-slate-600 font-medium">
                                    <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="truncate">{item.course_title}</span>
                                 </div>
                              )}
                           </div>

                           <div className="mt-10 pt-6 border-t border-slate-200/60 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                 {item.file_size ? formatBytes(item.file_size) : 'Resource'}
                              </div>
                              {item.external_url ? (
                                 <a href={item.external_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-black text-[#0B5E3C] hover:text-emerald-700 transition-colors uppercase tracking-widest">
                                    Open Link <ExternalLink className="w-4 h-4" />
                                 </a>
                              ) : (
                                 <button
                                   type="button"
                                   onClick={() => handleReDownload(item)}
                                   disabled={isDownloading}
                                   className="flex items-center gap-2 text-xs font-black text-[#0B5E3C] hover:text-emerald-700 transition-colors uppercase tracking-widest disabled:opacity-60"
                                 >
                                    {isDownloading ? "Downloading..." : "Re-download"}
                                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                 </button>
                              )}
                           </div>
                        </div>
                     );
                  })}
               </div>
            ) : (
               <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                  <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No learning materials downloaded yet</p>
                  <Link to="/app/repository" className="mt-4 inline-block px-8 py-3 bg-[#0B5E3C] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-800 transition-colors">Go to Repository</Link>
               </div>
            )}
         </div>

          {/* ════════════════════════════════════════════════════════════════════
             SECTION 5 (LAST): UNIPAM E-LEARNING BANNER
          ════════════════════════════════════════════════════════════════════ */}
         <div className="bg-[#0B5E3C] rounded-[3.5rem] p-12 lg:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex-grow max-w-2xl">
               <div className="inline-block px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Digital Transformation</div>
               <h2 className="text-3xl lg:text-5xl font-black leading-tight mb-6 uppercase tracking-tight">
                  UniPam E-Learning
               </h2>
               <p className="text-lg text-brand-100 font-medium leading-relaxed mb-10 opacity-80">
                  Access course materials and communicate with lecturers and student.
               </p>
               <button className="px-12 py-5 bg-white text-[#0B5E3C] rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-slate-50 transition-all hover:scale-105 active:scale-95">
                  UniPam
               </button>
            </div>
            <div className="relative z-10 w-full lg:w-1/3 flex justify-center">
               <div className="relative">
                  <div className="w-56 h-56 bg-white/5 backdrop-blur-sm rounded-[3rem] rotate-12 absolute -z-10" />
                  <Award className="w-40 h-40 text-amber-400 relative z-10 drop-shadow-2xl" />
               </div>
            </div>
         </div>

      </div>

      {/* Support AI Toggle */}
      <div className="fixed bottom-8 right-8 z-[100]">
         <button className="w-16 h-16 bg-[#0B5E3C] text-white rounded-2xl shadow-2xl hover:bg-emerald-800 transition-all hover:scale-110 active:scale-90 flex items-center justify-center group relative border-2 border-emerald-900/50">
            <GraduationCap className="w-8 h-8 text-amber-400" />
            <div className="absolute right-full mr-4 bg-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-100 text-[#0B5E3C] font-black text-[10px] uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none scale-90 group-hover:scale-100 duration-300">
               USL Help Desk AI
            </div>
         </button>
      </div>
    </div>
  );
}

// Helper Component for UI consistency
const ArrowRight = ({ className }) => <ChevronRight className={className} />;

export default UserDashboardPage;
