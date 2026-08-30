import { useEffect, useState, useCallback } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../../services/authService";
import {
  getAdminStats, getRecentActivity, getAdminUsers,
  createAdminUser, updateAdminUser, deleteAdminUser, getSystemReports
} from "../../services/adminService";
import {
  LayoutDashboard, Users, BarChart3, Settings, LogOut, ShieldAlert, Search,
  Plus, Loader2, AlertCircle, CheckCircle2, ChevronDown, X,
  UserPlus, Activity, Shield, HardDrive, BookOpen, FileText, MessageSquare,
  Edit3, Eye, Trash2, TrendingUp, Clock, Mail, Phone, User, Building2
} from "lucide-react";

/* ─── Sidebar ──────────────────────────────────────────────────────────────── */
function AdminSidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    logoutUser();
    navigate("/admin-login");
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "users", label: "User Management", icon: <Users className="w-4 h-4" /> },
    { id: "reports", label: "System Reports", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="w-80 flex-shrink-0 hidden lg:flex flex-col bg-[#0B5E3C] text-white min-h-[calc(100vh-100px)] rounded-[3rem] p-8 shadow-2xl">
      <div className="mb-12 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/20 border border-brand-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-300 mb-4">
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
                ? "bg-white text-[#0B5E3C] shadow-xl"
                : "text-brand-200 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className={activeTab === item.id ? "text-brand-600" : "text-brand-300"}>
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

/* ─── Stat Card ────────────────────────────────────────────────────────────── */
function StatCard({ icon, value, label, accent = "brand" }) {
  const accents = {
    brand: "bg-brand-50 text-brand-600",
    blue: "bg-hover-50 text-hover-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all group">
      <div className={`w-14 h-14 rounded-2xl ${accents[accent]} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <p className="text-3xl font-black text-[#0B5E3C] tracking-tight mb-1">{value}</p>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}

/* ─── Tab Header ───────────────────────────────────────────────────────────── */
function TabHeader({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-brand-50 text-[#0B5E3C] rounded-2xl flex items-center justify-center shadow-inner">
          {icon}
        </div>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-1">
            Registry Control
          </div>
          <h1 className="text-3xl font-black text-[#0B5E3C] uppercase tracking-tight leading-none">{title}</h1>
          {subtitle && <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ─── Dashboard Tab ────────────────────────────────────────────────────────── */
function DashboardTab() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, a] = await Promise.all([getAdminStats(), getRecentActivity()]);
        setStats(s);
        setActivities(a);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-brand-600 animate-spin" /></div>;

  return (
    <div className="space-y-10">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={<Users className="w-7 h-7" />} value={stats?.totalUsers ?? 0} label="Total Users" accent="brand" />
        <StatCard icon={<User className="w-7 h-7" />} value={stats?.activeStudents ?? 0} label="Active Students" accent="blue" />
        <StatCard icon={<Building2 className="w-7 h-7" />} value={stats?.activeLecturers ?? 0} label="Active Lecturers" accent="green" />
        <StatCard icon={<BookOpen className="w-7 h-7" />} value={stats?.totalCourses ?? 0} label="Total Courses" accent="purple" />
        <StatCard icon={<FileText className="w-7 h-7" />} value={stats?.totalMaterials ?? 0} label="Total Materials" accent="amber" />
        <StatCard icon={<MessageSquare className="w-7 h-7" />} value={stats?.messagesToday ?? 0} label="Messages Today" accent="rose" />
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-6 bg-brand-600 rounded-full" />
          <h2 className="text-xl font-black text-[#0B5E3C] uppercase tracking-tight">Recent Activities</h2>
        </div>
        <div className="space-y-3">
          {activities.map((act) => (
            <div key={act.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-200 transition-all">
              <div className={`flex-shrink-0 mt-0.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                act.status === "SUCCESS"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}>
                {act.status}
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-bold text-[#0B5E3C] truncate">{act.description}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(act.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-center text-slate-400 py-8 font-bold uppercase tracking-widest text-xs">No recent activities</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── User Management Tab ──────────────────────────────────────────────────── */
function UserManagementTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Create form
  const [createForm, setCreateForm] = useState({
    fullName: "", email: "", phoneNumber: "", role: "lecturer",
    faculty: "", department: "", password: ""
  });

  // Edit form
  const [editForm, setEditForm] = useState({
    fullName: "", email: "", phoneNumber: "", role: "",
    faculty: "", department: "", is_active: true
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers({ search, role: roleFilter });
      setUsers(data);
    } catch (e) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    try {
      const result = await createAdminUser(createForm);
      setMessage(`Account created for ${result.fullName}. Generated password: ${result.generatedPassword}`);
      setShowCreateModal(false);
      setCreateForm({ fullName: "", email: "", phoneNumber: "", role: "lecturer", faculty: "", department: "", password: "" });
      loadUsers();
    } catch (err) { setError(err.message); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    try {
      await updateAdminUser(showEditModal.id, editForm);
      setMessage("User account updated successfully.");
      setShowEditModal(null);
      loadUsers();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async () => {
    setError(""); setMessage("");
    try {
      await deleteAdminUser(showDeleteConfirm.id);
      setMessage("User account deleted successfully.");
      setShowDeleteConfirm(null);
      loadUsers();
    } catch (err) { setError(err.message); }
  };

  const openEdit = (user) => {
    setEditForm({
      fullName: user.fullName, email: user.email, phoneNumber: user.phoneNumber,
      role: user.role, faculty: user.faculty, department: user.department, is_active: user.is_active
    });
    setShowEditModal(user);
  };

  const roleColors = {
    admin: "bg-purple-100 text-purple-700",
    lecturer: "bg-hover-100 text-hover-700",
    learner: "bg-brand-100 text-brand-700"
  };

  const filterBtns = [
    { label: "All Users", value: "all" },
    { label: "Students", value: "learner" },
    { label: "Lecturers", value: "lecturer" },
    { label: "Administrators", value: "admin" },
  ];

  const faculties = [
    "Faculty of Accounting & Finance",
    "Faculty of Information Systems & Technology",
    "Faculty of Business Administration & Entrepreneurship",
    "Faculty of Leadership & Governance",
    "Faculty of Extra-Mural Studies"
  ];

  const departments = [
    "Department of Accountancy",
    "Department of Financial Services",
    "Department of Banking and Finance",
    "Department of Information Systems",
    "Department of Information Technology",
    "Business Administration",
    "Marketing and Sales",
    "Procurement, Logistics & Supply Chain",
    "Department of Public Administration",
    "Extra-Mural Studies Department"
  ];

  const inputClass = "block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#0B5E3C] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all";
  const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block";

  return (
    <div className="space-y-8">
      {/* Status alerts */}
      {(error || message) && (
        <div className="space-y-3">
          {error && (
            <div className="flex items-center gap-3 p-4 text-sm font-bold text-red-600 bg-red-50 rounded-2xl border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> <p>{error}</p>
              <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
            </div>
          )}
          {message && (
            <div className="flex items-center gap-3 p-4 text-sm font-bold text-brand-700 bg-brand-50 rounded-2xl border border-brand-100">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> <p>{message}</p>
              <button onClick={() => setMessage("")} className="ml-auto"><X className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      )}

      {/* Search + Filters */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or student ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-[#0B5E3C] placeholder-slate-400 outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {filterBtns.map(btn => (
              <button
                key={btn.value}
                onClick={() => setRoleFilter(btn.value)}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  roleFilter === btn.value
                    ? "bg-[#0B5E3C] text-white shadow-lg"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-brand-600 rounded-full" />
            <h2 className="text-xl font-black text-[#0B5E3C] uppercase tracking-tight">Manage User Accounts</h2>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#0B5E3C] text-white text-[10px] font-black rounded-xl hover:bg-brand-800 transition-all shadow-lg uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="pb-3 pl-4">Student ID</th>
                  <th className="pb-3">Full Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Faculty</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Created</th>
                  <th className="pb-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(user => (
                  <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-4 text-xs font-bold text-slate-500">{user.studentIdNumber || "—"}</td>
                    <td className="py-4 font-black text-[#0B5E3C] text-sm">{user.fullName || "—"}</td>
                    <td className="py-4 text-xs font-bold text-slate-500">{user.email}</td>
                    <td className="py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider max-w-[150px] truncate">{user.faculty || "—"}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${roleColors[user.role] || "bg-slate-100 text-slate-500"}`}>
                        {user.role === "learner" ? "Student" : user.role}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${user.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 text-[10px] text-slate-400 font-bold">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="py-4 text-right pr-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(user)} className="p-2 rounded-lg hover:bg-hover-100 text-hover-600 transition-colors" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setShowViewModal(user)} className="p-2 rounded-lg hover:bg-brand-100 text-brand-600 transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setShowDeleteConfirm(user)} className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="8" className="py-16 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create User Modal ───────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-[#0B5E3C] rounded-full" />
                <h2 className="text-2xl font-black text-[#0B5E3C] uppercase tracking-tight">Create {createForm.role === "lecturer" ? "Lecturer" : "Student"} Account</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form className="space-y-6" onSubmit={handleCreate}>
              {/* Role selector */}
              <div>
                <label className={labelClass}>Account Type *</label>
                <div className="flex gap-3">
                  {["lecturer", "learner"].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, role: r })}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        createForm.role === r ? "bg-[#0B5E3C] text-white shadow-lg" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {r === "lecturer" ? "Lecturer" : "Student"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Info */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-4">Personal Information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" required placeholder="Full name" value={createForm.fullName}
                        onChange={e => setCreateForm({ ...createForm, fullName: e.target.value })}
                        className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="email" required placeholder="email@usl.edu.sl" value={createForm.email}
                        onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                        className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="tel" placeholder="+232 76 000000" value={createForm.phoneNumber}
                        onChange={e => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                        className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Department & Faculty */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-4">Department & Faculty Assignment</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Faculty *</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select required value={createForm.faculty}
                        onChange={e => setCreateForm({ ...createForm, faculty: e.target.value })}
                        className={`${inputClass} appearance-none`}>
                        <option value="">Select Faculty</option>
                        {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Department *</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select required value={createForm.department}
                        onChange={e => setCreateForm({ ...createForm, department: e.target.value })}
                        className={`${inputClass} appearance-none`}>
                        <option value="">Select Department</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="bg-brand-50 rounded-2xl p-5 border border-brand-100">
                <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-2">Account Status</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  An initial password will be generated and sent to the {createForm.role === "lecturer" ? "lecturer" : "student"} via email.
                  The {createForm.role === "lecturer" ? "lecturer" : "student"} can change their password upon first login for security.
                </p>
              </div>

              <button type="submit" className="w-full flex items-center justify-center gap-3 h-14 bg-[#0B5E3C] hover:bg-brand-800 text-white text-xs font-black rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em]">
                <UserPlus className="w-5 h-5" /> Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── View User Modal ─────────────────────────────────────────────── */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-[#0B5E3C] uppercase tracking-tight">User Details</h2>
              <button onClick={() => setShowViewModal(null)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              {[
                ["Full Name", showViewModal.fullName],
                ["Email", showViewModal.email],
                ["Role", showViewModal.role === "learner" ? "Student" : showViewModal.role],
                ["Student ID", showViewModal.studentIdNumber || "N/A"],
                ["Faculty", showViewModal.faculty || "N/A"],
                ["Department", showViewModal.department || "N/A"],
                ["Status", showViewModal.is_active ? "Active" : "Inactive"],
                ["Created", new Date(showViewModal.created_at).toLocaleDateString()],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                  <span className="text-sm font-bold text-[#0B5E3C]">{value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowViewModal(null)} className="w-full mt-8 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ─────────────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-[#0B5E3C] uppercase tracking-tight">Edit User</h2>
              <button onClick={() => setShowEditModal(null)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form className="space-y-5" onSubmit={handleEdit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={editForm.fullName}
                      onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                      className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={editForm.email}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                      className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="tel" value={editForm.phoneNumber}
                      onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                      className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Role</label>
                  <div className="relative">
                    <select value={editForm.role}
                      onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                      className={`${inputClass} appearance-none`}>
                      <option value="learner">Student</option>
                      <option value="lecturer">Lecturer</option>
                      <option value="admin">Admin</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Faculty</label>
                  <div className="relative">
                    <select value={editForm.faculty}
                      onChange={e => setEditForm({ ...editForm, faculty: e.target.value })}
                      className={`${inputClass} appearance-none`}>
                      <option value="">Select Faculty</option>
                      {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Department</label>
                  <div className="relative">
                    <select value={editForm.department}
                      onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                      className={`${inputClass} appearance-none`}>
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4">
                <input type="checkbox" id="activeToggle" checked={editForm.is_active}
                  onChange={e => setEditForm({ ...editForm, is_active: e.target.checked })}
                  className="w-4 h-4 accent-[#0B5E3C]" />
                <label htmlFor="activeToggle" className="text-sm font-bold text-[#0B5E3C]">Account Active</label>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowEditModal(null)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3.5 bg-[#0B5E3C] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-800 transition-all shadow-lg">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ───────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-black text-[#0B5E3C] uppercase tracking-tight mb-3">Confirm Deletion</h2>
            <p className="text-sm text-slate-500 mb-8">
              Are you sure you want to delete <strong className="text-[#0B5E3C]">{showDeleteConfirm.fullName || showDeleteConfirm.email}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── System Reports Tab ───────────────────────────────────────────────────── */
function SystemReportsTab() {
  const [reports, setReports] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSystemReports();
        setReports(data.reports);
        setActivityLog(data.activityLog || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-brand-600 animate-spin" /></div>;
  if (!reports) return null;

  return (
    <div className="space-y-10">
      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#0B5E3C] uppercase tracking-tight">{reports.userGrowth.title}</h3>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{reports.userGrowth.trend} this month</span>
            </div>
          </div>
          <p className="text-2xl font-black text-[#0B5E3C] mb-1">{reports.userGrowth.value}</p>
          <p className="text-xs text-slate-400 font-bold">{reports.userGrowth.description}</p>
        </div>

        {/* System Performance */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-hover-50 rounded-2xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-hover-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#0B5E3C] uppercase tracking-tight">{reports.systemPerformance.title}</h3>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Optimal</span>
            </div>
          </div>
          <p className="text-2xl font-black text-[#0B5E3C] mb-1">{reports.systemPerformance.value}</p>
          <p className="text-xs text-slate-400 font-bold">{reports.systemPerformance.description}</p>
        </div>

        {/* Security Audit */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#0B5E3C] uppercase tracking-tight">{reports.securityAudit.title}</h3>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Secure</span>
            </div>
          </div>
          <p className="text-2xl font-black text-[#0B5E3C] mb-1">{reports.securityAudit.value}</p>
          <p className="text-xs text-slate-400 font-bold">{reports.securityAudit.description}</p>
        </div>

        {/* Storage Usage */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
              <HardDrive className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#0B5E3C] uppercase tracking-tight">{reports.storageUsage.title}</h3>
              <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{reports.storageUsage.percentUsed}% used</span>
            </div>
          </div>
          <p className="text-2xl font-black text-[#0B5E3C] mb-2">{reports.storageUsage.description}</p>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-1000"
              style={{ width: `${reports.storageUsage.percentUsed}%` }} />
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-6 bg-brand-600 rounded-full" />
          <h2 className="text-xl font-black text-[#0B5E3C] uppercase tracking-tight">System Activity Log — Last 24 Hours</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="pb-3 pl-4">Timestamp</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activityLog.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 pl-4 text-[10px] font-bold text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      log.status === "SUCCESS"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-sm font-bold text-[#0B5E3C]">{log.description}</td>
                </tr>
              ))}
              {activityLog.length === 0 && (
                <tr><td colSpan="3" className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No activity in the last 24 hours</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Settings Tab ─────────────────────────────────────────────────────────── */
function SettingsTab() {
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("adminSettings") || "null") || {
        siteName: "UniPam — University of Sierra Leone eLearning",
        supportEmail: "support@usl.edu.sl",
        defaultLanguage: "English",
        maintenanceMode: false,
        passwordMinLength: 8,
        sessionTimeout: 60,
        twoFactorAuth: false,
        emailNotifications: true,
        systemAlerts: true,
        activityDigest: false
      };
    } catch { return {
      siteName: "UniPam — University of Sierra Leone eLearning",
      supportEmail: "support@usl.edu.sl",
      defaultLanguage: "English",
      maintenanceMode: false,
      passwordMinLength: 8,
      sessionTimeout: 60,
      twoFactorAuth: false,
      emailNotifications: true,
      systemAlerts: true,
      activityDigest: false
    }; }
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("adminSettings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass = "block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#0B5E3C] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all";
  const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block";

  return (
    <div className="space-y-8">
      {saved && (
        <div className="flex items-center gap-3 p-4 text-sm font-bold text-brand-700 bg-brand-50 rounded-2xl border border-brand-100">
          <CheckCircle2 className="w-5 h-5" /> Settings saved successfully.
        </div>
      )}

      {/* Platform Settings */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-6 bg-brand-600 rounded-full" />
          <h2 className="text-xl font-black text-[#0B5E3C] uppercase tracking-tight">Platform Settings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Site Name</label>
            <input type="text" value={settings.siteName}
              onChange={e => setSettings({ ...settings, siteName: e.target.value })}
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Support Email</label>
            <input type="email" value={settings.supportEmail}
              onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Default Language</label>
            <select value={settings.defaultLanguage}
              onChange={e => setSettings({ ...settings, defaultLanguage: e.target.value })}
              className={`${inputClass} appearance-none`}>
              <option>English</option>
              <option>Krio</option>
              <option>French</option>
            </select>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 h-fit mt-6">
            <input type="checkbox" id="maintenanceMode" checked={settings.maintenanceMode}
              onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="w-4 h-4 accent-[#0B5E3C]" />
            <label htmlFor="maintenanceMode" className="text-sm font-bold text-[#0B5E3C]">Maintenance Mode</label>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-6 bg-hover-600 rounded-full" />
          <h2 className="text-xl font-black text-[#0B5E3C] uppercase tracking-tight">Security Settings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Minimum Password Length</label>
            <input type="number" min="6" max="32" value={settings.passwordMinLength}
              onChange={e => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })}
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Session Timeout (minutes)</label>
            <input type="number" min="5" max="480" value={settings.sessionTimeout}
              onChange={e => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
              className={inputClass} />
          </div>
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4">
            <input type="checkbox" id="twoFa" checked={settings.twoFactorAuth}
              onChange={e => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
              className="w-4 h-4 accent-[#0B5E3C]" />
            <label htmlFor="twoFa" className="text-sm font-bold text-[#0B5E3C]">Two-Factor Authentication</label>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-6 bg-amber-500 rounded-full" />
          <h2 className="text-xl font-black text-[#0B5E3C] uppercase tracking-tight">Notification Preferences</h2>
        </div>
        <div className="space-y-3">
          {[
            { key: "emailNotifications", label: "Email Notifications" },
            { key: "systemAlerts", label: "System Alerts" },
            { key: "activityDigest", label: "Daily Activity Digest" },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
              <span className="text-sm font-bold text-[#0B5E3C]">{item.label}</span>
              <button
                onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key] })}
                className={`w-12 h-6 rounded-full transition-all relative ${settings[item.key] ? "bg-[#0B5E3C]" : "bg-slate-300"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${settings[item.key] ? "left-6" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave}
        className="w-full flex items-center justify-center gap-3 h-14 bg-[#0B5E3C] hover:bg-brand-800 text-white text-xs font-black rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em]">
        <CheckCircle2 className="w-5 h-5" /> Save All Settings
      </button>
    </div>
  );
}

/* ─── Main Admin Dashboard Page ────────────────────────────────────────────── */
function AdminDashboardPage() {
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!user) return <Navigate to="/admin-login" replace />;
  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 max-w-md w-full">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-50 text-red-600 mb-6 border-4 border-white shadow-lg">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-[#0B5E3C] uppercase tracking-tight mb-3">Access Denied</h2>
          <p className="text-slate-500 font-medium mb-8">This administrative portal is restricted to University Registry personnel only.</p>
          <Link to="/" className="w-full flex items-center justify-center py-4 bg-[#0B5E3C] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-brand-800 transition-all">
            Return to Campus
          </Link>
        </div>
      </div>
    );
  }

  const tabIcons = {
    dashboard: <LayoutDashboard className="w-7 h-7" />,
    users: <Users className="w-7 h-7" />,
    reports: <BarChart3 className="w-7 h-7" />,
    settings: <Settings className="w-7 h-7" />,
  };

  const tabTitles = {
    dashboard: "Administrator Dashboard",
    users: "User Management",
    reports: "System Reports & Monitoring",
    settings: "Platform Settings",
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10 pb-20 max-w-[1600px] mx-auto">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-grow space-y-10">
        <TabHeader
          icon={tabIcons[activeTab]}
          title={tabTitles[activeTab]}
          subtitle="UniPam · University of Sierra Leone eLearning"
        />

        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "users" && <UserManagementTab />}
        {activeTab === "reports" && <SystemReportsTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}

export default AdminDashboardPage;
