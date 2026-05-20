import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import { User, Mail, Lock, Phone, Globe, UserPlus, AlertCircle, Loader2, ShieldCheck, GraduationCap } from "lucide-react";

function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    country: "Sierra Leone",
    role: "learner"
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await registerUser(form);
      navigate("/user-dashboard");
    } catch (err) {
      setError(err.message || "Admission request failed. Please verify your details.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#0d2d57] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all uppercase";
  const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block";

  return (
    <div className="flex items-center justify-center py-16 px-4 bg-slate-50 min-h-screen">
      <div className="max-w-2xl w-full space-y-10 bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-blue-50 text-[#0d2d57] mb-6 shadow-inner">
            <UserPlus className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-[#0d2d57] tracking-tight">
            UniPam Enrollment
          </h2>
          <p className="mt-2 text-sm text-slate-400 font-bold uppercase tracking-widest">
            University of Sierra Leone eCampus
          </p>
        </div>

        <form className="mt-10 space-y-8" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Full Name */}
            <div className="col-span-1 md:col-span-2">
              <label className={labelClass}>Full Legal Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  className={inputClass}
                  placeholder="EX: ALHAJI KOROMA"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div className="col-span-1 md:col-span-2">
              <label className={labelClass}>Active Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  className={inputClass}
                  placeholder="NAME@EXAMPLE.COM"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={labelClass}>Portal Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  className={inputClass}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            {/* Role selection */}
            <div>
              <label className={labelClass}>Enrollment Track</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <select 
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-[#0d2d57] appearance-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 uppercase tracking-widest"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="student">Student / Degree Candidate</option>
                  <option value="lecturer">Lecturer / Instructor</option>
                  <option value="institution">Educational Institution</option>
                  <option value="university">University Partner</option>
                  <option value="partner">Corporate Partner</option>
                  <option value="organization">Non-Profit / Organization</option>
                </select>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="+232 ..."
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Country */}
            <div>
              <label className={labelClass}>Country of Residence</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Globe className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="SIERRA LEONE"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 text-xs font-black text-red-600 bg-red-50 rounded-2xl border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="uppercase tracking-tight">{error}</p>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-16 flex items-center justify-center bg-[#0d2d57] text-white text-[10px] font-black rounded-2xl transition-all hover:bg-blue-900 shadow-2xl shadow-blue-900/20 disabled:opacity-70 uppercase tracking-widest"
            >
              {submitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Submit Enrollment Request"
              )}
            </button>
          </div>

          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 text-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
               By submitting, you agree to the UniPam <br />
               <Link className="text-blue-600 hover:underline">Academic Integrity & eCampus Policy</Link>
             </p>
          </div>

          <div className="text-center mt-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Already Enrolled?{" "}
              <Link
                to="/user-login"
                className="text-blue-600 hover:text-blue-700 transition-colors ml-1"
              >
                Sign in to Portal
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
