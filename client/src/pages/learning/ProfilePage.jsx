import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { getCurrentUser, hydrateCurrentUser, updateProfile } from "../../services/authService";
import {
  User, Mail, Shield, Phone, Globe, GraduationCap,
  Loader2, AlertCircle, Settings, ChevronRight, BookOpen, 
  MapPin, Calendar, Camera, Save, UserCheck, LayoutDashboard,
  Award, Wallet, LogOut, Building2, CheckCircle2, Target, Sparkles,
  Link as LinkIcon, Briefcase, School
} from "lucide-react";

function ProfileSection({ title, children }) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
      <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-[10px] font-black text-[#0d2d57] uppercase tracking-[0.2em]">{title}</h3>
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
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block ml-1">{label}</label>
      <input 
        name={name}
        type={type} 
        value={value || ""} 
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#0d2d57] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed placeholder-slate-300"
      />
    </div>
  );
}

function SidebarLink({ to, icon, label, active = false }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
        active 
          ? "bg-[#0d2d57] text-white shadow-xl shadow-blue-900/10" 
          : "text-slate-400 hover:text-[#0d2d57] hover:bg-slate-50"
      }`}
    >
      <div className={`${active ? "text-blue-400" : "text-slate-300"}`}>
        {icon}
      </div>
      {label}
    </Link>
  );
}

function ProfilePage() {
  const sessionUser = getCurrentUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!sessionUser) return;
    refreshProfile();
  }, [sessionUser]);

  const refreshProfile = async () => {
    try {
      const data = await hydrateCurrentUser();
      // Map snail_case from DB to camelCase for the form state
      setProfile({
        fullName: data.full_name || "",
        email: data.email || "",
        phoneNumber: data.phone_number || "",
        countryCode: data.country_code || "",
        educationBackground: data.education_background || "",
        skillsInterests: data.skills_interests || [],
        learningGoals: data.learning_goals || "",
        designation: data.designation || "",
        websiteUrl: data.website_url || "",
        bio: data.bio || "",
        institutionName: data.institution_name || "",
        faculty: data.faculty || "",
        department: data.department || "",
        enrollmentYear: data.enrollment_year || "",
        academicStanding: data.academic_standing || "",
        role: data.role || ""
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
      await updateProfile(profile);
      setMessage("Profile updated successfully!");
      refreshProfile(); // Refresh to get the latest mapped data
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!sessionUser) return <Navigate to="/user-login" replace />;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  const isStudent = profile?.role === 'student' || profile?.role === 'learner';
  const isLecturer = profile?.role === 'lecturer';
  const isPartner = ['university', 'institution', 'partner', 'organization'].includes(profile?.role);

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4">
      
      {/* Profile Header */}
      <div className="bg-[#0d2d57] -mx-4 sm:-mx-6 lg:-mx-8 px-8 py-20 text-white relative overflow-hidden mb-12 rounded-b-[4rem]">
         <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0d2d57] to-transparent z-10" />
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         
         <div className="relative z-20 flex flex-col md:flex-row items-center gap-10 max-w-7xl mx-auto">
            <div className="relative group">
                <div className="w-44 h-44 rounded-full border-4 border-blue-500/30 p-2 bg-white/10 backdrop-blur-md shadow-2xl flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="w-24 h-24 text-slate-300" />
                    </div>
                </div>
                <button className="absolute bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 border-4 border-[#0d2d57]">
                  <Camera className="w-5 h-5" />
                </button>
            </div>

            <div className="text-center md:text-left space-y-4">
               <div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-4 shadow-lg shadow-blue-500/20">
                     Official {profile?.role?.replace('_', ' ')} Profile
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tight">{profile?.fullName || "SET YOUR NAME"}</h1>
               </div>
               <div className="flex flex-wrap justify-center md:justify-start gap-8 opacity-80">
                  <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest">
                     <UserCheck className="w-5 h-5 text-blue-400" />
                     {profile?.role?.toUpperCase()} | {sessionUser.id?.substring(0, 8).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest">
                     <Mail className="w-5 h-5 text-blue-400" />
                     {profile?.email}
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
         
         {/* Sidebar */}
         <div className="lg:col-span-1 space-y-3">
            <SidebarLink to="/profile" icon={<User className="w-4 h-4" />} label="Personal Identity" active={true} />
            <SidebarLink to="/user-dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="My Learning Hub" />
            <SidebarLink to="/course-catalog" icon={<BookOpen className="w-4 h-4" />} label="Browse Courses" />
            <SidebarLink to="/certificates" icon={<Award className="w-4 h-4" />} label="Certifications" />
            
            <div className="pt-10 mt-10 border-t border-slate-100 space-y-3">
               <SidebarLink to="/settings" icon={<Settings className="w-4 h-4" />} label="Account Settings" />
               <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all">
                  <LogOut className="w-4 h-4" /> Sign Out
               </button>
            </div>
         </div>

         {/* Content */}
         <div className="lg:col-span-3">
            
            {/* Status Messages */}
            {error && (
              <div className="flex items-center gap-4 p-6 text-sm font-black text-red-600 bg-red-50 rounded-[2rem] border border-red-100 mb-8">
                <AlertCircle className="w-6 h-6" /> <p className="uppercase tracking-tight">{error}</p>
              </div>
            )}
            {message && (
              <div className="flex items-center gap-4 p-6 text-sm font-black text-emerald-600 bg-emerald-50 rounded-[2rem] border border-emerald-100 mb-8">
                <CheckCircle2 className="w-6 h-6" /> <p className="uppercase tracking-tight">{message}</p>
              </div>
            )}

            {/* Personal Information */}
            <ProfileSection title="Core Personal Information">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ProfileInput label="Full Identity Name" name="fullName" value={profile?.fullName} onChange={handleChange} placeholder="EX: JOHN DOE" />
                  <ProfileInput label="Mobile Contact" name="phoneNumber" value={profile?.phoneNumber} onChange={handleChange} placeholder="+232 ..." />
                  <ProfileInput label="Country / Region" name="countryCode" value={profile?.countryCode} onChange={handleChange} placeholder="Sierra Leone" />
                  <ProfileInput label="Preferred Language" name="preferredLanguage" value={profile?.preferredLanguage} onChange={handleChange} placeholder="English" />
               </div>
               <div className="mt-8">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-2">Short Professional Bio</label>
                  <textarea 
                    name="bio"
                    value={profile?.bio || ""}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black text-[#0d2d57] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder-slate-300 outline-none"
                  />
               </div>
            </ProfileSection>

            {/* Role-Based Academic Section */}
            {(isStudent || isLecturer) && (
              <ProfileSection title={isStudent ? "Academic Track & Goals" : "Faculty & Professional Data"}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ProfileInput 
                      label={isStudent ? "Primary Faculty / College" : "Active Faculty"} 
                      name="faculty" 
                      value={profile?.faculty} 
                      onChange={handleChange} 
                    />
                    <ProfileInput 
                      label={isStudent ? "Current Department" : "Primary Department"} 
                      name="department" 
                      value={profile?.department} 
                      onChange={handleChange} 
                    />
                    {isStudent && (
                      <>
                        <ProfileInput label="Admission Year" name="enrollmentYear" value={profile?.enrollmentYear} onChange={handleChange} placeholder="2026" />
                        <ProfileInput label="Academic Standing" name="academicStanding" value={profile?.academicStanding} onChange={handleChange} placeholder="Good Standing" />
                      </>
                    )}
                    {isLecturer && (
                      <>
                        <ProfileInput label="Current Designation" name="designation" value={profile?.designation} onChange={handleChange} placeholder="Senior Lecturer" />
                        <ProfileInput label="Institutional Portal ID" name="institutionName" value={profile?.institutionName} onChange={handleChange} placeholder="University of Sierra Leone" />
                      </>
                    )}
                 </div>
                 <div className="mt-8">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-2">Educational Background</label>
                    <textarea 
                      name="educationBackground"
                      value={profile?.educationBackground || ""}
                      onChange={handleChange}
                      rows={3}
                      placeholder="List your previous degrees or qualifications..."
                      className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black text-[#0d2d57] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder-slate-300 outline-none"
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

            {/* Skills and Learning Goals */}
            <ProfileSection title="Targeted Skills & Learning Roadmap">
               <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      <label className="text-[10px] font-black text-[#0d2d57] uppercase tracking-widest">Key Industry Skills & Interests</label>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {profile?.skillsInterests?.map((skill, idx) => (
                        <div key={idx} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2 group">
                          {skill}
                          <button 
                            onClick={() => setProfile(p => ({ ...p, skillsInterests: p.skillsInterests.filter((_, i) => i !== idx) }))}
                            className="hover:text-red-500 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <input 
                        className="px-4 py-2 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-400 min-w-[120px]"
                        placeholder="+ ADD SKILL"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = e.target.value.trim();
                            if (val && !profile.skillsInterests.includes(val)) {
                              setProfile(p => ({ ...p, skillsInterests: [...p.skillsInterests, val] }));
                              e.target.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-blue-600" />
                      <label className="text-[10px] font-black text-[#0d2d57] uppercase tracking-widest">Main Learning Goals & Objectives</label>
                    </div>
                    <textarea 
                      name="learningGoals"
                      value={profile?.learningGoals || ""}
                      onChange={handleChange}
                      rows={3}
                      placeholder="What do you hope to achieve on UniPam?"
                      className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-black text-[#0d2d57] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder-slate-300 outline-none"
                    />
                  </div>
               </div>
            </ProfileSection>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-12">
               <div className="hidden md:flex items-center gap-4 text-slate-400">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Profile Integrity: Verified</span>
               </div>
               <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full md:w-auto flex items-center justify-center gap-4 px-16 py-6 bg-blue-600 text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
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
