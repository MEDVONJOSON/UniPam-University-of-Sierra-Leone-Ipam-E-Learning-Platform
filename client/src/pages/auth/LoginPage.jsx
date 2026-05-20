import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { Mail, Lock, LogIn, AlertCircle, Loader2, User, GraduationCap } from "lucide-react";

function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await loginUser(form);
      navigate("/user-dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify your Student ID/Email.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-[80vh]">
      <div className="max-w-md w-full space-y-10 bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#0d2d57]" />
        
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-blue-50 text-[#0d2d57] shadow-inner mb-6">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-[#0d2d57] tracking-tight">
            UniPam Portal
          </h2>
          <p className="mt-2 text-sm text-slate-400 font-black uppercase tracking-[0.2em]">
            University of Sierra Leone eCampus
          </p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Student Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#0d2d57] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all uppercase"
                  placeholder="ID@USL.EDU.SL"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Portal Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#0d2d57] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all uppercase"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
             <div className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                <label className="ml-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest">Remember Me</label>
             </div>
             <Link className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Forgot Password?</Link>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 text-xs font-bold text-red-600 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="uppercase">{error}</p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-16 flex items-center justify-center bg-[#0d2d57] text-white text-[10px] font-black rounded-2xl transition-all hover:bg-blue-900 shadow-xl shadow-blue-900/10 disabled:opacity-70 uppercase tracking-widest"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign in to Campus"
              )}
            </button>
          </div>

          <div className="text-center mt-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              New Student?{" "}
              <Link
                to="/user-register"
                className="text-blue-600 hover:text-blue-700 transition-colors ml-1"
              >
                Apply Online Now
              </Link>
            </p>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">Institutional Access</span></div>
          </div>

          <button
            type="button"
            onClick={() => {
              localStorage.setItem("currentUser", JSON.stringify({
                id: "261102433",
                name: "Alhaji Koroma",
                email: "a.koroma@usl.edu.sl",
                role: "learner"
              }));
              localStorage.setItem("idwAuthToken", "usl-demo-token");
              navigate("/user-dashboard");
            }}
            className="w-full flex items-center justify-center gap-3 h-14 text-[10px] font-black rounded-2xl text-[#0d2d57] bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100 uppercase tracking-widest"
          >
            <User className="w-4 h-4" />
            Quick Demo Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
