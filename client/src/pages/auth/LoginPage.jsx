import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { Lock, AlertCircle, Loader2, User, GraduationCap, BadgeCheck, Mail, BookOpen } from "lucide-react";

function LoginPage() {
  const [loginMode, setLoginMode] = useState("student"); // "student" | "lecturer"
  const [form, setForm] = useState({ studentId: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const isLecturer = loginMode === "lecturer";

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = isLecturer
        ? { email: form.email, password: form.password }
        : { studentId: form.studentId, password: form.password };
      const data = await loginUser(payload);
      // Lecturers go to teach dashboard, students to learner dashboard
      if (data.user.role === "lecturer") {
        navigate("/app/teach");
      } else {
        navigate("/app/dashboard");
      }
    } catch (err) {
      setError(err.message || (isLecturer ? "Invalid email or password." : "Invalid Student ID or password. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (mode) => {
    setLoginMode(mode);
    setError("");
    setForm({ studentId: "", email: "", password: "" });
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-[80vh]">
      <div className="max-w-md w-full space-y-10 bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#0B5E3C]" />

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-[#e8f4ef] text-[#0B5E3C] shadow-inner mb-6">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-[#0B5E3C] tracking-tight">
            UniPam Portal
          </h2>
          <p className="mt-2 text-sm text-slate-400 font-black uppercase tracking-[0.2em]">
            University of Sierra Leone eLearning
          </p>
        </div>

        {/* ═══════════ Role Tab Switcher ═══════════ */}
        <div className="bg-slate-100 rounded-2xl p-1.5 flex gap-1">
          <button
            type="button"
            id="tab-student"
            onClick={() => switchMode("student")}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              !isLecturer
                ? "bg-[#0B5E3C] text-white shadow-lg shadow-[#0B5E3C]/20"
                : "text-slate-500 hover:text-[#0B5E3C] hover:bg-white/50"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Student
          </button>
          <button
            type="button"
            id="tab-lecturer"
            onClick={() => switchMode("lecturer")}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              isLecturer
                ? "bg-[#0B5E3C] text-white shadow-lg shadow-[#0B5E3C]/20"
                : "text-slate-500 hover:text-[#0B5E3C] hover:bg-white/50"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Lecturer
          </button>
        </div>

        {/* ═══════════ Login Form ═══════════ */}
        <form className="mt-10 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-5">

            {/* Credential Field — switches between Student ID and Email */}
            <div className="space-y-2" key={loginMode + "-credential"}>
              <label
                htmlFor="credential"
                className="text-[10px] font-black text-[#0B5E3C] uppercase tracking-widest ml-1 block"
              >
                {isLecturer ? "University Email" : "Student ID"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  {isLecturer ? <Mail className="h-5 w-5" /> : <BadgeCheck className="h-5 w-5" />}
                </div>
                <input
                  id="credential"
                  type={isLecturer ? "email" : "text"}
                  required
                  autoComplete={isLecturer ? "email" : "username"}
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-[#0B5E3C] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0B5E3C]/10 focus:border-[#0B5E3C] transition-all"
                  placeholder={isLecturer ? "e.g. lecturer@usl.edu.sl" : "e.g. 202612345"}
                  value={isLecturer ? form.email : form.studentId}
                  onChange={(e) =>
                    setForm(isLecturer
                      ? { ...form, email: e.target.value }
                      : { ...form, studentId: e.target.value }
                    )
                  }
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-[10px] font-black text-[#0B5E3C] uppercase tracking-widest ml-1 block"
              >
                Portal Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="block w-full pl-12 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-[#0B5E3C] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0B5E3C]/10 focus:border-[#0B5E3C] transition-all"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#0B5E3C] transition-colors text-xs font-black uppercase"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-2 ml-1">
                {isLecturer
                  ? <>Use the password provided by the university administration.</>
                  : <>Default password is your <strong>Student ID</strong>. Change it in your profile after first login.</>
                }
              </p>
            </div>
          </div>

          {/* Remember / Forgot */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 accent-[#0B5E3C]"
              />
              <label
                htmlFor="remember"
                className="text-[10px] font-black text-slate-500 uppercase tracking-widest"
              >
                Remember Me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-[10px] font-black text-[#0B5E3C] uppercase tracking-widest hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 text-xs font-bold text-red-600 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="uppercase">{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              id="login-submit-btn"
              type="submit"
              disabled={submitting}
              className="w-full h-16 flex items-center justify-center bg-[#0B5E3C] text-white text-[10px] font-black rounded-2xl transition-all hover:bg-[#094a2f] shadow-xl shadow-[#0B5E3C]/20 disabled:opacity-70 uppercase tracking-widest gap-2"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLecturer ? <BookOpen className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                  {isLecturer ? "Sign In as Lecturer" : "Sign In to Campus"}
                </>
              )}
            </button>
          </div>

          {/* Register link — students only */}
          {!isLecturer && (
            <div className="text-center mt-6">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                New Student?{" "}
                <Link
                  to="/register"
                  className="text-[#0B5E3C] hover:underline transition-colors ml-1"
                >
                  Apply Online Now
                </Link>
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                Quick Access
              </span>
            </div>
          </div>

          {/* Quick Demo Login Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              id="demo-student-login-btn"
              onClick={() => {
                localStorage.setItem("currentUser", JSON.stringify({
                  id: "261102433",
                  name: "Alhaji Koroma",
                  email: "a.koroma@usl.edu.sl",
                  role: "learner",
                  studentIdNumber: "261102433"
                }));
                localStorage.setItem("idwAuthToken", "usl-demo-token");
                navigate("/app/dashboard");
              }}
              className="w-full flex items-center justify-center gap-3 h-14 text-[10px] font-black rounded-2xl text-[#0B5E3C] bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100 uppercase tracking-widest"
            >
              <User className="w-4 h-4" />
              Quick Demo — Student Login
            </button>

            <button
              type="button"
              id="demo-lecturer-login-btn"
              onClick={() => {
                localStorage.setItem("currentUser", JSON.stringify({
                  id: "lecturer-uuid",
                  name: "Dr. Ernest Udeh, Ph.D.",
                  email: "lecturer@usl.edu.sl",
                  role: "lecturer",
                  studentIdNumber: ""
                }));
                localStorage.setItem("idwAuthToken", "usl-demo-lecturer-token");
                navigate("/app/teach");
              }}
              className="w-full flex items-center justify-center gap-3 h-14 text-[10px] font-black rounded-2xl text-white bg-emerald-700 hover:bg-emerald-800 transition-all shadow-md shadow-emerald-700/20 uppercase tracking-widest"
            >
              <BookOpen className="w-4 h-4" />
              Quick Demo — Lecturer Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
