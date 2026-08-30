import { useEffect, useState, useRef } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getCurrentUser } from "../../services/authService";
import {
  getCourseMaterials, uploadCourseMaterial, deleteCourseMaterial, updateCourseMaterial,
  getCourseModules, createCourseModule, deleteCourseModule
} from "../../services/platformService";
import {
  ArrowLeft, FileText, Video, Link2, File, Trash2, Upload,
  Loader2, AlertCircle, Plus, FolderOpen, FolderPlus, Eye, EyeOff,
  Image, Table2, Presentation, BookOpen, Download, ChevronDown,
  ChevronRight, Pencil, Check, X, CloudUpload, Layers, BarChart3
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORY_OPTIONS = [
  { value: "lecture_notes",    label: "Lecture Notes",         color: "#3B82F6" },
  { value: "assignment",       label: "Assignment",            color: "#F59E0B" },
  { value: "past_exam",        label: "Past Exam Paper",       color: "#EF4444" },
  { value: "reading_material", label: "Reading Material",      color: "#10B981" },
  { value: "reference",        label: "Reference Document",    color: "#8B5CF6" },
  { value: "presentation",     label: "Presentation",          color: "#F97316" },
  { value: "spreadsheet",      label: "Spreadsheet / Data",    color: "#06B6D4" },
  { value: "image",            label: "Image / Diagram",       color: "#EC4899" },
  { value: "recorded_lecture", label: "Recorded Lecture",      color: "#6366F1" },
  { value: "other",            label: "Other",                 color: "#94A3B8" },
];

const SEMESTER_OPTIONS = [
  "First Semester", "Second Semester", "Summer Semester"
];

const TYPE_CONFIG = {
  pdf:          { Icon: FileText,     color: "#EF4444", bg: "#FEF2F2", label: "PDF" },
  video:        { Icon: Video,        color: "#6366F1", bg: "#EEF2FF", label: "Video" },
  doc:          { Icon: FileText,     color: "#3B82F6", bg: "#EFF6FF", label: "Document" },
  presentation: { Icon: File,         color: "#F97316", bg: "#FFF7ED", label: "Presentation" },
  spreadsheet:  { Icon: Table2,       color: "#10B981", bg: "#F0FDF4", label: "Spreadsheet" },
  image:        { Icon: Image,        color: "#EC4899", bg: "#FDF2F8", label: "Image" },
  link:         { Icon: Link2,        color: "#0EA5E9", bg: "#F0F9FF", label: "Link" },
};

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getCategoryMeta(value) {
  return CATEGORY_OPTIONS.find(c => c.value === value) || CATEGORY_OPTIONS[CATEGORY_OPTIONS.length - 1];
}

// ─── Material Card ────────────────────────────────────────────────────────────
function MaterialCard({ material, courseId, onDelete, onTogglePublish }) {
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const typeCfg = TYPE_CONFIG[material.material_type] || TYPE_CONFIG.doc;
  const { Icon, color, bg } = typeCfg;
  const catMeta = getCategoryMeta(material.material_category);

  const handleDelete = async () => {
    if (!confirm(`Delete "${material.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    await onDelete(material.id);
    setDeleting(false);
  };

  const handleToggle = async () => {
    setToggling(true);
    await onTogglePublish(material.id, !material.is_published);
    setToggling(false);
  };

  return (
    <div className={`group bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4 transition-all hover:shadow-md ${!material.is_published ? "opacity-60 border-slate-200" : "border-slate-100"}`}>
      {/* Type icon */}
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>

      {/* Info */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {!material.is_published && (
            <span className="text-[9px] font-black uppercase tracking-widest text-white bg-slate-400 px-2 py-0.5 rounded-full">Draft</span>
          )}
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: catMeta.color }}>
            {catMeta.label}
          </span>
          {material.lecture_note_number && (
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {material.lecture_note_number}
            </span>
          )}
          {material.week_label && (
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{material.week_label}</span>
          )}
        </div>
        <p className="font-bold text-slate-800 truncate text-sm">{material.title}</p>
        <div className="flex items-center gap-3 mt-1">
          {material.semester && <span className="text-[10px] text-slate-400">{material.semester}</span>}
          {material.academic_year && <span className="text-[10px] text-slate-400">{material.academic_year}</span>}
          {material.file_size_bytes && <span className="text-[10px] text-slate-400">{formatBytes(material.file_size_bytes)}</span>}
          {material.download_count > 0 && (
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Download className="w-3 h-3" />{material.download_count}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={material.file_url}
          target="_blank"
          rel="noreferrer"
          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
          title="View file"
        >
          <Eye className="w-4 h-4" />
        </a>
        <button
          onClick={handleToggle}
          disabled={toggling}
          className="p-2 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-xl transition-all"
          title={material.is_published ? "Unpublish (hide from students)" : "Publish (visible to students)"}
        >
          {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : material.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          title="Delete"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── Upload Form ──────────────────────────────────────────────────────────────
function UploadForm({ courseId, modules, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    title: "", description: "", weekLabel: "", externalUrl: "",
    moduleId: "", materialCategory: "lecture_notes",
    semester: "", academicYear: "", lectureNoteNumber: "",
    isPublished: true, file: null
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

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
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.file && !form.externalUrl) { setError("Attach a file or provide a URL."); return; }
    setUploading(true);
    setError("");
    try {
      await uploadCourseMaterial(courseId, form);
      onSuccess();
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const inputCls = "block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none";
  const labelCls = "block text-[10px] font-black text-hover-500 uppercase tracking-widest mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-lg p-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
          <CloudUpload className="w-5 h-5 text-emerald-600" />
        </div>
        <h3 className="font-black text-slate-800 text-lg">Upload New Material</h3>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm font-bold text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className={labelCls}>Title *</label>
          <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Week 3 — Introduction to SQL" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Material Category</label>
          <select value={form.materialCategory} onChange={e => setForm(f => ({ ...f, materialCategory: e.target.value }))} className={inputCls}>
            {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Module / Topic</label>
          <select value={form.moduleId} onChange={e => setForm(f => ({ ...f, moduleId: e.target.value }))} className={inputCls}>
            <option value="">— No Module —</option>
            {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Semester</label>
          <select value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} className={inputCls}>
            <option value="">— Select Semester —</option>
            {SEMESTER_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Academic Year</label>
          <input value={form.academicYear} onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))}
            placeholder="e.g. 2024/2025" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Week / Label</label>
          <input value={form.weekLabel} onChange={e => setForm(f => ({ ...f, weekLabel: e.target.value }))}
            placeholder="e.g. Week 1" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Lecture Note Number</label>
          <input value={form.lectureNoteNumber} onChange={e => setForm(f => ({ ...f, lectureNoteNumber: e.target.value }))}
            placeholder="e.g. Lecture 3, Note 1.2" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Visibility</label>
          <select value={form.isPublished ? "true" : "false"} onChange={e => setForm(f => ({ ...f, isPublished: e.target.value === "true" }))} className={inputCls}>
            <option value="true">Published — visible to students</option>
            <option value="false">Draft — hidden from students</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className={labelCls}>Description (optional)</label>
          <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Brief description of this material..." className={`${inputCls} resize-none`} />
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${dragOver ? "border-emerald-500 bg-emerald-50" : form.file ? "border-emerald-400 bg-emerald-50/50" : "border-slate-200 bg-slate-50 hover:border-hover-400 hover:bg-hover-50/30"}`}
      >
        <input ref={fileRef} type="file" className="hidden"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.svg,.webp,.mp4,.webm,.txt"
          onChange={e => handleFile(e.target.files[0])} />
        <Upload className={`w-8 h-8 ${form.file ? "text-emerald-500" : "text-slate-300"}`} />
        {form.file ? (
          <div className="text-center">
            <p className="font-bold text-emerald-700 text-sm">{form.file.name}</p>
            <p className="text-slate-400 text-xs mt-0.5">{formatBytes(form.file.size)}</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-bold text-hover-600 text-sm">Drop file here or click to browse</p>
            <p className="text-slate-400 text-xs mt-1">PDF · Word · PowerPoint · Excel · Images · Video (max 100 MB)</p>
          </div>
        )}
        {form.file && (
          <button type="button" onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, file: null })); }}
            className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-500 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* OR divider */}
      <div className="relative flex items-center gap-3">
        <div className="flex-grow border-t border-slate-100" />
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Or paste a link</span>
        <div className="flex-grow border-t border-slate-100" />
      </div>

      <div>
        <label className={labelCls}>External URL</label>
        <input type="url" value={form.externalUrl} disabled={!!form.file}
          onChange={e => setForm(f => ({ ...f, externalUrl: e.target.value }))}
          placeholder="https://..."
          className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`} />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={uploading}
          className="flex items-center gap-2 px-7 py-3.5 bg-[#0B5E3C] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-hover-700 transition-all disabled:opacity-60">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
          {uploading ? "Uploading..." : "Publish Material"}
        </button>
        <button type="button" onClick={onCancel}
          className="px-7 py-3.5 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Module Panel ─────────────────────────────────────────────────────────────
function ModulePanel({ module, materials, courseId, onDeleteModule, onDeleteMaterial, onTogglePublish, isSelected, onSelect }) {
  const [open, setOpen] = useState(isSelected);

  useEffect(() => { if (isSelected) setOpen(true); }, [isSelected]);

  return (
    <div className={`bg-white rounded-2xl border transition-all ${isSelected ? "border-emerald-300 shadow-md" : "border-slate-100 shadow-sm"}`}>
      <button
        onClick={() => { setOpen(v => !v); onSelect(); }}
        className="w-full flex items-center gap-3 p-5 text-left"
      >
        <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <FolderOpen className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex-grow min-w-0">
          <p className="font-black text-slate-800 text-sm truncate">{module.title}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{materials.length} material{materials.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); if (confirm(`Delete module "${module.title}"? Materials will be unlinked.`)) onDeleteModule(module.id); }}
            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3 border-t border-slate-50 pt-3">
          {materials.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4 font-bold uppercase tracking-widest">No materials in this module yet</p>
          ) : (
            materials.map(m => (
              <MaterialCard key={m.id} material={m} courseId={courseId}
                onDelete={onDeleteMaterial} onTogglePublish={onTogglePublish} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function CourseMaterialsManagerPage() {
  const user = getCurrentUser();
  const { courseId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [showNewModuleInput, setShowNewModuleInput] = useState(false);

  if (user?.role !== "lecturer" && user?.role !== "admin") {
    return <Navigate to="/app/dashboard" replace />;
  }

  const load = async () => {
    setLoading(true);
    try {
      const [mats, mods] = await Promise.all([
        getCourseMaterials(courseId),
        getCourseModules(courseId)
      ]);
      setMaterials(mats);
      setModules(mods);
    } catch (err) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [courseId]);

  const handleDelete = async (materialId) => {
    try {
      await deleteCourseMaterial(courseId, materialId);
      setMaterials(prev => prev.filter(m => m.id !== materialId));
    } catch (err) {
      setError(err.message || "Delete failed.");
    }
  };

  const handleTogglePublish = async (materialId, isPublished) => {
    try {
      await updateCourseMaterial(courseId, materialId, { isPublished });
      setMaterials(prev => prev.map(m => m.id === materialId ? { ...m, is_published: isPublished } : m));
    } catch (err) {
      setError(err.message || "Failed to update.");
    }
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    setAddingModule(true);
    try {
      const mod = await createCourseModule(courseId, { title: newModuleTitle.trim() });
      setModules(prev => [...prev, mod]);
      setNewModuleTitle("");
      setShowNewModuleInput(false);
    } catch (err) {
      setError(err.message || "Failed to create module.");
    } finally {
      setAddingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    try {
      await deleteCourseModule(courseId, moduleId);
      setModules(prev => prev.filter(m => m.id !== moduleId));
      setMaterials(prev => prev.map(m => m.module_id === moduleId ? { ...m, module_id: null } : m));
    } catch (err) {
      setError(err.message || "Delete module failed.");
    }
  };

  // Compute stats
  const totalSize = materials.reduce((acc, m) => acc + (m.file_size_bytes || 0), 0);
  const totalDownloads = materials.reduce((acc, m) => acc + (m.download_count || 0), 0);
  const publishedCount = materials.filter(m => m.is_published).length;

  // Group by module
  const unlinked = materials.filter(m => !m.module_id);

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div>
        <Link to="/app/teach" className="inline-flex items-center gap-2 text-xs font-black text-emerald-700 uppercase tracking-widest hover:underline underline-offset-4 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to My Courses
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#0B5E3C] tracking-tight">Learning Materials</h1>
            <p className="text-hover-600 text-sm mt-1">Manage and publish course resources for your students</p>
          </div>
          <button
            onClick={() => setShowUpload(v => !v)}
            className="flex items-center gap-2 px-6 py-3 bg-[#0B5E3C] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-hover-700 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Material
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Materials", value: materials.length, icon: Layers, color: "#3B82F6" },
            { label: "Published", value: publishedCount, icon: Eye, color: "#10B981" },
            { label: "Total Size", value: formatBytes(totalSize) || "—", icon: BookOpen, color: "#8B5CF6" },
            { label: "Total Downloads", value: totalDownloads, icon: Download, color: "#F97316" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "15" }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">{value}</p>
                <p className="text-[10px] font-bold text-hover-500 uppercase tracking-widest">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm font-bold text-red-600">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
          <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Upload form */}
      {showUpload && (
        <UploadForm
          courseId={courseId}
          modules={modules}
          onSuccess={() => { setShowUpload(false); load(); }}
          onCancel={() => setShowUpload(false)}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Module Sidebar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-black text-hover-500 uppercase tracking-widest">Modules</h2>
              <button
                onClick={() => setShowNewModuleInput(v => !v)}
                className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
              >
                <FolderPlus className="w-3.5 h-3.5" /> New Module
              </button>
            </div>

            {showNewModuleInput && (
              <div className="flex items-center gap-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <input
                  autoFocus
                  value={newModuleTitle}
                  onChange={e => setNewModuleTitle(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddModule()}
                  placeholder="Module title..."
                  className="flex-grow text-sm font-bold bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                />
                <button onClick={handleAddModule} disabled={addingModule} className="p-1.5 text-emerald-600 hover:bg-hover-100 rounded-lg">
                  {addingModule ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button onClick={() => setShowNewModuleInput(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Unlinked materials shortcut */}
            <button
              onClick={() => setSelectedModuleId("__unlinked__")}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${selectedModuleId === "__unlinked__" ? "border-slate-400 bg-slate-50" : "border-slate-100 bg-white hover:border-slate-200"}`}
            >
              <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                <File className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="font-black text-slate-600 text-xs uppercase tracking-widest">Unlinked Materials</p>
                <p className="text-[10px] text-slate-400">{unlinked.length} items</p>
              </div>
            </button>

            {modules.map(mod => {
              const modMaterials = materials.filter(m => m.module_id === mod.id);
              return (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModuleId(mod.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${selectedModuleId === mod.id ? "border-emerald-400 bg-emerald-50" : "border-slate-100 bg-white hover:border-hover-200"}`}
                >
                  <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-black text-slate-800 text-xs uppercase tracking-widest truncate">{mod.title}</p>
                    <p className="text-[10px] text-slate-400">{modMaterials.length} items</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); if (confirm(`Delete module "${mod.title}"?`)) handleDeleteModule(mod.id); }}
                    className="p-1 text-slate-200 hover:text-red-500 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </button>
              );
            })}

            {modules.length === 0 && !showNewModuleInput && (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl">
                <FolderPlus className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No modules yet</p>
                <p className="text-[10px] text-slate-300 mt-1">Create modules to organise materials</p>
              </div>
            )}
          </div>

          {/* Materials Panel */}
          <div className="lg:col-span-2 space-y-4">
            {selectedModuleId === null ? (
              // All materials view
              <>
                <h2 className="text-[11px] font-black text-hover-500 uppercase tracking-widest">All Materials</h2>
                {materials.length === 0 ? (
                  <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <CloudUpload className="w-14 h-14 text-slate-200 mx-auto mb-4" />
                    <p className="font-black text-slate-400 uppercase tracking-widest text-sm">No materials uploaded yet</p>
                    <p className="text-slate-300 text-xs mt-2">Click "Add Material" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {materials.map(m => (
                      <MaterialCard key={m.id} material={m} courseId={courseId}
                        onDelete={handleDelete} onTogglePublish={handleTogglePublish} />
                    ))}
                  </div>
                )}
              </>
            ) : selectedModuleId === "__unlinked__" ? (
              <>
                <h2 className="text-[11px] font-black text-hover-500 uppercase tracking-widest">Unlinked Materials</h2>
                {unlinked.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">All materials are in modules</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {unlinked.map(m => (
                      <MaterialCard key={m.id} material={m} courseId={courseId}
                        onDelete={handleDelete} onTogglePublish={handleTogglePublish} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              (() => {
                const mod = modules.find(m => m.id === selectedModuleId);
                const modMaterials = materials.filter(m => m.module_id === selectedModuleId);
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-black text-slate-800">{mod?.title}</h2>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{modMaterials.length} material{modMaterials.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    {modMaterials.length === 0 ? (
                      <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <FolderOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No materials in this module</p>
                        <p className="text-[10px] text-slate-300 mt-1">Upload a material and assign it here</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {modMaterials.map(m => (
                          <MaterialCard key={m.id} material={m} courseId={courseId}
                            onDelete={handleDelete} onTogglePublish={handleTogglePublish} />
                        ))}
                      </div>
                    )}
                  </>
                );
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseMaterialsManagerPage;
