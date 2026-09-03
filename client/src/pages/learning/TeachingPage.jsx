import { useEffect, useState, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import { getCurrentUser, hydrateCurrentUser } from "../../services/authService";
import {
  createCourse, getMyCourses, getCourseMaterials,
  uploadCourseMaterial, getCourseModules, createCourseModule,
  getMessages, sendMessage, markMessageRead
} from "../../services/platformService";
import {
  BookOpen, Plus, Loader2, AlertCircle, FileCheck, X,
  Upload, FileText, Video, File, Image, Table2, Link2,
  Download, Eye, GraduationCap, CloudUpload, CheckCircle2,
  FolderOpen, Hash, Calendar, Building2, ChevronDown, Layers,
  BarChart3, Bookmark, MessageCircle, Send, Bell, User, Camera,
  Edit3, Clock, CheckCheck, RefreshCw, Sparkles, HelpCircle, FileQuestion, ChevronRight
} from "lucide-react";
import DashboardStat from "../../components/DashboardStat";

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_OPTIONS = [
  { value: "lecture_notes",    label: "Lecture Notes & Handouts",     color: "#0B5E3C" },
  { value: "pdf_document",     label: "PDF Document",                 color: "#3B82F6" },
  { value: "word_document",    label: "Microsoft Word Document",      color: "#2563EB" },
  { value: "presentation",     label: "PowerPoint Presentation",      color: "#F97316" },
  { value: "spreadsheet",      label: "Excel / Spreadsheet",          color: "#10B981" },
  { value: "image",            label: "Image / Diagram",              color: "#EC4899" },
  { value: "recorded_lecture", label: "Recorded Lecture / Video",     color: "#6366F1" },
  { value: "assignment",       label: "Assignment / Course Resource", color: "#F59E0B" },
  { value: "past_exam",        label: "Past Examination Paper",       color: "#8B5CF6" },
  { value: "reading_material", label: "Reading Material / Reference", color: "#0EA5E9" },
];

const SEMESTER_OPTIONS = ["First Semester", "Second Semester", "Summer Semester"];

const IPAM_FACULTIES = [
  "Faculty of Accounting & Finance",
  "Faculty of Information Systems & Technology",
  "Faculty of Business Administration & Entrepreneurship",
  "Faculty of Leadership & Governance",
  "Extra-Mural Studies / Continuing Education"
];

const TYPE_CONFIG = {
  pdf:          { Icon: FileText, color: "#EF4444", bg: "#FEF2F2" },
  video:        { Icon: Video,    color: "#6366F1", bg: "#EEF2FF" },
  doc:          { Icon: FileText, color: "#3B82F6", bg: "#EFF6FF" },
  presentation: { Icon: File,     color: "#F97316", bg: "#FFF7ED" },
  spreadsheet:  { Icon: Table2,   color: "#10B981", bg: "#F0FDF4" },
  image:        { Icon: Image,    color: "#EC4899", bg: "#FDF2F8" },
  link:         { Icon: Link2,    color: "#0EA5E9", bg: "#F0F9FF" },
};

function formatBytes(b) {
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function StatPill({ value, label, color }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-3 rounded-xl" style={{ backgroundColor: color + "12" }}>
      <p className="text-lg font-black" style={{ color }}>{value}</p>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5 text-center leading-tight">{label}</p>
    </div>
  );
}

// ─── Upload Learning Materials Form ──────────────────────────────────────────
function UploadMaterialsForm({ courses, onSuccess, onCancel }) {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [modules, setModules]           = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [dragOver, setDragOver]         = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");
  const fileRef = useRef();

  const [form, setForm] = useState({
    title: "", description: "", materialCategory: "lecture_notes",
    moduleId: "", lectureNoteNumber: "", weekLabel: "",
    semester: "", academicYear: "", isPublished: true,
    file: null, externalUrl: ""
  });

  // Load modules when course changes
  useEffect(() => {
    if (!selectedCourseId) { setModules([]); return; }
    setLoadingModules(true);
    getCourseModules(selectedCourseId)
      .then(setModules)
      .catch(() => setModules([]))
      .finally(() => setLoadingModules(false));
  }, [selectedCourseId]);

  const handleAddModule = async () => {
    if (!newModuleTitle.trim() || !selectedCourseId) return;
    setAddingModule(true);
    try {
      const mod = await createCourseModule(selectedCourseId, { title: newModuleTitle.trim() });
      setModules(prev => [...prev, mod]);
      setForm(f => ({ ...f, moduleId: mod.id }));
      setNewModuleTitle("");
    } catch (_) {}
    finally { setAddingModule(false); }
  };

  const handleFile = (file) => {
    if (file) setForm(f => ({ ...f, file, externalUrl: "" }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) { setError("Please select a course."); return; }
    if (!form.title.trim()) { setError("Please enter a title for this material."); return; }
    if (!form.file && !form.externalUrl) { setError("Please attach a file or provide an external URL."); return; }

    setUploading(true);
    setError("");
    setSuccess("");
    try {
      await uploadCourseMaterial(selectedCourseId, form);
      setSuccess("Learning material uploaded successfully!");
      setForm(f => ({ ...f, title: "", description: "", lectureNoteNumber: "", weekLabel: "", file: null, externalUrl: "" }));
      if (fileRef.current) fileRef.current.value = "";
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const inp = "block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none";
  const lbl = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5";

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Form header */}
      <div className="bg-gradient-to-r from-[#0B5E3C] to-emerald-700 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center">
            <CloudUpload className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-black text-xl">Upload Learning Materials</h2>
            <p className="text-emerald-100 text-xs font-bold mt-0.5">
              Upload lecture notes, documents, presentations, videos, past exams &amp; course resources
            </p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-all">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-7">

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm font-bold text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            <button type="button" onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-sm font-bold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />{success}
          </div>
        )}

        {/* ── Section 1: Course & Module ── */}
        <div>
          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" /> Step 1 — Select Course &amp; Module
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Course *</label>
              <div className="relative">
                <select
                  value={selectedCourseId}
                  onChange={e => { setSelectedCourseId(e.target.value); setForm(f => ({ ...f, moduleId: "" })); }}
                  className={`${inp} appearance-none pr-10`}
                >
                  <option value="">— Select a course —</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={lbl}>Module / Topic</label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <select
                    value={form.moduleId}
                    onChange={e => setForm(f => ({ ...f, moduleId: e.target.value }))}
                    disabled={!selectedCourseId || loadingModules}
                    className={`${inp} appearance-none pr-10 disabled:opacity-50`}
                  >
                    <option value="">— General (no specific module) —</option>
                    {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 2: Material Details ── */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" /> Step 2 — Material Metadata
          </p>
          <div className="space-y-4">
            <div>
              <label className={lbl}>Material Title *</label>
              <input
                type="text"
                placeholder="e.g. Week 3 — Relational Database Normalization Notes"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className={inp}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Category *</label>
                <div className="relative">
                  <select
                    value={form.materialCategory}
                    onChange={e => setForm(f => ({ ...f, materialCategory: e.target.value }))}
                    className={`${inp} appearance-none pr-10`}
                  >
                    {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={lbl}>Lecture / Note No.</label>
                <input
                  type="text"
                  placeholder="e.g. 03 or Unit 2"
                  value={form.lectureNoteNumber}
                  onChange={e => setForm(f => ({ ...f, lectureNoteNumber: e.target.value }))}
                  className={inp}
                />
              </div>

              <div>
                <label className={lbl}>Academic Term / Year</label>
                <input
                  type="text"
                  placeholder="e.g. 2025/2026 Sem 1"
                  value={form.academicYear}
                  onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))}
                  className={inp}
                />
              </div>
            </div>

            <div>
              <label className={lbl}>Description / Instructions for Students</label>
              <textarea
                rows={2}
                placeholder="Provide context, required reading instructions, or key objectives..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className={inp}
              />
            </div>
          </div>
        </div>

        {/* ── Section 3: File Attachment ── */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Upload className="w-3.5 h-3.5" /> Step 3 — Attach File or Link
          </p>

          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? "border-emerald-500 bg-emerald-50/50"
                : form.file
                ? "border-emerald-400 bg-emerald-50/20"
                : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50/50"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              onChange={e => handleFile(e.target.files[0])}
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.mp4,.mov,.zip"
            />
            {form.file ? (
              <div className="flex items-center justify-center gap-3">
                <FileCheck className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-black text-slate-800">{form.file.name}</p>
                  <p className="text-xs text-slate-400 font-bold">{formatBytes(form.file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, file: null })); }}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 ml-4"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <CloudUpload className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                <p className="text-sm font-black text-slate-700">Drag &amp; drop your learning material here</p>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  PDF, Word, PowerPoint, Excel, Images, Videos up to 100MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3.5 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="flex items-center gap-2 px-8 py-3.5 bg-[#0B5E3C] hover:bg-emerald-800 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all disabled:opacity-60"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
            {uploading ? "Uploading..." : "Publish Material"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Course Card Component ───────────────────────────────────────────────────
function CourseCard({ course }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getCourseMaterials(course.id)
      .then(mats => {
        const published = mats.filter(m => m.is_published).length;
        const total = mats.length;
        const downloads = mats.reduce((acc, m) => acc + (m.download_count || 0), 0);
        setStats({ total, published, downloads });
      })
      .catch(() => setStats({ total: 0, published: 0, downloads: 0 }));
  }, [course.id]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      <div className="p-7">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 bg-emerald-50 text-[#0B5E3C] rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="flex-grow min-w-0">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{course.category || "Academic"}</span>
            <h3 className="text-base font-black text-[#0B5E3C] leading-tight line-clamp-2">{course.title}</h3>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {stats === null ? (
            <div className="col-span-3 flex justify-center py-2">
              <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />
            </div>
          ) : (
            <>
              <StatPill value={stats.total}     label="Materials" color="#0B5E3C" />
              <StatPill value={stats.published} label="Published" color="#10B981" />
              <StatPill value={stats.downloads} label="Downloads" color="#D4A017" />
            </>
          )}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
          <Link to={`/app/teach/${course.id}/materials`}
            className="flex items-center justify-center gap-1.5 px-3 py-3 bg-[#0B5E3C] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-emerald-800 transition-all">
            <FolderOpen className="w-3.5 h-3.5" /> Manage Files
          </Link>
          <Link to={`/app/teach/${course.id}/assessments`}
            className="flex items-center justify-center gap-1.5 px-3 py-3 bg-slate-50 hover:bg-emerald-50 hover:text-[#0B5E3C] text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-200 transition-all">
            <FileCheck className="w-3.5 h-3.5" /> Assessments
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Edit Modal ──────────────────────────────────────────────────────
function LecturerProfileEditModal({ profile, onSave, onClose }) {
  const [form, setForm] = useState({ ...profile });
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl || "");
  const fileInputRef = useRef(null);

  const handleAvatarFile = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
        setForm(prev => ({ ...prev, avatarUrl: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const inp = "block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none";
  const lbl = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="bg-[#0B5E3C] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Edit3 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-black text-lg">Edit Lecturer Profile</h3>
              <p className="text-xs text-emerald-200">Update your academic identity, faculty, and lecturing details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Avatar Edit */}
          <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full border-4 border-emerald-600 overflow-hidden bg-slate-100 flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-slate-300" />
                )}
              </div>
              <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={e => handleAvatarFile(e.target.files[0])}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">Lecturer Profile Picture</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Click on avatar to upload photo from your computer (JPG, PNG, WebP)</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-xs font-black text-[#0B5E3C] hover:underline uppercase tracking-wider"
              >
                Choose Photo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Full Name &amp; Academic Title *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Dr. Ernest Udeh, Ph.D."
                className={inp}
                required
              />
            </div>
            <div>
              <label className={lbl}>Department</label>
              <input
                type="text"
                value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                placeholder="e.g. Department of Information Systems"
                className={inp}
              />
            </div>
          </div>

          <div>
            <label className={lbl}>Assigned Faculty *</label>
            <div className="relative">
              <select
                value={form.faculty}
                onChange={e => setForm(f => ({ ...f, faculty: e.target.value }))}
                className={`${inp} appearance-none pr-10`}
                required
              >
                {IPAM_FACULTIES.map(fac => <option key={fac} value={fac}>{fac}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className={lbl}>Modules Lecturing (comma separated)</label>
            <input
              type="text"
              value={form.modulesText}
              onChange={e => setForm(f => ({ ...f, modulesText: e.target.value }))}
              placeholder="e.g. Advanced Database Systems, Network Security, Cloud Architecture"
              className={inp}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Academic Year *</label>
              <input
                type="text"
                value={form.academicYear}
                onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))}
                placeholder="e.g. 2025/2026 Academic Year"
                className={inp}
              />
            </div>
            <div>
              <label className={lbl}>Years Teaching / Experience</label>
              <input
                type="text"
                value={form.yearsExperience}
                onChange={e => setForm(f => ({ ...f, yearsExperience: e.target.value }))}
                placeholder="e.g. 6 Years Experience"
                className={inp}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-[#0B5E3C] hover:bg-emerald-800 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition-all"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Teaching Page Component ───────────────────────────────────────────
function TeachingPage() {
  const user = getCurrentUser();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [totalMaterialsCount, setTotalMaterialsCount] = useState(0);

  // Messages & Notifications Hub State
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [msgTab, setMsgTab] = useState("inbox"); // 'inbox' | 'compose' | 'sent'
  const [msgSending, setMsgSending] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState("");
  const [msgError, setMsgError] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const [composeForm, setComposeForm] = useState({
    to_user_id: "all_students",
    to_name: "All Enrolled Students",
    course_id: "",
    course_title: "",
    subject: "",
    message: "",
    category: "announcement"
  });

  // Lecturer Profile State
  const [profile, setProfile] = useState({
    name: user?.name || "Dr. Ernest Udeh, Ph.D.",
    title: "Senior Lecturer",
    department: "Department of Information Systems",
    faculty: "Faculty of Information Systems & Technology",
    modulesText: "",
    academicYear: "",
    yearsExperience: "",
    avatarUrl: user?.profilePhotoUrl || ""
  });

  if (user?.role !== "lecturer" && user?.role !== "admin") {
    return <Navigate to="/app/dashboard" replace />;
  }

  const loadProfile = async () => {
    try {
      const data = await hydrateCurrentUser();
      setProfile({
        name: data.full_name || data.fullName || user?.name || "",
        title: data.designation || "Senior Lecturer",
        department: data.department || "Information Systems",
        faculty: data.faculty || "Faculty of Information Systems & Technology",
        modulesText: data.skills_interests ? data.skills_interests.join(", ") : "",
        academicYear: data.current_academic_year || "",
        yearsExperience: data.enrollment_year ? (new Date().getFullYear() - parseInt(data.enrollment_year)) + " Years" : "",
        avatarUrl: data.profile_photo_url || data.profilePhotoUrl || user?.profilePhotoUrl || ""
      });
    } catch (_) {}
  };

  const loadCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const myCourses = await getMyCourses();
      setCourses(myCourses);

      // Compute total materials across courses
      let totalCount = 0;
      await Promise.all(
        myCourses.map(async c => {
          try {
            const mats = await getCourseMaterials(c.id);
            totalCount += (mats || []).length;
          } catch (_) {}
        })
      );
      setTotalMaterialsCount(totalCount);
    } catch (err) {
      setError(err.message || "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    setLoadingMessages(true);
    try {
      const data = await getMessages();
      setMessages(data || []);
    } catch (_) {
      // Fallback
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadCourses();
    loadMessages();
  }, []);

  const handleSaveProfile = async (updatedProfile) => {
    setProfile(updatedProfile);
    // In a full implementation, we'd call updateProfile from authService here.
    // For now we just update local state to reflect UI changes instantly.
    setShowEditProfile(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!composeForm.subject.trim() || !composeForm.message.trim()) {
      setMsgError("Subject and message are required.");
      return;
    }
    setMsgSending(true);
    setMsgError("");
    setMsgSuccess("");
    try {
      const selectedCourse = courses.find(c => c.id === composeForm.course_id);
      const payload = {
        ...composeForm,
        course_title: selectedCourse ? selectedCourse.title : "General Academic Notice",
        to_name: composeForm.to_user_id === "all_students" ? "All Enrolled Students" : (replyTo?.from_name || "Student")
      };
      await sendMessage(payload);
      setMsgSuccess("Message notification dispatched directly to student notification bells!");
      setComposeForm({
        to_user_id: "all_students",
        to_name: "All Enrolled Students",
        course_id: "",
        course_title: "",
        subject: "",
        message: "",
        category: "announcement"
      });
      setReplyTo(null);
      loadMessages();
      setTimeout(() => setMsgTab("inbox"), 1500);
    } catch (err) {
      setMsgError(err.message || "Failed to send message.");
    } finally {
      setMsgSending(false);
    }
  };

  const handleReply = (msg) => {
    setReplyTo(msg);
    setComposeForm({
      to_user_id: msg.from_user_id,
      to_name: msg.from_name,
      course_id: msg.course_id || "",
      course_title: msg.course_title || "",
      subject: msg.subject.startsWith("Re: ") ? msg.subject : `Re: ${msg.subject}`,
      message: `\n\n--- On ${new Date(msg.created_at).toLocaleDateString()}, ${msg.from_name} wrote:\n${msg.message}`,
      category: "feedback"
    });
    setMsgTab("compose");
  };

  const handleMarkRead = async (msgId) => {
    try {
      await markMessageRead(msgId);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, read_at: new Date().toISOString() } : m));
    } catch (_) {}
  };

  // Modules array from comma-separated string
  const modulesList = profile.modulesText
    ? profile.modulesText.split(",").map(m => m.trim()).filter(Boolean)
    : ["Advanced Database Systems", "Information Systems Security"];

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto">

      {/* ════════════════════════════════════════════════════════════════════════
          SECTION 1: LECTURER PROFILE & IDENTITY CARD (EDITABLE)
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 lg:p-10 relative overflow-hidden group">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Profile Picture with Edit Badge */}
          <div className="lg:col-span-3 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer" onClick={() => setShowEditProfile(true)}>
              <div className="w-36 h-36 rounded-full border-4 border-[#0B5E3C] p-1.5 bg-slate-50 shadow-lg overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full rounded-full bg-emerald-50 flex items-center justify-center text-[#0B5E3C]">
                    <User className="w-16 h-16 text-emerald-700" />
                  </div>
                )}
              </div>
              <button
                title="Update Profile Picture"
                className="absolute bottom-1 right-1 bg-[#0B5E3C] hover:bg-emerald-800 text-white p-2.5 rounded-full shadow-lg border-2 border-white transition-transform hover:scale-110"
              >
                <Camera className="w-4 h-4 text-amber-400" />
              </button>
            </div>
            <span className="mt-3 px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest rounded-full">
              Verified Lecturer
            </span>
          </div>

          {/* Lecturer Info Details */}
          <div className="lg:col-span-6 space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-widest">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" /> {profile.faculty}
            </div>

            <h1 className="text-3xl sm:text-4xl font-[900] text-[#0B5E3C] uppercase tracking-tight leading-tight">
              {profile.name}
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              {profile.department || "Academic Faculty Member"} · {profile.academicYear}
            </p>

            {/* Modules Lecturing Tag Cloud */}
            <div className="pt-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Modules Lecturing:</p>
              <div className="flex flex-wrap gap-1.5 justify-center lg:justify-start">
                {modulesList.map((mod, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#0B5E3C] border border-slate-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    {mod}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats & Edit Action */}
          <div className="lg:col-span-3 flex flex-col gap-4 bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80 text-center">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Materials Uploaded</p>
              <p className="text-3xl font-[900] text-[#0B5E3C] mt-1">{totalMaterialsCount} Files</p>
            </div>
            <div className="h-px bg-slate-200" />
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teaching Experience</p>
              <p className="text-sm font-black text-slate-700 mt-0.5">{profile.yearsExperience}</p>
            </div>

          </div>

        </div>
      </section>

      {/* Profile Edit Modal */}
      {showEditProfile && (
        <LecturerProfileEditModal
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          SECTION 2: MANAGE LEARNING MATERIALS
      ════════════════════════════════════════════════════════════════════════ */}
      <section id="materials-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-widest mb-2">
              <FolderOpen className="w-3.5 h-3.5 text-emerald-700" /> Course Resources Repository
            </div>
            <h2 className="text-3xl font-[900] text-[#0B5E3C] uppercase tracking-tight leading-tight">
              MANAGE LEARNING MATERIALS
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-xl font-medium leading-relaxed">
              Upload, organise, publish, and distribute lecture notes, slides, past examination papers, and course resources to enrolled students.
            </p>
          </div>

          <button
            onClick={() => setShowUpload(v => !v)}
            className="flex items-center justify-center gap-2.5 px-8 py-4 bg-[#0B5E3C] hover:bg-emerald-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#0B5E3C]/20 transition-all flex-shrink-0"
          >
            <CloudUpload className="w-4 h-4 text-amber-400" />
            {showUpload ? "Close Upload Form" : "Upload Learning Materials"}
          </button>
        </div>

        {/* Upload Form Component */}
        {showUpload && (
          <UploadMaterialsForm
            courses={courses}
            onSuccess={() => { loadCourses(); setShowUpload(false); }}
            onCancel={() => setShowUpload(false)}
          />
        )}

        {/* Overview Stats Strip */}
        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Assigned Courses", value: courses.length, icon: BookOpen, color: "#0B5E3C" },
              { label: "Total Uploaded Files", value: totalMaterialsCount, icon: FolderOpen, color: "#0072C6" },
              { label: "File Categories", value: "10 Types", icon: Layers, color: "#85754E" },
              { label: "Max File Size", value: "100 MB", icon: Upload, color: "#D4A017" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center gap-4 shadow-sm hover:border-emerald-300 transition-colors">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "15" }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-800">{value}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Course Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-slate-800 text-base uppercase tracking-tight">Your Course Materials Hub</h3>
            {!loading && (
              <p className="text-xs text-slate-400 font-medium">
                Click <strong>Manage Files</strong> on any module to view or add documents
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24 bg-white rounded-3xl border border-slate-200">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8">
              <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="font-black text-slate-600 uppercase tracking-widest text-sm">No Courses Assigned Yet</p>
              <p className="text-slate-400 text-xs mt-2 max-w-xs mx-auto font-medium">
                Contact your Faculty Dean or Administrator to assign active semester modules.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          SECTION 3: COURSE ASSESSMENTS & GRADING QUICK ACCESS
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-800 rounded-xl flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Assessments &amp; Quiz Moderation</h3>
              <p className="text-xs text-slate-500 font-medium">Create quizzes, mid-term tests, and grade student submissions</p>
            </div>
          </div>
          <div className="flex gap-2">
            {courses.slice(0, 3).map(c => (
              <Link
                key={c.id}
                to={`/app/teach/${c.id}/assessments`}
                className="px-3.5 py-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#0B5E3C] text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors"
              >
                {c.title.substring(0, 18)}... Tests →
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════════════════
          SECTION 5 (LAST): ACADEMIC RESOURCES & LECTURER GUIDELINES
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#0B5E3C] rounded-[2.5rem] p-10 lg:p-12 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-4">
            <GraduationCap className="w-3.5 h-3.5" /> University of Sierra Leone eLearning Standards
          </div>
          <h2 className="text-2xl sm:text-3xl font-[900] uppercase tracking-tight mb-3">
            Academic Delivery Guidelines
          </h2>
          <p className="text-brand-100 text-xs sm:text-sm font-medium leading-relaxed mb-6">
            Ensure all uploaded course syllabus materials comply with the Tertiary Education Commission (TEC) accreditation benchmarks. Lecture notes and continuous assessments must be published at least 48 hours prior to scheduled class sessions.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/app/repository"
              className="px-6 py-3 bg-white text-[#0B5E3C] rounded-xl text-xs font-black uppercase tracking-widest shadow-md hover:bg-slate-50 transition-all"
            >
              Browse Central Repository
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 border border-white/30 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Contact Academic Secretariat
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default TeachingPage;
