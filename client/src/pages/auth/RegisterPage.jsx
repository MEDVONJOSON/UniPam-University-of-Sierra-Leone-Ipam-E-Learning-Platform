import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import {
  User, Mail, UserPlus, AlertCircle, Loader2,
  GraduationCap, Library, BookOpen, BadgeCheck, CheckCircle2, Clock
} from "lucide-react";

// ── IPAM Faculties & their Programs ──────────────────────────────────────────
const IPAM_FACULTIES = [
  {
    id: "f1",
    name: "Faculty of Accounting & Finance",
    programs: [
      "BSc (Hons) in Financial Economics",
      "BSc in Applied Accounting",
      "BSc in Auditing, Taxation and Internal Control",
      "BSc in Banking and Finance",
      "BSc In Financial Services"
    ]
  },
  {
    id: "f2",
    name: "Faculty of Information Systems & Technology",
    programs: [
      "BSc Information Systems",
      "BSc Information Technology",
      "BSc In Computer Networking",
      "Diploma in Information Systems"
    ]
  },
  {
    id: "f3",
    name: "Faculty of Business Administration & Entrepreneurship",
    programs: [
      "BSc Business Administration",
      "BSc Human Resource Management",
      "BSc Marketing Management",
      "BSc Procurement & Supply Chain Management",
      "BSc Project Management",
      "BSc Entrepreneurship",
      "Diploma in Business Administration",
      "Diploma in Human Resource Management",
      "Diploma in Marketing",
      "Diploma in Procurement & Logistics",
      "Certificate in Business Management",
      "MBA (Master of Business Administration)",
      "Postgraduate Diploma in Management"
    ]
  },
  {
    id: "f4",
    name: "Faculty of Leadership & Governance",
    programs: [
      "BSc Public Administration",
      "BSc Public Policy & Development",
      "BSc Governance & Leadership",
      "Diploma in Public Administration",
      "Diploma in Development Management",
      "Certificate in Public Sector Leadership",
      "Postgraduate Diploma in Public Administration"
    ]
  },
  {
    id: "f5",
    name: "Faculty of Extra-Mural Studies",
    programs: [
      "Diploma in Community Development",
      "Diploma in Adult Education",
      "Diploma in Gender Studies",
      "Certificate in NGO Management",
      "Certificate in Social Work",
      "Certificate in Environmental Studies",
      "Certificate in Peace & Conflict Resolution",
      "Certificate in Rural Development"
    ]
  }
];

