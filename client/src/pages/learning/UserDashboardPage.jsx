import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { getCurrentUser } from "../../services/authService";
import {
  getDashboardRecommendations, getDashboardSummary,
  getEnrollments, updateEnrollmentProgress
} from "../../services/platformService";
import {
  BookOpen, Award, TrendingUp, Loader2, BarChart3, ChevronRight,
  GraduationCap, Target, AlertCircle, Zap, ExternalLink, 
  Coins, FileCheck, CreditCard, PlayCircle, MessageCircle, User,
  Building2, Bell, LibraryBig
} from "lucide-react";

const INITIAL_SUMMARY = { enrolled_courses: 0, completed_courses: 0, average_progress: 0, rewards: 0, eligible_certs: 0, credits: 0, weekly_progress: 0 };

function DashboardStat({ icon, value, label, linkText, linkTo, color }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-blue-200 transition-all">
      <div className={`text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4`}>{label}</div>
      <div className="text-5xl font-black text-[#0d2d57] mb-4">{value}</div>
      {linkText && (
        <Link to={linkTo} className={`text-[10px] font-black uppercase tracking-widest ${color} hover:underline underline-offset-4`}>
          {linkText}
        </Link>
      )}
    </div>
  );
}

function UserDashboardPage() {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/user-login" replace />;

  const [summary, setSummary] = useState(INITIAL_SUMMARY);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboardData() {
    setLoading(true);
    setError("");
    try {
      const [summaryData, enrollmentData] = await Promise.all([
        getDashboardSummary(), getEnrollments()
      ]);
      setSummary({ ...INITIAL_SUMMARY, ...(summaryData || {}) });
      setEnrollments(enrollmentData || []);
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDashboardData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  const lessonsThisWeek = enrollments.reduce((acc, curr) => acc + (curr.lessons_completed || 0), 0);

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      
      {/* Student Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         
         {/* Identity Card */}
         <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
            <div className="relative flex-shrink-0">
               <div className="w-32 h-32 rounded-full border-4 border-blue-500 p-1.5 flex items-center justify-center bg-slate-50 transition-transform group-hover:scale-105 duration-500">
                  <User className="w-16 h-16 text-slate-300" />
               </div>
               <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg">
                  <GraduationCap className="w-4 h-4" />
               </div>
            </div>
            
            <div className="flex-grow z-10 text-center md:text-left">
               <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
                  <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest italic">
                     {summary.institution?.faculty_name || "Assigning Faculty..."}
                  </div>
                  {summary.scholarship_status !== 'none' && (
                    <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-1">
                       <Zap className="w-3 h-3" /> Scholarship: {summary.scholarship_status}
                    </div>
                  )}
                  {summary.unread_notifications > 0 && (
                    <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-1">
                       <Bell className="w-3 h-3" /> {summary.unread_notifications} New Alerts
                    </div>
                  )}
               </div>
               <h1 className="text-3xl font-black text-[#0d2d57] mb-1">Hi, {user.name}</h1>
               <p className="text-slate-400 text-sm font-bold uppercase tracking-tight">
                  {summary.institution?.department_name || "Department Registry Pending"}
               </p>
               <div className="mt-8 flex items-center justify-center md:justify-start gap-6">
                  <div>
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">University Transcript ID</p>
                     <p className="text-sm font-black text-[#0d2d57] tracking-wider uppercase">USL-{user.id?.substring(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="w-px h-8 bg-slate-100" />
                  <div>
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Academic Status</p>
                     <p className="text-sm font-black text-emerald-500 tracking-wider uppercase">In Good Standing</p>
                  </div>
               </div>
            </div>

            <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden md:flex items-center justify-center opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
               <Building2 className="w-32 h-32 text-[#0d2d57] -rotate-12" />
            </div>
         </div>

         {/* Academic Stats */}
         <DashboardStat
           label="Academic Rewards"
           value={summary.rewards || 0}
           linkText="View Ledger"
           linkTo="/profile"
           color="text-blue-600"
         />
         <DashboardStat
           label="Certifications Applied"
           value={summary.eligible_certs || 0}
           color="text-slate-400"
         />
         <DashboardStat
           label="Activity this Week"
           value={summary.weekly_progress || 0}
           suffix="Modules"
           color="text-emerald-500"
         />
      </div>

      {/* Credit Summary - Desktop Row View */}
      <div className="hidden lg:grid grid-cols-4 gap-6 -mt-4">
         <div className="col-start-4">
            <DashboardStat
              label="Degree Credits"
              value={summary.credits || 0}
              color="text-slate-400"
            />
         </div>
      </div>

      {/* Navigation Pivot */}
      <div className="flex justify-center -mb-5 relative z-10">
         <div className="bg-white border border-slate-100 px-10 py-3 rounded-full shadow-xl flex items-center gap-3">
            <span className="text-xs font-black text-[#0d2d57] uppercase tracking-[0.2em]">Learning Environment</span>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
         </div>
      </div>

      {/* Content Area */}
      <div className="space-y-12">

         {/* Faculty Enrollment Area */}
         <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 lg:p-12">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h2 className="text-2xl font-black text-[#0d2d57] uppercase tracking-tight">Active Faculty Enrollments</h2>
                  <p className="text-slate-400 text-sm font-medium">Continue your academic journey</p>
               </div>
               <Link to="/course-catalog" className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline underline-offset-8">Explore Faculties</Link>
            </div>

            {enrollments.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {enrollments.map((item) => (
                     <div key={item.id} className="group bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 hover:bg-white hover:shadow-2xl transition-all duration-500">
                        <div className="flex items-start justify-between mb-8">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 font-black group-hover:bg-[#0d2d57] group-hover:text-white transition-colors">
                                 {item.category === 'Academic' ? <GraduationCap className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.provider_name}</p>
                                 <h3 className="text-lg font-black text-[#0d2d57] group-hover:text-blue-700 transition-colors line-clamp-1 uppercase tracking-tight">{item.title}</h3>
                              </div>
                           </div>
                           <div className="flex-shrink-0">
                              <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-sm ${item.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-[#0d2d57] text-white'}`}>
                                 {item.status === 'completed' ? 'Graduated' : 'Enrolled'}
                              </span>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <span>Syllabus Progress</span>
                              <span className="text-[#0d2d57]">{item.progress_percent}%</span>
                           </div>
                           <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                              <div
                                 className={`h-full transition-all duration-1000 ${item.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-600'}`}
                                 style={{ width: `${item.progress_percent}%` }}
                              />
                           </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-slate-200/50 flex items-center justify-between">
                           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <PlayCircle className="w-4 h-4" />
                              {item.lessons_completed || '—'} Modules Finished
                           </div>
                            <Link to={`/course-player/${item.course_id}`} className="flex items-center gap-2 text-xs font-black text-[#0d2d57] group-hover:text-blue-600 transition-colors uppercase tracking-widest">
                               Study <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                     </div>
                  ))}
               </div>
            ) : (
               <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                  <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active enrollments found</p>
                  <Link to="/course-catalog" className="mt-4 inline-block px-8 py-3 bg-[#0d2d57] text-white text-[10px] font-black uppercase tracking-widest rounded-xl">View Course Catalog</Link>
               </div>
            )}
         </div>

         {/* Official Institutional Banner */}
         <div className="bg-[#0d2d57] rounded-[3.5rem] p-12 lg:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex-grow max-w-2xl">
               <div className="inline-block px-4 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Digital Transformation</div>
               <h2 className="text-3xl lg:text-5xl font-black leading-tight mb-6 uppercase tracking-tight">
                  Official <br /><span className="text-blue-400 font-black">Digital Exams</span> Portal
               </h2>
               <p className="text-lg text-blue-100 font-medium leading-relaxed mb-10 opacity-80">
                  Prepare for your end-of-semester assessments through our proctored digital examination environment. Access past papers and mock exams today.
               </p>
               <button className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-500 transition-all hover:scale-105 active:scale-95">
                  Academic Portal
               </button>
            </div>
            <div className="relative z-10 w-full lg:w-1/3 flex justify-center">
               <div className="relative">
                  <div className="w-56 h-56 bg-white/5 backdrop-blur-sm rounded-[3rem] rotate-12 absolute -z-10" />
                  <Award className="w-40 h-40 text-blue-400 relative z-10 drop-shadow-2xl" />
               </div>
            </div>
         </div>

      </div>

      {/* Support AI Toggle */}
      <div className="fixed bottom-8 right-8 z-[100]">
         <button className="w-16 h-16 bg-[#0d2d57] text-white rounded-2xl shadow-2xl hover:bg-blue-900 transition-all hover:scale-110 active:scale-90 flex items-center justify-center group relative border-2 border-blue-900/50">
            <MessageCircle className="w-8 h-8" />
            <div className="absolute right-full mr-4 bg-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-100 text-[#0d2d57] font-black text-[10px] uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none scale-90 group-hover:scale-100 duration-300">
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
