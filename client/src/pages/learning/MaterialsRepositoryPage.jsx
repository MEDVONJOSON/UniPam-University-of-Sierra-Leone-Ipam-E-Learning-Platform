import { useEffect, useState, useMemo } from "react";
import {
  getRepositoryMaterials,
  getSavedMaterials,
  saveMaterial,
  unsaveMaterial,
  downloadCourseMaterial,
  getCourses
} from "../../services/platformService";
import { getCurrentUser } from "../../services/authService";
import {
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Download,
  ExternalLink,
  FileText,
  Video,
  Link2,
  File,
  Table2,
  Image as ImageIcon,
  Loader2,
  BookOpen,
  Sparkles,
  RefreshCw,
  X,
  FolderOpen,
  Layers,
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet
} from "lucide-react";

// ─── Constants & Helpers ──────────────────────────────────────────────────────
const CATEGORY_OPTIONS = [
  { value: "all",              label: "All Categories",        color: "#64748B" },
  { value: "lecture_notes",    label: "Lecture Notes",         color: "#3B82F6" },
  { value: "assignment",       label: "Assignments",           color: "#F59E0B" },
  { value: "past_exam",        label: "Past Exam Papers",      color: "#EF4444" },
  { value: "reading_material", label: "Reading Materials",     color: "#10B981" },
  { value: "reference",        label: "Reference Docs",        color: "#8B5CF6" },
  { value: "presentation",     label: "Presentations",         color: "#F97316" },
  { value: "spreadsheet",      label: "Spreadsheets",          color: "#06B6D4" },
  { value: "image",            label: "Diagrams & Images",     color: "#EC4899" },
  { value: "recorded_lecture", label: "Recorded Lectures",     color: "#6366F1" },
  { value: "other",            label: "Other Materials",       color: "#94A3B8" },
];

const TYPE_CONFIG = {
  pdf:          { Icon: FileText,       color: "#EF4444", bg: "#FEF2F2", label: "PDF" },
  video:        { Icon: Video,          color: "#6366F1", bg: "#EEF2FF", label: "Video" },
  doc:          { Icon: FileText,       color: "#3B82F6", bg: "#EFF6FF", label: "Document" },
  presentation: { Icon: File,           color: "#F97316", bg: "#FFF7ED", label: "Presentation" },
  spreadsheet:  { Icon: FileSpreadsheet,color: "#10B981", bg: "#F0FDF4", label: "Spreadsheet" },
  image:        { Icon: ImageIcon,      color: "#EC4899", bg: "#FDF2F8", label: "Image" },
  link:         { Icon: Link2,          color: "#0EA5E9", bg: "#F0F9FF", label: "External Link" },
};

function formatBytes(bytes) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getCategoryBadge(catValue) {
  const match = CATEGORY_OPTIONS.find(c => c.value === catValue);
  return match || { label: catValue || "General", color: "#64748B" };
}

