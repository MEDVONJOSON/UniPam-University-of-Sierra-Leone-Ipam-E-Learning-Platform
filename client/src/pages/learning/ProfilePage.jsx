import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, hydrateCurrentUser, logoutUser, updateProfile, changePassword } from "../../services/authService";
import {
  User, Mail, GraduationCap,
  Loader2, AlertCircle, Camera, Save, UserCheck,
  CheckCircle2, Target, Sparkles, LogOut, Lock, Key, ShieldCheck
} from "lucide-react";

function ProfileSection({ title, children }) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
      <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-[10px] font-black text-[#0B5E3C] uppercase tracking-[0.2em]">{title}</h3>
      </div>
      <div className="p-8">
        {children}
      </div>
    </div>
  );
}

function ProfileInput({ label, value, name, onChange, type = "text", disabled = false, placeholder = "" }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-hover-500 uppercase tracking-widest leading-none block ml-1">{label}</label>
      <input 
        name={name}
        type={type} 
        value={value || ""} 
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#0B5E3C] focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed placeholder-slate-300"
      />
    </div>
  );
}

function ProfilePage() {
  const navigate = useNavigate();
  const [sessionUser, setSessionUser] = useState(() => getCurrentUser());
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!sessionUser?.id) return;
    refreshProfile();
  }, [sessionUser?.id]);

  const refreshProfile = async () => {
    try {
      const data = await hydrateCurrentUser();
      const currentUser = getCurrentUser();
      setSessionUser(currentUser);
      // Map snail_case from DB to camelCase for the form state
      setProfile({
        fullName: data.full_name || data.fullName || "",
        email: data.email || "",
        phoneNumber: data.phone_number || data.phoneNumber || "",
        countryCode: data.country_code || "",
        educationBackground: data.education_background || "",
        skillsInterests: data.skills_interests || [],
        learningGoals: data.learning_goals || "",
        designation: data.designation || "",
        websiteUrl: data.website_url || "",
        bio: data.bio || "",
        institutionName: data.institution_name || "",
        faculty: data.faculty || currentUser?.facultyName || "",
        department: data.department || "",
        enrollmentYear: data.enrollment_year || "",
        academicStanding: data.academic_standing || "",
        role: data.role || "",
        currentAcademicYear: data.current_academic_year || data.currentAcademicYear || currentUser?.currentAcademicYear || "",
        currentSemester: data.current_semester || data.currentSemester || currentUser?.currentSemester || "",
        program: currentUser?.program || "",
        profilePhotoUrl: data.profile_photo_url || data.profilePhotoUrl || ""
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = () => {
    document.getElementById("photo-upload-input").click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      
      // Update form state with base64 image immediately
      setProfile(prev => ({ ...prev, profilePhotoUrl: base64Data }));
      
      setSaving(true);
      setError("");
      setMessage("");
      try {
        await updateProfile({
          ...profile,
          profilePhotoUrl: base64Data
        });
        setMessage("Profile photo updated successfully!");
        refreshProfile();
      } catch (err) {
        setError(err.message);
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const currentUser = getCurrentUser();
      const currentPrefix = currentUser?.universityProgramId?.split("::")[0] || "f2";
      
      const FACULTY_MAP = {
        f1: "Faculty of Accounting & Finance",
        f2: "Faculty of Information Systems & Technology",
        f3: "Faculty of Business Administration & Entrepreneurship",
        f4: "Faculty of Leadership & Governance",
        f5: "Faculty of Extra-Mural Studies"
      };
      
      const foundEntry = Object.entries(FACULTY_MAP).find(
        ([_, val]) => val.toLowerCase() === (profile.faculty || "").trim().toLowerCase()
      );
      const prefix = foundEntry ? foundEntry[0] : currentPrefix;

      await updateProfile({
        ...profile,
        universityProgramId: `${prefix}::${profile.program}`
      });
      setMessage("Profile updated successfully!");
      refreshProfile(); // Refresh to get the latest mapped data
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passSaving, setPassSaving] = useState(false);
  const [passError, setPassError] = useState("");
  const [passMessage, setPassMessage] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError("");
    setPassMessage("");
    if (!passForm.newPassword) {
      setPassError("New password is required.");
      return;
    }
    if (passForm.newPassword.length < 6) {
      setPassError("New password must be at least 6 characters long.");
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassError("New password and confirm password do not match.");
      return;
    }

    setPassSaving(true);
    try {
      const res = await changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      setPassMessage(res.message || "Password updated successfully!");
      setSessionUser(prev => ({ ...(prev || {}), hasChangedPassword: true }));
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPassError(err.message || "Failed to update password.");
    } finally {
      setPassSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
      </div>
    );
  }

  const isStudent = profile?.role === 'student' || profile?.role === 'learner';
  const isLecturer = profile?.role === 'lecturer';
  const isPartner = ['university', 'institution', 'partner', 'organization'].includes(profile?.role);

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4">
      
      {/* Profile Header */}
      <div className="bg-[#0B5E3C] -mx-4 sm:-mx-6 lg:-mx-8 px-8 py-20 text-white relative overflow-hidden mb-12 rounded-b-[4rem]">
         <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0B5E3C] to-transparent z-10" />
         <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         
         <div className="relative z-20 flex flex-col md:flex-row items-center gap-10 max-w-7xl mx-auto">
            <div className="relative group">
                <div 
                  onClick={handlePhotoClick}
                  className="w-44 h-44 rounded-full border-4 border-brand-500/30 p-2 bg-white/10 backdrop-blur-md shadow-2xl flex items-center justify-center overflow-hidden cursor-pointer hover:border-brand-500/60 transition-all"
                >
                    <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                        {profile?.profilePhotoUrl ? (
                          <img src={profile.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-24 h-24 text-slate-300" />
                        )}
                    </div>
                </div>
                <button 
                  onClick={handlePhotoClick}
                  className="absolute bottom-4 right-4 bg-brand-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 border-4 border-[#0B5E3C] cursor-pointer animate-pulse"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input 
                  type="file" 
                  id="photo-upload-input" 
                  accept="image/*" 
                  onChange={handlePhotoChange} 
                  className="hidden" 
                />
            </div>

            <div className="text-center md:text-left space-y-4">
               <div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-4 shadow-lg shadow-brand-500/20">
                     Official {profile?.role?.replace('_', ' ')} Profile
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tight">{profile?.fullName || "SET YOUR NAME"}</h1>
               </div>
               <div className="flex flex-wrap justify-center md:justify-start gap-8 opacity-80">
                  <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-brand-300">
                     <UserCheck className="w-5 h-5 text-brand-400" />
                     STUDENT | ID NO: {sessionUser?.studentIdNumber || "—"} | {profile?.program?.toUpperCase() || "—"}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest">
                     <Mail className="w-5 h-5 text-brand-400" />
                     {profile?.email}
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-12">

         <div className="flex items-center justify-end -mb-6">
            <button
               onClick={() => { logoutUser(); navigate("/"); }}
               className="flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
            >
               <LogOut className="w-4 h-4" /> Sign Out
            </button>
         </div>
         <div>

            {/* Status Messages */}
            {error && (
              <div className="flex items-center gap-4 p-6 text-sm font-black text-red-600 bg-red-50 rounded-[2rem] border border-red-100 mb-8">
                <AlertCircle className="w-6 h-6" /> <p className="uppercase tracking-tight">{error}</p>
              </div>
            )}
            {message && (
              <div className="flex items-center gap-4 p-6 text-sm font-black text-brand-600 bg-brand-50 rounded-[2rem] border border-brand-100 mb-8">
                <CheckCircle2 className="w-6 h-6" /> <p className="uppercase tracking-tight">{message}</p>
              </div>
            )}

            {/* Personal Information */}
            <ProfileSection title="PERSONAL INFORMATION">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ProfileInput label="Full Name" name="fullName" value={profile?.fullName} onChange={handleChange} placeholder="EX: MOHAMED VONJO" />
                  <ProfileInput label="Mobile Contact" name="phoneNumber" value={profile?.phoneNumber} onChange={handleChange} placeholder="+232 ..." />
               </div>
               <div className="mt-8">
                  <label className="text-[10px] font-black text-hover-500 uppercase tracking-widest block ml-1 mb-2">Short Bio</label>
                  <textarea 
                    name="bio"
                    value={profile?.bio || ""}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black text-[#0B5E3C] focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder-slate-300 outline-none"
                  />
               </div>
            </ProfileSection>

            {/* Academic Records */}
            {isStudent && (
              <ProfileSection title="Academic Records">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ProfileInput 
                      label="Faculty" 
                      name="faculty" 
                      value={profile?.faculty} 
                      onChange={handleChange} 
                    />
                    <ProfileInput 
                      label="Current course/Program" 
                      name="program" 
                      value={profile?.program} 
                      onChange={handleChange} 
                    />
                    <ProfileInput 
                      label="Academic Year" 
                      name="currentAcademicYear" 
                      value={profile?.currentAcademicYear} 
                      onChange={handleChange} 
                      placeholder="2" 
                    />
                    <ProfileInput 
                      label="Current Semester" 
                      name="currentSemester" 
                      value={profile?.currentSemester} 
                      onChange={handleChange} 
                      placeholder="1" 
                    />
                 </div>
              </ProfileSection>
            )}

            {isLecturer && (
              <ProfileSection title="Faculty & Professional Data">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ProfileInput 
                      label="Active Faculty" 
                      name="faculty" 
                      value={profile?.faculty} 
                      onChange={handleChange} 
                    />
                    <ProfileInput 
                      label="Primary Department" 
                      name="department" 
                      value={profile?.department} 
                      onChange={handleChange} 
                    />
                    <ProfileInput label="Current Designation" name="designation" value={profile?.designation} onChange={handleChange} placeholder="Senior Lecturer" />
                    <ProfileInput label="Institutional Portal ID" name="institutionName" value={profile?.institutionName} onChange={handleChange} placeholder="University of Sierra Leone" />
                 </div>
                 <div className="mt-8">
                    <label className="text-[10px] font-black text-hover-500 uppercase tracking-widest block ml-1 mb-2">Educational Background</label>
                    <textarea 
                      name="educationBackground"
                      value={profile?.educationBackground || ""}
                      onChange={handleChange}
                      rows={3}
                      placeholder="List your previous degrees or qualifications..."
                      className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black text-[#0B5E3C] focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder-slate-300 outline-none"
                    />
                 </div>
              </ProfileSection>
            )}

            {/* Institution/Partner Section */}
            {isPartner && (
              <ProfileSection title="Organizational Profile">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ProfileInput label="Organization Full Name" name="institutionName" value={profile?.institutionName} onChange={handleChange} />
                    <ProfileInput label="Official Website" name="websiteUrl" value={profile?.websiteUrl} onChange={handleChange} placeholder="https://..." />
                    <div className="md:col-span-2">
                       <ProfileInput label="Primary Designation / Function" name="designation" value={profile?.designation} onChange={handleChange} placeholder="University Administration / Corporate Trainer" />
                    </div>
                 </div>
              </ProfileSection>
            )}

            {/* Password & Security Management */}
            <ProfileSection title="SECURITY & PASSWORD MANAGEMENT">
              <form onSubmit={handlePasswordChange} className="space-y-6">
                {sessionUser?.hasChangedPassword ? (
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Password Secured
                        </span>
                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Personal Password Active</p>
                      </div>
                      <p className="text-xs text-emerald-700/90 font-medium mt-1 leading-relaxed">
                        Your student portal account is protected with your personal password. You can update your password anytime below using your current password.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/30 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-200">
                          Default Password Active
                        </span>
                        <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Initial Password Update Required</p>
                      </div>
                      <p className="text-xs text-amber-900/90 font-medium mt-1 leading-relaxed">
                        You are currently using your initial default password (your Student ID). Please choose a new password below to secure your portal account. Once updated, this notice will disappear instantly.
                      </p>
                    </div>
                  </div>
                )}

                {passError && (
                  <div className="flex items-center gap-3 p-4 text-xs font-black text-red-600 bg-red-50 rounded-2xl border border-red-100">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p>{passError}</p>
                  </div>
                )}
                {passMessage && (
                  <div className="flex items-center gap-3 p-4 text-xs font-black text-emerald-700 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <p>{passMessage}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-hover-500 uppercase tracking-widest leading-none block ml-1">
                      {sessionUser?.hasChangedPassword ? "Current Password" : "Current / Default Password"}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={passForm.currentPassword}
                        onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })}
                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#0B5E3C] focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder-slate-300 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-hover-500 uppercase tracking-widest leading-none block ml-1">New Password *</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Min 6 characters"
                        value={passForm.newPassword}
                        onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })}
                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#0B5E3C] focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder-slate-300 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-hover-500 uppercase tracking-widest leading-none block ml-1">Confirm New Password *</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Re-type new password"
                        value={passForm.confirmPassword}
                        onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                        className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#0B5E3C] focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all placeholder-slate-300 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={passSaving}
                    className="px-8 py-3.5 bg-[#0B5E3C] hover:bg-brand-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {passSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    {passSaving ? "Updating Password..." : "Update Password"}
                  </button>
                </div>
              </form>
            </ProfileSection>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-12">
               <div className="hidden md:flex items-center gap-4 text-slate-400">
                  <div className="w-3 h-3 bg-brand-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Profile Integrity: Verified</span>
               </div>
               <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full md:w-auto flex items-center justify-center gap-4 px-16 py-6 bg-brand-600 text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-brand-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
               >
                  {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                  {saving ? "SAVING CHANGES..." : "SYNC PROFILE DATA"}
               </button>
            </div>

         </div>
      </div>
    </div>
  );
}

export default ProfilePage;
