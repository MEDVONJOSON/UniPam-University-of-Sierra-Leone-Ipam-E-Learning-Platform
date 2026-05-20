import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getCurrentUser, loginUser, logoutUser } from "../../services/authService";
import { ShieldAlert, Mail, Lock, Loader2, AlertCircle, LayoutDashboard, GraduationCap } from "lucide-react";

function AdminLoginPage() {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (currentUser?.role === "admin") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const result = await loginUser(form);
      if (result.user.role !== "admin") {
        logoutUser();
        setError("Unauthorized Access. This portal is for USL Registry Administrators only.");
        return;
      }
      navigate("/admin-dashboard");
    } catch (err) {
      setError(err.message || "Registry authentication failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center py-20 px-4 bg-slate-50 min-h-[80vh]">
      <div className="max-w-md w-full space-y-10 bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
        
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-6 shadow-sm border border-red-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-[#0d2d57] uppercase tracking-tight leading-none mb-2">
            UniPam Registry
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            University of Sierra Leone eCampus
          </p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Registry Credentials (Email)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#0d2d57] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all uppercase"
                  placeholder="REGISTRY@USL.EDU.SL"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Access Token / Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#0d2d57] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all uppercase"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 text-xs font-black text-red-600 bg-red-50 rounded-xl border border-red-100 animate-in shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="uppercase tracking-tight">{error}</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-16 flex items-center justify-center bg-red-600 text-white text-[10px] font-black rounded-2xl transition-all hover:bg-red-700 shadow-xl shadow-red-600/20 disabled:opacity-70 uppercase tracking-widest"
            >
              {submitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Authorize Official Access"
              )}
            </button>
          </div>
        </form>

        <p className="text-[9px] text-center text-slate-400 font-black uppercase tracking-widest mt-6 leading-relaxed">
          Authorized use ONLY. All activities on the Registry Information System are monitored and logged.
        </p>
      </div>
    </div>
  );
}

export default AdminLoginPage;
