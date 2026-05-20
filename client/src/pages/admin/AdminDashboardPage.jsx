import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../../services/authService";
import { createCourse, getCourses } from "../../services/platformService";
import {
  LayoutDashboard, Plus, BookOpen, Users, TrendingUp, ChevronDown,
  Loader2, AlertCircle, CheckCircle2, ShieldAlert, Globe, FileText, GraduationCap, Minus,
  LogOut, Settings, BarChart3, ShieldCheck, UserPlus, Search
} from "lucide-react";

function AdminSidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    logoutUser();
    navigate("/admin-login");
  };

  const menuItems = [
    { id: 'overview', label: 'Registry Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'programs', label: 'Program Repository', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'students', label: 'Student Registry', icon: <Users className="w-4 h-4" /> },
    { id: 'reports', label: 'Academic Reports', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="w-80 flex-shrink-0 hidden lg:flex flex-col bg-[#0d2d57] text-white min-h-[calc(100vh-100px)] rounded-[3rem] p-8 shadow-2xl">
      <div className="mb-12 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-300 mb-4">
          Registry Portal
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter">Admin Panel</h2>
      </div>

      <nav className="flex-grow space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
              activeTab === item.id 
                ? "bg-white text-[#0d2d57] shadow-xl" 
                : "text-blue-200 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className={activeTab === item.id ? "text-blue-600" : "text-blue-300"}>
              {item.icon}
            </div>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="pt-8 mt-8 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}

function AdminDashboardPage() {
  const [loadingInitial, setLoadingInitial] = useState(true); // Added for first load check
  const user = getCurrentUser();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState('overview');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    providerSlug: "usl-digital", title: "", category: "", level: "Undergraduate",
    duration: "", costType: "paid", externalUrl: "", description: ""
  });

  if (!user) return <Navigate to="/admin-login" replace />;
  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 max-w-md w-full">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-50 text-red-600 mb-6 border-4 border-white shadow-lg">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-[#0d2d57] uppercase tracking-tight mb-3">Access Denied</h2>
          <p className="text-slate-500 font-medium mb-8">This administrative portal is restricted to University Registry personnel only.</p>
          <Link to="/" className="w-full flex items-center justify-center py-4 bg-[#0d2d57] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-900 transition-all">
            Return to Campus
          </Link>
        </div>
      </div>
    );
  }

  async function loadCourses() {
    setLoading(true);
    setError("");
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err) { 
      setError("Sync Error: Could not connect to the University Repository.");
      setCourses([]); 
    } finally { 
      setLoading(false); 
      setLoadingInitial(false);
    }
  }

  useEffect(() => { loadCourses(); }, []);

  async function onSubmit(event) {
    event.preventDefault();
    setError(""); setMessage("");
    try {
      await createCourse(form);
      setMessage("Account of course has been registered in the University Repository.");
      setForm({ providerSlug: "usl-digital", title: "", category: "", level: "Undergraduate", duration: "", costType: "paid", externalUrl: "", description: "" });
      setShowForm(false);
      await loadCourses();
    } catch (err) { setError(err.message); }
  }

  const inputClass = "block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#0d2d57] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all uppercase";
  const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block";
  const totalCourses = courses.length;
  const uniqueFaculties = new Set(courses.map(c => c.provider?.slug)).size;

  return (
    <div className="flex flex-col lg:flex-row gap-10 pb-20 max-w-[1600px] mx-auto">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-grow space-y-12">
        {/* Institutional Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-50 text-[#0d2d57] rounded-3xl flex items-center justify-center shadow-inner">
              {activeTab === 'overview' ? <LayoutDashboard className="w-8 h-8" /> : (activeTab === 'programs' ? <BookOpen className="w-8 h-8" /> : <Users className="w-8 h-8" />)}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">Registry Control</div>
              <h1 className="text-4xl font-black text-[#0d2d57] uppercase tracking-tight leading-none">
                {activeTab === 'overview' ? 'Registry Overview' : (activeTab === 'programs' ? 'Program Repository' : 'Student Registry')}
              </h1>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2">UniPam. University Of Sierra Leone eCampus</p>
            </div>
          </div>
          {activeTab === 'programs' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center justify-center gap-3 px-8 h-16 bg-[#0d2d57] text-white text-[10px] font-black rounded-2xl hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/10 uppercase tracking-[0.2em]"
            >
              {showForm ? "Cancel Entry" : "Publish Course Entry"}
              {showForm ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Admin Status Alerts */}
        {(error || message) && (
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-4 p-6 text-sm font-black text-red-600 bg-red-50 rounded-2xl border border-red-100 animate-in slide-in-from-top-4">
                <AlertCircle className="w-6 h-6 flex-shrink-0" /> <p className="uppercase">{error}</p>
              </div>
            )}
            {message && (
              <div className="flex items-center gap-4 p-6 text-sm font-black text-emerald-700 bg-emerald-50 rounded-2xl border border-emerald-100 animate-in slide-in-from-top-4">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" /> <p className="uppercase">{message}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'overview' && (
          <>
            {/* Registry Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <BookOpen className="w-7 h-7 text-blue-600" />, value: totalCourses, label: "Active Programs", bg: "bg-blue-50" },
                { icon: <GraduationCap className="w-7 h-7 text-[#0d2d57]" />, value: uniqueFaculties || 0, label: "USL Faculties", bg: "bg-slate-100" },
                { icon: <Users className="w-7 h-7 text-emerald-600" />, value: "0", label: "Digital Registrants", bg: "bg-emerald-50" }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-blue-200 transition-all flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-[1.5rem] ${stat.bg} flex items-center justify-center mb-6`}>{stat.icon}</div>
                  <p className="text-4xl font-black text-[#0d2d57] uppercase tracking-tight mb-1">{stat.value}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Activity snapshot */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-6 bg-blue-600 rounded-full" />
                <h2 className="text-xl font-black text-[#0d2d57] uppercase tracking-tight leading-none">Global Repository Snapshot</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                  <div className="flex items-center gap-4 mb-4 text-blue-600">
                    <ShieldCheck className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">System Integrity</span>
                  </div>
                  <p className="text-2xl font-black text-[#0d2d57] uppercase mb-1">Authenticated</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">Registry Node Connected</p>
                </div>
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                  <div className="flex items-center gap-4 mb-4 text-emerald-600">
                    <UserPlus className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Entry Access</span>
                  </div>
                  <p className="text-2xl font-black text-[#0d2d57] uppercase mb-1">Open</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">Public Catalog Sync Active</p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'programs' && (
          <div className="space-y-12">
            {/* Institutional Course Entry Form */}
            {showForm && (
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl p-10 lg:p-14 animate-in fade-in slide-in-from-bottom-5">
                <div className="flex items-center gap-4 mb-12">
                   <div className="w-2 h-8 bg-[#0d2d57] rounded-full" />
                   <h2 className="text-2xl font-black text-[#0d2d57] uppercase tracking-tight leading-none">Academic Repository Entry</h2>
                </div>
                <form className="space-y-8" onSubmit={onSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className={labelClass}>Faculty / Provider</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <Globe className="h-5 w-5" />
                        </div>
                        <select
                          value={form.providerSlug} onChange={(e) => setForm({ ...form, providerSlug: e.target.value })}
                          className="appearance-none block w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-[#0d2d57] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all uppercase tracking-widest"
                        >
                          <option value="usl-ipam">IPAM - USL</option>
                          <option value="usl-fbc">Fourah Bay College</option>
                          <option value="usl-comahs">COMAHS</option>
                          <option value="usl-digital">USL Digital Campus</option>
                          <option value="coursera">Global Partner (Coursera)</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Program Official Title</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <input
                          type="text" placeholder="EX: BSC INFORMATION SYSTEMS" required className={inputClass}
                          value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Program Category</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <FileText className="h-5 w-5" />
                        </div>
                        <input
                          type="text" placeholder="EX: ACADEMIC DEGREE" required className={inputClass}
                          value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Academic Level</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                        <select
                          value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
                          className="appearance-none block w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-[#0d2d57] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all uppercase tracking-widest"
                        >
                          <option>Undergraduate</option>
                          <option>Postgraduate</option>
                          <option>Professional</option>
                          <option>Short Course</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Program Duration</label>
                      <input
                        type="text" placeholder="EX: 4 YEARS" required
                        className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#0d2d57] focus:outline-none focus:ring-4 focus:ring-blue-500/10 uppercase"
                        value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Fee Structure</label>
                      <select
                        value={form.costType} onChange={(e) => setForm({ ...form, costType: e.target.value })}
                        className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-[#0d2d57] focus:outline-none focus:ring-4 focus:ring-blue-500/10 uppercase tracking-widest"
                      >
                        <option value="paid">Tuition Applied</option>
                        <option value="free">Scholarship / Free</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Syllabus Documentation (External Link)</label>
                    <input
                      type="url" placeholder="HTTPS://USL.EDU.SL/SYLLABUS/..." required
                      className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#0d2d57] focus:outline-none focus:ring-4 focus:ring-blue-500/10 uppercase"
                      value={form.externalUrl} onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Program Abstract / Description</label>
                    <textarea
                      rows="4" placeholder="BRIEF ACADEMIC OVERVIEW..."
                      className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#0d2d57] resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 uppercase"
                      value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-3 w-full h-16 bg-[#0d2d57] hover:bg-blue-900 text-white text-xs font-black rounded-2xl transition-all shadow-xl shadow-blue-900/20 uppercase tracking-[0.2em]"
                  >
                    <Plus className="w-5 h-5" /> Publish to Repository
                  </button>
                </form>
              </div>
            )}

            {/* Program List Snapshot */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-6 bg-blue-600 rounded-full" />
                   <h2 className="text-xl font-black text-[#0d2d57] uppercase tracking-tight leading-none">Academic Program Registry</h2>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="SEARCH REPOSITORY..." className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500/10 transition-all" />
                </div>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="pb-4 pl-4">Program Title</th>
                        <th className="pb-4">Faculty</th>
                        <th className="pb-4">Level</th>
                        <th className="pb-4 text-right pr-4">Structure</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {courses.map((course) => (
                        <tr key={course.id} className="group hover:bg-slate-50 transition-colors">
                          <td className="py-6 pl-4 font-black text-[#0d2d57] text-sm uppercase tracking-tight">{course.title}</td>
                          <td className="py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{course.provider?.slug || 'IDW'}</td>
                          <td className="py-6">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">{course.level}</span>
                          </td>
                          <td className="py-6 text-right pr-4">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${course.costType === 'free' ? 'text-emerald-500' : 'text-blue-600'}`}>
                              {course.costType === 'free' ? 'Scholarship' : 'Tuition'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {courses.length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No programs registered in repository</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-12 text-center">
              <Users className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <h2 className="text-2xl font-black text-[#0d2d57] uppercase tracking-tight mb-4">Student Registry Coming Soon</h2>
              <p className="text-slate-500 font-medium max-w-md mx-auto">The centralized student management module is currently being synchronized with the University admission systems.</p>
           </div>
        )}

        {activeTab === 'reports' && (
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-12 text-center">
              <BarChart3 className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <h2 className="text-2xl font-black text-[#0d2d57] uppercase tracking-tight mb-4">Academic Reports Portal</h2>
              <p className="text-slate-500 font-medium max-w-md mx-auto">Generate semester analytics, graduation rates, and digital certificate issuance tracking.</p>
           </div>
        )}
      </div>
    </div>
  );
}



export default AdminDashboardPage;
