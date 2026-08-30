import { useEffect, useState } from "react";
import {
  getCertificates, getEnrollments,
  setCertificateVisibility, uploadCertificate
} from "../../services/platformService";
import {
  Award, Upload, Eye, EyeOff, FileText, ExternalLink, Link2,
  Loader2, AlertCircle, CheckCircle2, ChevronDown, FolderOpen
} from "lucide-react";

function CertificateWalletPage() {
  const [certificates, setCertificates] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({
    title: "", courseId: "", externalVerificationUrl: "", isPublic: false, file: null
  });

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [certData, enrollmentData] = await Promise.all([getCertificates(), getEnrollments()]);
      setCertificates(certData || []);
      setEnrollments(enrollmentData || []);
    } catch {
      setError("Failed to load certificates.");
      setCertificates([]);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleUpload(event) {
    event.preventDefault();
    if (!form.file) { setError("Select a certificate file first."); return; }
    setError(""); setMessage("");
    try {
      await uploadCertificate(form);
      setMessage("Certificate uploaded successfully!");
      setForm({ title: "", courseId: "", externalVerificationUrl: "", isPublic: false, file: null });
      setShowUpload(false);
      await loadData();
    } catch (err) { setError(err.message); }
  }

  async function handleVisibilityToggle(item) {
    try {
      await setCertificateVisibility(item.id, !item.is_public);
      await loadData();
    } catch (err) { setError(err.message); }
  }

  const inputClass = "block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-slate-900";

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold-100 text-gold-600 rounded-xl">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#0B5E3C]">Certificate Wallet</h1>
            <p className="text-slate-500 text-sm">Upload, manage, and share your achievements</p>
          </div>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0B5E3C] text-white text-sm font-bold rounded-xl hover:bg-[#1E7A52] transition-all shadow-md"
        >
          <Upload className="w-4 h-4" />
          {showUpload ? "Cancel" : "Upload Certificate"}
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> <p>{error}</p>
        </div>
      )}
      {message && (
        <div className="flex items-center gap-2 p-4 text-sm text-brand-700 bg-brand-50 rounded-xl border border-brand-100">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> <p>{message}</p>
        </div>
      )}

      {/* Upload Form */}
      {showUpload && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#0B5E3C] mb-5">Upload New Certificate</h2>
          <form className="space-y-5" onSubmit={handleUpload}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Certificate Title</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <input
                    type="text" placeholder="e.g., Python Certification" required className={inputClass}
                    value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Link to Course (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="h-5 w-5" />
                  </div>
                  <select
                    value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                    className="appearance-none block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-slate-700 cursor-pointer"
                  >
                    <option value="">Not linked</option>
                    {enrollments.map((item) => (
                      <option key={item.course_id} value={item.course_id}>{item.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Verification URL (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Link2 className="h-5 w-5" />
                </div>
                <input
                  type="url" placeholder="https://verify.example.com/cert/..." className={inputClass}
                  value={form.externalVerificationUrl} onChange={(e) => setForm({ ...form, externalVerificationUrl: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Certificate File</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50 hover:border-hover-300 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500 mb-2">PDF, PNG, JPG, or WEBP (max 5MB)</p>
                <input
                  type="file" accept=".pdf,image/png,image/jpeg,image/webp"
                  className="text-sm file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 transition-all"
                  onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox" id="isPublic" checked={form.isPublic}
                onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
              <label htmlFor="isPublic" className="text-sm text-slate-600">Make this certificate publicly visible</label>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#0B5E3C] hover:bg-[#1E7A52] text-white text-sm font-bold rounded-xl transition-all shadow-lg"
            >
              <Upload className="w-4 h-4" /> Upload Certificate
            </button>
          </form>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
        </div>
      )}

      {/* Certificate Grid */}
      {!loading && (
        certificates.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400 mb-2">No certificates yet</h3>
            <p className="text-slate-400 mb-6">Upload your first certificate to get started</p>
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B5E3C] text-white rounded-xl font-bold hover:bg-[#1E7A52] transition-all"
            >
              <Upload className="w-4 h-4" /> Upload
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-brand-600 to-gold-500" />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gold-50 text-gold-600 rounded-lg">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#0B5E3C]">{item.title}</h3>
                        <p className="text-xs text-slate-400">{item.course_title || "Not linked to a course"}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                      item.is_public ? "bg-brand-50 text-brand-600" : "bg-slate-100 text-slate-500"
                    }`}>
                      {item.is_public ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {item.is_public ? "Public" : "Private"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                    <FileText className="w-4 h-4" />
                    <span>{item.file_name}</span>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`/uploads/${item.storage_key}`}
                      target="_blank" rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-brand-600 bg-brand-50 hover:bg-hover-100 rounded-xl transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" /> View
                    </a>
                    <button
                      type="button"
                      onClick={() => handleVisibilityToggle(item)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      {item.is_public ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {item.is_public ? "Make Private" : "Make Public"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default CertificateWalletPage;
