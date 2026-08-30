import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getCurrentUser } from "../../services/authService";
import { createAssessment, deleteAssessment, getAssessments } from "../../services/platformService";
import {
  ArrowLeft, FileCheck, Plus, Trash2, Loader2, AlertCircle, CheckCircle2,
  BarChart3, Clock, X
} from "lucide-react";

const STATUS_STYLE = {
  open: "bg-brand-50 text-brand-600 border-brand-100",
  upcoming: "bg-gold-50 text-gold-600 border-gold-100",
  closed: "bg-slate-100 text-slate-400 border-slate-200"
};

function emptyQuestion() {
  return { questionText: "", options: ["", ""], correctIndex: 0, points: 1 };
}

function toLocalInputValue(isoOrEmpty) {
  return isoOrEmpty || "";
}

function CourseAssessmentsManagerPage() {
  const user = getCurrentUser();
  const { courseId } = useParams();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "", opensAt: "", closesAt: "", durationMinutes: 30,
    questions: [emptyQuestion()]
  });

  const loadAssessments = async () => {
    setLoading(true);
    try {
      setAssessments(await getAssessments(courseId));
    } catch (err) {
      setError(err.message || "Failed to load assessments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAssessments(); }, [courseId]);

  if (user?.role !== "lecturer" && user?.role !== "admin") {
    return <Navigate to="/app/dashboard" replace />;
  }

  const updateQuestion = (idx, patch) => {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) => (i === idx ? { ...q, ...patch } : q))
    }));
  };

  const updateOption = (qIdx, optIdx, value) => {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) => {
        if (i !== qIdx) return q;
        const options = [...q.options];
        options[optIdx] = value;
        return { ...q, options };
      })
    }));
  };

  const addOption = (qIdx) => {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) => (i === qIdx ? { ...q, options: [...q.options, ""] } : q))
    }));
  };

  const removeOption = (qIdx, optIdx) => {
    setForm((f) => ({
      ...f,
      questions: f.questions.map((q, i) => {
        if (i !== qIdx) return q;
        const options = q.options.filter((_, oi) => oi !== optIdx);
        return { ...q, options, correctIndex: Math.min(q.correctIndex, options.length - 1) };
      })
    }));
  };

  const addQuestion = () => setForm((f) => ({ ...f, questions: [...f.questions, emptyQuestion()] }));
  const removeQuestion = (idx) => setForm((f) => ({ ...f, questions: f.questions.filter((_, i) => i !== idx) }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await createAssessment(courseId, {
        ...form,
        opensAt: new Date(form.opensAt).toISOString(),
        closesAt: new Date(form.closesAt).toISOString(),
        durationMinutes: Number(form.durationMinutes)
      });
      setForm({ title: "", opensAt: "", closesAt: "", durationMinutes: 30, questions: [emptyQuestion()] });
      setShowForm(false);
      await loadAssessments();
    } catch (err) {
      setError(err.message || "Failed to create assessment.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAssessment(courseId, id);
      setAssessments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err.message || "Delete failed.");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <Link to="/app/teach" className="inline-flex items-center gap-2 text-xs font-black text-brand-600 uppercase tracking-widest hover:underline underline-offset-4">
        <ArrowLeft className="w-4 h-4" /> Back to My Courses
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-black text-[#0B5E3C] uppercase tracking-tight">Assessments</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0B5E3C] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-hover-700 transition-all"
        >
          <Plus className="w-4 h-4" /> New Assessment
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-5 text-sm font-bold text-red-600 bg-red-50 rounded-2xl border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> <p>{error}</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3 space-y-2">
              <label className="text-[10px] font-black text-hover-500 uppercase tracking-widest ml-1">Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="EX: WEEK 3 QUIZ"
                className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#0B5E3C] uppercase focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-hover-500 uppercase tracking-widest ml-1">Opens At</label>
              <input
                required
                type="datetime-local"
                value={toLocalInputValue(form.opensAt)}
                onChange={(e) => setForm({ ...form, opensAt: e.target.value })}
                className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#0B5E3C] focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-hover-500 uppercase tracking-widest ml-1">Closes At</label>
              <input
                required
                type="datetime-local"
                value={toLocalInputValue(form.closesAt)}
                onChange={(e) => setForm({ ...form, closesAt: e.target.value })}
                className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#0B5E3C] focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-hover-500 uppercase tracking-widest ml-1">Duration (Minutes)</label>
              <input
                required
                type="number"
                min="1"
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#0B5E3C] focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-[#0B5E3C] uppercase tracking-[0.2em]">Questions</h3>
            {form.questions.map((q, qIdx) => (
              <div key={qIdx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    required
                    value={q.questionText}
                    onChange={(e) => updateQuestion(qIdx, { questionText: e.target.value })}
                    placeholder={`Question ${qIdx + 1}`}
                    className="flex-grow px-5 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold text-[#0B5E3C]"
                  />
                  <input
                    type="number"
                    min="1"
                    value={q.points}
                    onChange={(e) => updateQuestion(qIdx, { points: Number(e.target.value) })}
                    title="Points"
                    className="w-20 px-3 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold text-[#0B5E3C] text-center"
                  />
                  {form.questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(qIdx)} className="p-2 text-slate-300 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="space-y-2 pl-2">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={q.correctIndex === optIdx}
                        onChange={() => updateQuestion(qIdx, { correctIndex: optIdx })}
                        title="Mark as correct answer"
                      />
                      <input
                        required
                        value={opt}
                        onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                        placeholder={`Option ${optIdx + 1}`}
                        className="flex-grow px-4 py-2 bg-white border border-slate-100 rounded-lg text-xs font-bold text-slate-600"
                      />
                      {q.options.length > 2 && (
                        <button type="button" onClick={() => removeOption(qIdx, optIdx)} className="text-slate-300 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addOption(qIdx)} className="text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline">
                    + Add Option
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addQuestion} className="flex items-center gap-2 text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline">
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 px-8 py-4 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-hover-700 transition-all disabled:opacity-60"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {creating ? "Publishing..." : "Publish Assessment"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        </div>
      ) : assessments.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <FileCheck className="w-14 h-14 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No assessments published yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assessments.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-5">
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 flex-shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="flex-grow min-w-0">
                <p className="font-black text-[#0B5E3C] truncate">{a.title}</p>
                <p className="text-[10px] font-bold text-hover-500 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                  <Clock className="w-3 h-3" /> {new Date(a.opensAt).toLocaleString()} &rarr; {new Date(a.closesAt).toLocaleString()}
                </p>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border flex-shrink-0 ${STATUS_STYLE[a.status]}`}>
                {a.status}
              </span>
              <Link
                to={`/app/teach/${courseId}/assessments/${a.id}/results`}
                className="p-3 text-slate-300 hover:text-hover-600 hover:bg-hover-50 rounded-xl transition-all flex-shrink-0"
                title="View results"
              >
                <BarChart3 className="w-4 h-4" />
              </Link>
              <button
                onClick={() => handleDelete(a.id)}
                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex-shrink-0"
                title="Delete assessment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseAssessmentsManagerPage;
