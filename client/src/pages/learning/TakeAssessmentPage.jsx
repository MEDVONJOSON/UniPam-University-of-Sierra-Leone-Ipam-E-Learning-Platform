import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAssessmentDetail, submitAssessmentAttempt } from "../../services/platformService";
import { ArrowLeft, Loader2, AlertCircle, Clock, CheckCircle2, XCircle, Trophy } from "lucide-react";

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function TakeAssessmentPage() {
  const { courseId, assessmentId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const submittedRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAssessmentDetail(courseId, assessmentId);
      setAssessment(data);
      if (data.myAttempt) {
        setResult(data.myAttempt);
      } else if (data.status === "open" && data.questions) {
        setAnswers(new Array(data.questions.length).fill(-1));
        setSecondsLeft(data.durationMinutes * 60);
      }
    } catch (err) {
      setError(err.message || "Failed to load assessment.");
    } finally {
      setLoading(false);
    }
  }, [courseId, assessmentId]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      const data = await submitAssessmentAttempt(courseId, assessmentId, answers);
      setResult(data);
    } catch (err) {
      setError(err.message || "Submission failed.");
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }, [courseId, assessmentId, answers]);

  useEffect(() => {
    if (secondsLeft === null || result) return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, result, handleSubmit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (error && !assessment) {
    return (
      <div className="flex items-center gap-3 p-6 text-sm font-bold text-red-600 bg-red-50 rounded-2xl border border-red-100 max-w-2xl mx-auto">
        <AlertCircle className="w-5 h-5 flex-shrink-0" /> <p>{error}</p>
      </div>
    );
  }

  const backLink = `/app/learn/${courseId}`;

  if (result) {
    const percent = Math.round((result.score / result.maxScore) * 100);
    return (
      <div className="max-w-2xl mx-auto space-y-8 pb-20">
        <Link to={backLink} className="inline-flex items-center gap-2 text-xs font-black text-brand-600 uppercase tracking-widest hover:underline underline-offset-4">
          <ArrowLeft className="w-4 h-4" /> Back to Course
        </Link>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 text-center">
          <Trophy className="w-14 h-14 text-gold-500 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-[#0B5E3C] uppercase tracking-tight mb-2">{assessment.title}</h1>
          <p className="text-5xl font-black text-[#0B5E3C] my-6">{percent}%</p>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Score: {result.score} / {result.maxScore}</p>
        </div>

        {assessment.questions && (
          <div className="space-y-4">
            {assessment.questions.map((q, i) => {
              const yourAnswer = result.answers[i];
              const correct = yourAnswer === q.correctIndex;
              return (
                <div key={q.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-start gap-3 mb-4">
                    {correct ? <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                    <p className="font-black text-[#0B5E3C]">{q.questionText}</p>
                  </div>
                  <div className="space-y-2 pl-8">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`px-4 py-2 rounded-xl text-xs font-bold ${
                          optIdx === q.correctIndex ? "bg-brand-50 text-brand-700" :
                          optIdx === yourAnswer ? "bg-red-50 text-red-600" : "text-slate-400"
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (!assessment.questions || assessment.status !== "open") {
    return (
      <div className="max-w-2xl mx-auto text-center py-32 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
        <Clock className="w-14 h-14 text-slate-200 mx-auto mb-4" />
        <h3 className="text-2xl font-black text-[#0B5E3C] mb-2 uppercase tracking-tight">{assessment.title}</h3>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
          {assessment.status === "upcoming" ? `Opens ${new Date(assessment.opensAt).toLocaleString()}` : "This assessment is closed"}
        </p>
        <Link to={backLink} className="mt-8 inline-block px-8 py-3 bg-[#0B5E3C] text-white text-[10px] font-black uppercase tracking-widest rounded-xl">Back to Course</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between sticky top-24 z-10 bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-sm">
        <h1 className="text-lg font-black text-[#0B5E3C] uppercase tracking-tight">{assessment.title}</h1>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#0B5E3C] text-white rounded-xl font-black text-sm">
          <Clock className="w-4 h-4" /> {formatTime(secondsLeft)}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-5 text-sm font-bold text-red-600 bg-red-50 rounded-2xl border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> <p>{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {assessment.questions.map((q, qIdx) => (
          <div key={q.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <p className="font-black text-[#0B5E3C] mb-4">{qIdx + 1}. {q.questionText}</p>
            <div className="space-y-2">
              {q.options.map((opt, optIdx) => (
                <label
                  key={optIdx}
                  className={`flex items-center gap-3 px-5 py-3 rounded-xl border cursor-pointer transition-all ${
                    answers[qIdx] === optIdx ? "bg-brand-50 border-brand-200" : "bg-slate-50 border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${qIdx}`}
                    checked={answers[qIdx] === optIdx}
                    onChange={() => setAnswers((prev) => prev.map((v, i) => (i === qIdx ? optIdx : v)))}
                  />
                  <span className="text-sm font-bold text-slate-600">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-5 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-hover-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        {submitting ? "Submitting..." : "Submit Assessment"}
      </button>
    </div>
  );
}

export default TakeAssessmentPage;
