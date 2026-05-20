import { useEffect, useState } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import { getCurrentUser } from "../../services/authService";
import { getEnrollments, getCourseLMS, getLessonDetails, updateEnrollmentProgress } from "../../services/platformService";
import {
  PlayCircle, ChevronDown, ExternalLink, TrendingUp, Minus, CheckCircle2,
  Loader2, AlertCircle, BookOpen, BarChart3, Target, ArrowLeft, GraduationCap,
  FileText, Video, HelpCircle, ChevronRight, Lock, Award, Clock
} from "lucide-react";

function CoursePlayerPage() {
  const user = getCurrentUser();
  const { courseId: paramCourseId } = useParams();
  
  const [enrollments, setEnrollments] = useState([]);
  const [activeEnrollment, setActiveEnrollment] = useState(null);
  const [curriculum, setCurriculum] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [error, setError] = useState("");

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const ens = await getEnrollments();
      setEnrollments(ens);
      
      const targetId = paramCourseId || (ens.length > 0 ? ens[0].course_id : null);
      if (targetId) {
        const enrollment = ens.find(e => e.course_id === targetId) || (ens.length > 0 ? ens[0] : null);
        setActiveEnrollment(enrollment);
        await loadCurriculum(targetId);
      }
    } catch (err) {
      setError("Failed to load learning data.");
    } finally {
      setLoading(false);
    }
  };

  const loadCurriculum = async (courseId) => {
    try {
      const data = await getCourseLMS(courseId);
      setCurriculum(data);
      if (data.modules?.length > 0 && data.modules[0].lessons?.length > 0) {
        loadLesson(data.modules[0].lessons[0].id);
      }
    } catch (err) {
      setError("Failed to load course curriculum.");
    }
  };

  const loadLesson = async (lessonId) => {
    setLessonLoading(true);
    try {
      const data = await getLessonDetails(lessonId);
      setCurrentLesson(data);
    } catch (err) {
      setError("Failed to load lesson content.");
    } finally {
      setLessonLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadInitialData();
  }, [user, paramCourseId]);

  if (!user) return <Navigate to="/user-login" replace />;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-32 bg-white rounded-[4rem] border border-slate-100 shadow-2xl max-w-4xl mx-auto px-10">
        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
           <Target className="w-12 h-12" />
        </div>
        <h3 className="text-3xl font-black text-[#0d2d57] mb-4 uppercase tracking-tight">No Active Enrollments Found</h3>
        <p className="text-slate-400 font-bold mb-12 uppercase tracking-widest text-[10px]">Secure your future. Browse our accredited catalogs and start learning today.</p>
        <Link to="/course-catalog" className="inline-flex items-center gap-4 px-12 py-6 bg-[#0d2d57] text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:bg-blue-900 transition-all">
          <BookOpen className="w-6 h-6" /> Explore Catalogs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-20 px-4">
      
      {/* Dynamic Navigation Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-10 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
         <div className="flex items-center gap-6">
            <Link to="/user-dashboard" className="p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] hover:bg-white hover:shadow-xl transition-all text-[#0d2d57]">
               <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
               <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1.5 px-3 py-1 bg-blue-50 w-fit rounded-full">
                  <GraduationCap className="w-4 h-4" />
                  {curriculum?.course?.provider_name || 'IPAM eCampus'}
               </div>
               <h1 className="text-3xl font-black text-[#0d2d57] tracking-tight truncate max-w-xl">{curriculum?.course?.title || "Course Player"}</h1>
            </div>
         </div>
         
         <div className="flex items-center gap-6 bg-slate-50 p-3 rounded-[2rem] border border-slate-100">
            <div className="text-right hidden sm:block px-4 border-r border-slate-200">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</p>
               <p className="text-sm font-black text-[#0d2d57]">{Math.round(activeEnrollment?.progress_percent || 0)}% Complete</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 flex items-center justify-center bg-white shadow-soft">
               <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Player Area */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-black rounded-[3rem] overflow-hidden shadow-2xl aspect-video relative group">
              {lessonLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-30">
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                </div>
              ) : currentLesson?.content_type === 'video' ? (
                <iframe 
                  className="w-full h-full"
                  src={currentLesson.video_url}
                  title={currentLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-20 text-center">
                   <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-8">
                      <FileText className="w-12 h-12 text-white/40" />
                   </div>
                   <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">{currentLesson?.title || 'SELECT A LESSON'}</h3>
                   <p className="text-white/40 text-sm uppercase font-black tracking-widest">Article Content Below</p>
                </div>
              )}
           </div>

           {/* Lesson Tabs/Content */}
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-50">
                 <button className="px-10 py-6 border-b-4 border-blue-600 text-[10px] font-black text-[#0d2d57] uppercase tracking-widest bg-blue-50/30">Lesson Overview</button>
                 <button className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#0d2d57] transition-all">Resources (2)</button>
                 <button className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#0d2d57] transition-all">Q&A Hub</button>
              </div>
              <div className="p-10 lg:p-14">
                 <h2 className="text-2xl font-black text-[#0d2d57] uppercase tracking-tight mb-6">{currentLesson?.title}</h2>
                 <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed uppercase tracking-tight text-xs">
                    {currentLesson?.article_content || "No extended description available for this lesson."}
                    <div className="mt-10 p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                       <p className="text-[10px] font-black text-[#0d2d57] uppercase tracking-widest flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          Key Takeaways
                       </p>
                       <ul className="space-y-3">
                          <li className="flex gap-4">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                             <span>Master the core platform architecture and navigation.</span>
                          </li>
                          <li className="flex gap-4">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                             <span>Sync your institutional credentials securely.</span>
                          </li>
                       </ul>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Course Curriculum Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[800px]">
              <div className="p-8 border-b border-slate-50 bg-[#0d2d57]">
                 <p className="text-[8px] font-black text-blue-300 uppercase tracking-[0.3em] mb-2">Curriculum Explorer</p>
                 <h3 className="text-lg font-black text-white uppercase tracking-tight">Course Modules</h3>
              </div>
              
              <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-6">
                 {curriculum?.modules?.map((mod, modIdx) => (
                    <div key={mod.id} className="space-y-3">
                       <div className="flex items-center justify-between group">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                             <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[#0d2d57] group-hover:bg-blue-600 group-hover:text-white transition-all">{modIdx + 1}</span>
                             {mod.title}
                          </h4>
                          <span className="text-[8px] font-black text-slate-300 uppercase">{mod.lessons?.length} LESSONS</span>
                       </div>
                       
                       <div className="space-y-2 ml-9">
                          {mod.lessons?.map((lesson) => {
                             const active = currentLesson?.id === lesson.id;
                             return (
                                <button 
                                   key={lesson.id}
                                   onClick={() => loadLesson(lesson.id)}
                                   className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${active ? 'bg-blue-50 border-blue-200 text-blue-700' : 'hover:bg-slate-50 border-transparent text-slate-500'}`}
                                >
                                   <div className="flex items-center gap-4">
                                      {lesson.content_type === 'video' ? <Video className={`w-4 h-4 ${active ? 'text-blue-600' : 'opacity-40'}`} /> : <FileText className={`w-4 h-4 ${active ? 'text-blue-600' : 'opacity-40'}`} />}
                                      <span className="text-[10px] font-black uppercase tracking-tight text-left">{lesson.title}</span>
                                   </div>
                                   <div className="flex items-center gap-2">
                                      <span className="text-[8px] font-bold opacity-60">{lesson.duration_minutes}M</span>
                                      {active && <ChevronRight className="w-4 h-4" />}
                                   </div>
                                </button>
                             );
                          })}
                       </div>
                    </div>
                 ))}
              </div>

              <div className="p-8 border-t border-slate-50 bg-slate-50/50">
                 <button className="w-full py-5 bg-[#0d2d57] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/10 hover:bg-blue-900 transition-all flex items-center justify-center gap-3">
                    Next Major Module <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
           </div>

           {/* Quick Stats/Alert */}
           <div className="p-8 bg-emerald-50 rounded-[3rem] border border-emerald-100 flex items-center gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600">
                 <Award className="w-8 h-8" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1.5 leading-none">Graduation Eligible</p>
                 <p className="text-[10px] font-bold text-emerald-600/80 leading-relaxed uppercase tracking-tight">Complete {curriculum?.modules?.length || 0} modules to unlock certificate.</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

export default CoursePlayerPage;