export default function MaterialsRepositoryPage() {
  const user = getCurrentUser();
  const [materials, setMaterials] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadError, setDownloadError] = useState("");
  const [downloadingMap, setDownloadingMap] = useState({});

  const handleDownloadTrack = (mat) => {
    try {
      const key = `downloaded_materials_${user?.id || "default"}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      if (!existing.some(item => item.id === mat.id)) {
        existing.push({
          id: mat.id,
          title: mat.title,
          description: mat.description,
          material_type: mat.material_type,
          material_category: mat.material_category,
          course_title: mat.course_title,
          course_code: mat.course_code,
          lecturer_name: mat.lecturer_name,
          file_size: mat.file_size,
          file_url: mat.file_url,
          course_id: mat.course_id || mat.courseId,
          external_url: mat.external_url || null,
          downloaded_at: new Date().toISOString()
        });
        localStorage.setItem(key, JSON.stringify(existing));
      }
    } catch (err) {
      console.error("Failed to track download:", err);
    }
  };

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'saved'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");

  // Save operation loading state mapping materialId -> boolean
  const [savingMap, setSavingMap] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [matsRes, savedRes, coursesRes] = await Promise.allSettled([
        getRepositoryMaterials(),
        getSavedMaterials(),
        getCourses()
      ]);

      if (matsRes.status === "fulfilled") {
        setMaterials(matsRes.value || []);
      } else {
        console.error("Failed to load materials:", matsRes.reason);
      }

      if (savedRes.status === "fulfilled") {
        const ids = new Set((savedRes.value || []).map(item => item.id || item.material_id));
        setSavedIds(ids);
      }

      if (coursesRes.status === "fulfilled") {
        setCourses(coursesRes.value || []);
      }
    } catch (err) {
      setError("Failed to load materials repository. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (material) => {
    const matId = material.id;
    const courseId = material.course_id || material.courseId;
    if (!matId || !courseId) return;

    const isCurrentlySaved = savedIds.has(matId);

    setSavingMap(prev => ({ ...prev, [matId]: true }));
    try {
      if (isCurrentlySaved) {
        await unsaveMaterial(courseId, matId);
        setSavedIds(prev => {
          const next = new Set(prev);
          next.delete(matId);
          return next;
        });
      } else {
        await saveMaterial(courseId, matId);
        setSavedIds(prev => {
          const next = new Set(prev);
          next.add(matId);
          return next;
        });
      }
    } catch (err) {
      console.error("Save/unsave toggle error:", err);
    } finally {
      setSavingMap(prev => ({ ...prev, [matId]: false }));
    }
  };

  const handleDownload = async (material) => {
    const matId = material.id;
    const courseId = material.course_id || material.courseId;
    if (!matId || !courseId) return;

    setDownloadingMap(prev => ({ ...prev, [matId]: true }));
    setDownloadError("");
    try {
      await downloadCourseMaterial(courseId, matId, material.original_filename || material.title || "learning-material");
      handleDownloadTrack(material);
    } catch (err) {
      setDownloadError(err.message || "Download failed. Please sign in again and try once more.");
    } finally {
      setDownloadingMap(prev => ({ ...prev, [matId]: false }));
    }
  };

  // Unique modules derived from loaded materials
  const uniqueModules = useMemo(() => {
    const list = [];
    const seen = new Set();
    materials.forEach(m => {
      const id = m.module_id || m.course_id;
      const title = m.module_title || m.course_title;
      if (title && !seen.has(title)) {
        seen.add(title);
        list.push({ id, title });
      }
    });
    return list.sort((a, b) => a.title.localeCompare(b.title));
  }, [materials]);

  // Filter logic
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      // Tab filter
      if (activeTab === "saved" && !savedIds.has(m.id)) return false;

      // Category filter
      if (selectedCategory !== "all" && m.material_category !== selectedCategory) return false;

      // Type filter
      if (selectedType !== "all" && m.material_type !== selectedType) return false;

      // Course/Module filter
      if (selectedCourse !== "all" && String(m.module_id || m.course_id) !== String(selectedCourse)) return false;

      // Semester filter
      if (selectedSemester !== "all" && m.semester !== selectedSemester) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = m.title?.toLowerCase().includes(q);
        const descMatch = m.description?.toLowerCase().includes(q);
        const courseMatch = m.course_title?.toLowerCase().includes(q) || m.course_code?.toLowerCase().includes(q) || m.course_department?.toLowerCase().includes(q);
        const lecturerMatch = (m.lecturer_name || m.uploader_name)?.toLowerCase().includes(q);
        const weekMatch = m.week_label?.toLowerCase().includes(q) || (m.lecture_note_number && String(m.lecture_note_number).toLowerCase().includes(q));

        if (!titleMatch && !descMatch && !courseMatch && !lecturerMatch && !weekMatch) {
          return false;
        }
      }

      return true;
    });
  }, [materials, savedIds, activeTab, selectedCategory, selectedType, selectedCourse, selectedSemester, searchQuery]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedType("all");
    setSelectedCourse("all");
    setSelectedSemester("all");
  };

  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "all" || selectedType !== "all" || selectedCourse !== "all" || selectedSemester !== "all";

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0B5E3C] via-[#0E7A4E] to-[#129761] rounded-[2rem] p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold mb-3 backdrop-blur-md">
              <FolderOpen className="w-3.5 h-3.5 text-gold-400" />
              Central Learning Library
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Materials Repository
            </h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl">
              Access lecture notes, past exam papers, assignments, and study resources uploaded across all your enrolled courses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchInitialData()}
              disabled={loading}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-white backdrop-blur-md flex items-center justify-center"
              title="Refresh Repository"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            {/* Tabs */}
            <div className="bg-black/20 backdrop-blur-md p-1 rounded-2xl flex items-center gap-1 border border-white/10">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "all"
                    ? "bg-white text-[#0B5E3C] shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
              >
                All Materials ({materials.length})
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "saved"
                    ? "bg-white text-[#0B5E3C] shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                Saved ({savedIds.size})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Search & Filters Bar ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, course, topic, or lecturer..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5E3C]/20 focus:border-[#0B5E3C] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Selects */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full md:w-auto">
            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5E3C]/20 focus:border-[#0B5E3C] transition-all"
            >
              {CATEGORY_OPTIONS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>

            {/* Type Select */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5E3C]/20 focus:border-[#0B5E3C] transition-all"
            >
              <option value="all">All File Types</option>
              <option value="pdf">PDF Documents</option>
              <option value="doc">Word / Documents</option>
              <option value="presentation">Presentations</option>
              <option value="spreadsheet">Spreadsheets</option>
              <option value="image">Images / Diagrams</option>
              <option value="video">Videos</option>
              <option value="link">Web Links</option>
            </select>

            {/* Module Select */}
            {uniqueModules.length > 0 && (
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B5E3C]/20 focus:border-[#0B5E3C] transition-all max-w-[200px] truncate"
              >
                <option value="all">All Modules</option>
                {uniqueModules.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            )}

            {/* Clear Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {downloadError && (
        <div className="bg-red-50 rounded-2xl p-4 border border-red-100 text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="font-semibold text-sm">{downloadError}</p>
          <button onClick={() => setDownloadError("")} className="ml-auto text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── Content Grid / List ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#0B5E3C] animate-spin mb-3" />
          <p className="text-slate-600 text-sm font-medium">Loading materials repository...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-2xl p-8 text-center border border-red-100 text-red-700 flex flex-col items-center">
          <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
          <p className="font-semibold text-sm">{error}</p>
          <button
            onClick={fetchInitialData}
            className="mt-4 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-all"
          >
            Retry
          </button>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3">
            {activeTab === "saved" ? <Bookmark className="w-6 h-6" /> : <FolderOpen className="w-6 h-6" />}
          </div>
          <h3 className="text-slate-800 font-bold text-base mb-1">
            {activeTab === "saved" ? "No Saved Materials" : "No Materials Found"}
          </h3>
          <p className="text-slate-500 text-xs max-w-md">
            {activeTab === "saved"
              ? "You haven't bookmarked any materials yet. Click the bookmark icon on any material to save it for quick access."
              : hasActiveFilters
              ? "No materials match your filter criteria. Try resetting search or select a different category."
              : "No learning materials have been uploaded yet for your enrolled courses."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-[#0B5E3C] text-white text-xs font-bold rounded-xl hover:bg-[#08482E] transition-all"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map(mat => {
            const isSaved = savedIds.has(mat.id);
            const isSaving = Boolean(savingMap[mat.id]);
            const typeCfg = TYPE_CONFIG[mat.material_type] || TYPE_CONFIG.doc;
            const { Icon: TypeIcon, color: typeColor, bg: typeBg, label: typeLabel } = typeCfg;
            const catBadge = getCategoryBadge(mat.material_category);
            const isDownloading = Boolean(downloadingMap[mat.id]);

            return (
              <div
                key={mat.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top Bar: Type Icon & Category Badge & Save Button */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: typeBg, color: typeColor }}
                      >
                        <TypeIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider truncate"
                          style={{ backgroundColor: `${catBadge.color}15`, color: catBadge.color }}
                        >
                          {catBadge.label}
                        </span>
                      </div>
                    </div>

                    {/* Bookmark Button */}
                    <button
                      onClick={() => handleToggleSave(mat)}
                      disabled={isSaving}
                      className={`p-2 rounded-xl transition-all ${
                        isSaved
                          ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                          : "text-slate-300 hover:text-slate-600 hover:bg-slate-50"
                      }`}
                      title={isSaved ? "Remove bookmark" : "Save to repository bookmarks"}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      ) : isSaved ? (
                        <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-slate-800 text-sm line-clamp-2 group-hover:text-[#0B5E3C] transition-colors mb-1">
                    {mat.title}
                  </h3>

                  {mat.description && (
                    <p className="text-slate-500 text-xs line-clamp-2 mb-3">
                      {mat.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-50 text-xs text-slate-500">
                    {mat.course_department && (
                      <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider truncate mb-1">
                        {mat.course_department}
                      </p>
                    )}

                    {(mat.module_title || mat.course_title) && (
                      <div className="flex items-center gap-1.5 truncate">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-medium text-slate-700">
                          {mat.module_title || mat.course_title}
                        </span>
                      </div>
                    )}

                    {(mat.lecturer_name || mat.uploader_name) && (
                      <div className="flex items-center gap-1.5 truncate">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{mat.lecturer_name || mat.uploader_name}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>{mat.lecture_note_number ? `Note ${mat.lecture_note_number}` : mat.week_label || typeLabel}</span>
                      {(mat.file_size || mat.file_size_bytes) ? (
                        <span>{formatBytes(mat.file_size || mat.file_size_bytes)}</span>
                      ) : (
                        <span>{mat.external_url ? "Link" : "Resource"}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {mat.created_at ? new Date(mat.created_at).toLocaleDateString() : ""}
                  </span>

                  {mat.external_url ? (
                    <a
                      href={mat.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleDownloadTrack(mat)}
                      className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      Open Link
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDownload(mat)}
                      disabled={isDownloading}
                      className="px-3 py-1.5 rounded-xl bg-[#0B5E3C]/10 text-[#0B5E3C] hover:bg-[#0B5E3C] hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                    >
                      {isDownloading ? "Downloading..." : "Download"}
                      {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