function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    studentIdNumber: "",
    universityProgramId: "",
    selectedProgram: ""
  });

  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registeredData, setRegisteredData] = useState(null);
  const navigate = useNavigate();

  const programs = selectedFaculty ? selectedFaculty.programs : [];

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentIdNumber.trim()) {
      setError("Student ID is required.");
      return;
    }
    if (!selectedFaculty) {
      setError("Please select your Faculty.");
      return;
    }
    if (!form.selectedProgram) {
      setError("Please select your Program of Study.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      // Default password is set to Student ID
      const res = await registerUser({
        ...form,
        password: form.studentIdNumber.trim(),
        universityProgramId: `${selectedFaculty.id}::${form.selectedProgram}`
      });

      if (res.pendingApproval || !res.token) {
        setRegisteredData(res);
      } else {
        navigate("/app/dashboard");
      }
    } catch (err) {
      setError(err.message || "Enrollment failed. Please check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (registeredData) {
    return (
      <div className="flex items-center justify-center py-16 px-4 bg-slate-50 min-h-screen">
        <div className="max-w-xl w-full bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#0B5E3C]" />
          
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-3xl bg-amber-50 text-amber-600 mb-6 shadow-inner border-2 border-amber-200">
            <Clock className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            Pending Registry Approval
          </div>

          <h1 className="text-3xl font-black text-[#0B5E3C] tracking-tight">
            Registration Submitted!
          </h1>
          <p className="mt-3 text-sm text-slate-500 font-bold leading-relaxed max-w-md mx-auto">
            Your student registration for <strong>{registeredData.user?.fullName}</strong> has been submitted to the University Registry for approval.
          </p>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 my-8 text-left space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student ID Number</span>
              <span className="text-sm font-black text-[#0B5E3C]">{registeredData.user?.studentIdNumber}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Default Login Password</span>
              <span className="text-sm font-black text-brand-700 bg-brand-50 px-2 py-0.5 rounded-lg">{registeredData.user?.defaultPassword || registeredData.user?.studentIdNumber}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
              <span className="text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wider">Awaiting Admin Approval</span>
            </div>
          </div>

          <div className="bg-brand-50 rounded-2xl p-5 border border-brand-100 text-left mb-8">
            <p className="text-[10px] font-black text-brand-700 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4" /> Next Steps:
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Once the administrator approves your account, log in using your <strong>Student ID</strong> and default password. You can then change your password anytime in your profile.
            </p>
          </div>

          <Link
            to="/login"
            className="w-full h-16 flex items-center justify-center bg-[#0B5E3C] text-white text-xs font-black rounded-2xl transition-all hover:bg-[#094a2f] shadow-xl uppercase tracking-[0.2em]"
          >
            Proceed to Portal Login
          </Link>
        </div>
      </div>
    );
  }

  const inputClass =
    "block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-[#0B5E3C] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0B5E3C]/10 focus:border-[#0B5E3C] transition-all";
  const labelClass =
    "text-[10px] font-black text-[#0B5E3C] uppercase tracking-widest ml-1 mb-2 block";

  // Progress
  const steps = [
    { label: "Personal Info", done: !!(form.name && form.email) },
    { label: "Student ID",    done: !!form.studentIdNumber },
    { label: "Faculty",       done: !!selectedFaculty },
    { label: "Program",       done: !!form.selectedProgram }
  ];

  return (
    <div className="flex items-center justify-center py-16 px-4 bg-slate-50 min-h-screen">
      <div className="max-w-xl w-full bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Top accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#0B5E3C]" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#0B5E3C]/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-2xl bg-white shadow-md p-2 mb-6 border border-slate-100">
            <img
              src="/img/unipam-logo.png"
              alt="UniPam Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-black text-[#0B5E3C] tracking-tight">
            UniPam Enrollment
          </h1>
          <p className="mt-2 text-sm text-slate-400 font-bold uppercase tracking-widest">
            IPAM — University of Sierra Leone eLearning
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-start justify-between mb-10 px-2 gap-1">
          {steps.map((step, idx) => (
            <div key={step.label} className="flex-1 flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                step.done
                  ? "bg-[#0B5E3C] text-white shadow-lg shadow-[#0B5E3C]/30"
                  : "bg-slate-100 text-slate-400"
              }`}>
                {step.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-wider text-center leading-tight ${
                step.done ? "text-[#0B5E3C]" : "text-slate-400"
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <form className="space-y-7" onSubmit={onSubmit}>

          {/* ── SECTION 1: Personal Info ── */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
              1 — Personal Information
            </p>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className={labelClass}>Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  className={inputClass}
                  placeholder="e.g. Alhaji Koroma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelClass}>Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className={inputClass}
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 2: Student ID ── */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
              2 — Student Identification
            </p>

            <div>
              <label htmlFor="studentId" className={labelClass}>Student ID Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <input
                  id="studentId"
                  type="text"
                  required
                  className={inputClass}
                  placeholder="e.g. 202612345"
                  value={form.studentIdNumber}
                  onChange={(e) => setForm({ ...form, studentIdNumber: e.target.value })}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-2 ml-1">
                Your Student ID will be used as your login credential and default password.
              </p>
            </div>
          </div>

          {/* ── SECTION 3: Faculty ── */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
              3 — Select Your Faculty
            </p>

            <div>
              <label htmlFor="faculty" className={labelClass}>Faculty</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Library className="h-5 w-5" />
                </div>
                <select
                  id="faculty"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-[#0B5E3C] appearance-none focus:outline-none focus:ring-4 focus:ring-[#0B5E3C]/10 focus:border-[#0B5E3C] transition-all"
                  value={selectedFaculty?.id || ""}
                  onChange={(e) => {
                    const fac = IPAM_FACULTIES.find(f => f.id === e.target.value);
                    setSelectedFaculty(fac || null);
                    setForm(f => ({ ...f, selectedProgram: "" }));
                  }}
                >
                  <option value="">— Select your Faculty —</option>
                  {IPAM_FACULTIES.map((fac) => (
                    <option key={fac.id} value={fac.id}>{fac.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── SECTION 4: Program (appears after faculty selected) ── */}
          {selectedFaculty && (
            <div className="space-y-4 animate-[fadeIn_0.25s_ease]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                4 — Select Your Program of Study
              </p>

              <div>
                <label htmlFor="program" className={labelClass}>
                  Programs under {selectedFaculty.name}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <select
                    id="program"
                    required
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-[#0B5E3C] appearance-none focus:outline-none focus:ring-4 focus:ring-[#0B5E3C]/10 focus:border-[#0B5E3C] transition-all"
                    value={form.selectedProgram}
                    onChange={(e) => setForm({ ...form, selectedProgram: e.target.value })}
                  >
                    <option value="">— Select your Program —</option>
                    {programs.map((prog) => (
                      <option key={prog} value={prog}>{prog}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Enrollment preview */}
              {form.selectedProgram && (
                <div className="bg-[#e8f4ef] border border-[#0B5E3C]/20 rounded-2xl p-4 flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-[#0B5E3C] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-[#0B5E3C] uppercase tracking-widest">
                      Enrollment Preview
                    </p>
                    <p className="text-xs font-bold text-slate-700 mt-1">{selectedFaculty.name}</p>
                    <p className="text-xs text-slate-500">{form.selectedProgram}</p>
                    {form.studentIdNumber && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        Student ID: <strong className="text-[#0B5E3C]">{form.studentIdNumber}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 text-xs font-black text-red-600 bg-red-50 rounded-2xl border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="uppercase tracking-tight">{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              id="register-submit-btn"
              type="submit"
              disabled={submitting}
              className="w-full h-16 flex items-center justify-center bg-[#0B5E3C] text-white text-[10px] font-black rounded-2xl transition-all hover:bg-[#094a2f] shadow-2xl shadow-[#0B5E3C]/20 disabled:opacity-70 uppercase tracking-widest gap-2"
            >
              {submitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create My Account
                </>
              )}
            </button>
          </div>

          {/* Policy */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
              By enrolling, you agree to the UniPam{" "}
              <Link to="#" className="text-[#0B5E3C] hover:underline">
                Academic Integrity &amp; eLearning Policy
              </Link>
            </p>
          </div>

          {/* Already enrolled */}
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Already Enrolled?{" "}
              <Link to="/login" className="text-[#0B5E3C] hover:underline transition-colors ml-1">
                Sign In to Portal
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
