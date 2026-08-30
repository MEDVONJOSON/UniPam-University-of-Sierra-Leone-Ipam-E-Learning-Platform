import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getCurrentUser } from "../../services/authService";
import { getAssessmentAttempts } from "../../services/platformService";
import { ArrowLeft, Loader2, AlertCircle, Users, Trophy } from "lucide-react";

function AssessmentResultsPage() {
  const user = getCurrentUser();
  const { courseId, assessmentId } = useParams();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setAttempts(await getAssessmentAttempts(courseId, assessmentId));
      } catch (err) {
        setError(err.message || "Failed to load results.");
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, assessmentId]);

  if (user?.role !== "lecturer" && user?.role !== "admin") {
    return <Navigate to="/app/dashboard" replace />;
  }

  const average = attempts.length > 0
    ? Math.round((attempts.reduce((sum, a) => sum + (a.score / a.maxScore), 0) / attempts.length) * 100)
    : 0;

  return (
    <div className="space-y-8 pb-20">
      <Link to={`/app/teach/${courseId}/assessments`} className="inline-flex items-center gap-2 text-xs font-black text-brand-600 uppercase tracking-widest hover:underline underline-offset-4">
        <ArrowLeft className="w-4 h-4" /> Back to Assessments
      </Link>

      <h1 className="text-3xl font-black text-[#0B5E3C] uppercase tracking-tight">Results</h1>

      {error && (
        <div className="flex items-center gap-3 p-5 text-sm font-bold text-red-600 bg-red-50 rounded-2xl border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 max-w-lg">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <Users className="w-6 h-6 text-brand-600 mb-3" />
          <div className="text-3xl font-black text-[#0B5E3C]">{attempts.length}</div>
          <p className="text-[10px] font-black text-hover-500 uppercase tracking-widest mt-2">Submissions</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <Trophy className="w-6 h-6 text-gold-500 mb-3" />
          <div className="text-3xl font-black text-[#0B5E3C]">{average}%</div>
          <p className="text-[10px] font-black text-hover-500 uppercase tracking-widest mt-2">Average Score</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        </div>
      ) : attempts.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No submissions yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-[10px] font-black text-hover-500 uppercase tracking-widest">Student</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-hover-500 uppercase tracking-widest">Score</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-hover-500 uppercase tracking-widest">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {attempts
                .slice()
                .sort((a, b) => b.score / b.maxScore - a.score / a.maxScore)
                .map((a) => (
                  <tr key={a.userId} className="border-b border-slate-50 last:border-0">
                    <td className="px-6 py-4">
                      <p className="font-black text-[#0B5E3C]">{a.studentName}</p>
                      <p className="text-xs text-slate-400">{a.studentEmail}</p>
                    </td>
                    <td className="px-6 py-4 font-black text-[#0B5E3C]">{a.score} / {a.maxScore}</td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-bold">{new Date(a.submittedAt).toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AssessmentResultsPage;
