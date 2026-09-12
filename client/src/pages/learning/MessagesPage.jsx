import { useEffect, useState } from "react";
import { getCurrentUser } from "../../services/authService";
import {
  getEnrollments, getMessages, sendMessage, markMessageRead, getMyCourses
} from "../../services/platformService";
import {
  MessageCircle, Bell, Send, CheckCircle2, AlertCircle,
  Loader2, X, Clock, CheckCheck, ChevronDown
} from "lucide-react";

function MessagesPage() {
  const user = getCurrentUser();
  const isLecturer = user?.role === "lecturer" || user?.role === "admin";

  const [messages, setMessages]       = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [msgTab, setMsgTab]           = useState("inbox");
  const [msgSending, setMsgSending]   = useState(false);
  const [msgSuccess, setMsgSuccess]   = useState("");
  const [msgError, setMsgError]       = useState("");
  const [replyTo, setReplyTo]         = useState(null);

  const [composeForm, setComposeForm] = useState({
    to_user_id: isLecturer ? "all_faculty_students" : "lecturer-uuid",
    to_name: isLecturer ? "All Students Enrolled in this Faculty" : "Course Lecturer",
    course_id: "General (All Modules)", course_title: "General (All Modules)", subject: "", message: "",
    category: isLecturer ? "announcement" : "inquiry"
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [msgs, enrols, fetchedCourses] = await Promise.all([
          getMessages().catch(() => []),
          !isLecturer ? getEnrollments().catch(() => []) : Promise.resolve([]),
          isLecturer ? getMyCourses().catch(() => []) : Promise.resolve([])
        ]);
        setMessages(msgs || []);
        setEnrollments(enrols || []);
        setCourses(fetchedCourses || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isLecturer]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!composeForm.subject.trim() || !composeForm.message.trim()) {
      setMsgError("Subject and message are required.");
      return;
    }
    setMsgSending(true); setMsgError(""); setMsgSuccess("");
    try {
      let courseTitle = composeForm.course_title || composeForm.course_id || "General (All Modules)";
      let toName = composeForm.to_name;

      if (!isLecturer) {
        const sel = enrollments.find(e => e.course_id === composeForm.course_id);
        courseTitle = sel ? sel.title : (composeForm.course_title || "General Academic Inquiry");
        toName = replyTo ? replyTo.from_name : (sel ? `${sel.provider_name || "Faculty"} Lecturer` : "Course Lecturer");
      } else {
        courseTitle = composeForm.course_id || "General (All Modules)";
        if (composeForm.to_user_id === "all_faculty_students") toName = "All Students Enrolled in this Faculty";
        else if (composeForm.to_user_id === "all_department_students") toName = "Students in My Department";
        else if (composeForm.to_user_id === "all_students") toName = "All Enrolled Students";
      }

      await sendMessage({
        ...composeForm,
        course_title: courseTitle,
        to_name: toName
      });

      setMsgSuccess(isLecturer ? "Notification dispatched to students successfully!" : "Inquiry dispatched directly to your lecturer!");
      setComposeForm({
        to_user_id: isLecturer ? "all_faculty_students" : "lecturer-uuid",
        to_name: isLecturer ? "All Students Enrolled in this Faculty" : "Course Lecturer",
        course_id: "General (All Modules)", course_title: "General (All Modules)", subject: "", message: "",
        category: isLecturer ? "announcement" : "inquiry"
      });
      setReplyTo(null);
      const updated = await getMessages().catch(() => []);
      setMessages(updated || []);
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
      to_user_id: msg.from_user_id, to_name: msg.from_name,
      course_id: msg.course_id || "", course_title: msg.course_title || "",
      subject: msg.subject.startsWith("Re: ") ? msg.subject : `Re: ${msg.subject}`,
      message: `\n\n--- In reply to ${msg.from_name}:\n${msg.message}`,
      category: isLecturer ? "feedback" : "inquiry"
    });
    setMsgTab("compose");
  };

  const handleMarkRead = async (id) => {
    try {
      await markMessageRead(id);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read_at: new Date().toISOString() } : m));
    } catch (_) {}
  };

  const unreadCount = messages.filter(m => !m.read_at && (isLecturer ? m.from_role !== "lecturer" && m.from_user_id !== "lecturer-uuid" : m.from_role === "lecturer" || m.from_user_id === "lecturer-uuid")).length;

  if (isLecturer) {
    return (
      <div className="space-y-8 pb-20 max-w-5xl mx-auto">
        <section id="messages-section" className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 lg:p-10 space-y-8">
          {/* Header with Notification Sync Notice */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#0B5E3C] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#0B5E3C]/20 flex-shrink-0">
                <MessageCircle className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-widest mb-1 border border-emerald-200">
                  <Bell className="w-3 h-3 text-amber-500" /> Direct Notification Bell Sync
                </div>
                <h2 className="text-2xl sm:text-3xl font-[900] text-[#0B5E3C] uppercase tracking-tight">
                  MESSAGES &amp; STUDENT NOTIFICATIONS HUB
                </h2>
                <p className="text-slate-500 text-xs font-medium mt-1 max-w-xl">
                  Send direct announcements and message notifications to enrolled students. Notifications appear instantly in the student's notification bell.
                </p>
              </div>
            </div>

            {/* Action Tabs */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
              <button
                onClick={() => setMsgTab("inbox")}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  msgTab === "inbox" ? "bg-white text-[#0B5E3C] shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Inbox ({messages.length})
              </button>
              <button
                onClick={() => { setReplyTo(null); setMsgTab("compose"); setComposeForm(f => ({ ...f, to_user_id: "all_faculty_students", to_name: "All Students Enrolled in this Faculty", course_id: "General (All Modules)", course_title: "General (All Modules)" })); }}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  msgTab === "compose" ? "bg-[#0B5E3C] text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Send className="w-3.5 h-3.5 text-amber-400" /> Compose Message
              </button>
            </div>
          </div>

          {/* Alerts */}
          {msgSuccess && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <p className="flex-grow">{msgSuccess}</p>
              <button onClick={() => setMsgSuccess("")}><X className="w-4 h-4" /></button>
            </div>
          )}
          {msgError && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="flex-grow">{msgError}</p>
              <button onClick={() => setMsgError("")}><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* ── COMPOSE MESSAGE TAB ── */}
          {msgTab === "compose" && (
            <form onSubmit={handleSendMessage} className="bg-slate-50/80 p-8 rounded-3xl border border-slate-200 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#0B5E3C]" />
                  <span className="font-black text-slate-800 text-sm uppercase tracking-tight">
                    {replyTo ? `Replying to ${replyTo.from_name}` : "Compose Message Notification to Students"}
                  </span>
                </div>
                {replyTo && (
                  <button
                    type="button"
                    onClick={() => { setReplyTo(null); setComposeForm(f => ({ ...f, to_user_id: "all_faculty_students", to_name: "All Students Enrolled in this Faculty", course_id: "General (All Modules)", course_title: "General (All Modules)" })); }}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase"
                  >
                    Cancel Reply
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Recipient</label>
                  <div className="relative">
                    <select
                      value={composeForm.to_user_id}
                      onChange={e => setComposeForm(f => ({ ...f, to_user_id: e.target.value }))}
                      className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none appearance-none pr-10"
                    >
                      <option value="all_faculty_students">📢 All Students Enrolled in this Faculty</option>
                      <option value="all_department_students">🎓 Students in My Department</option>
                      {replyTo && <option value={replyTo.from_user_id}>👤 {replyTo.from_name} (Student)</option>}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Related Course</label>
                  <div className="relative">
                    <select
                      value={composeForm.course_id}
                      onChange={e => setComposeForm(f => ({ ...f, course_id: e.target.value, course_title: e.target.value }))}
                      className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none appearance-none pr-10"
                    >
                      <option value="General (All Modules)">General (All Modules)</option>
                      <option value="Networking">Networking</option>
                      <option value="Database">Database</option>
                      <option value="Data Analysis">Data Analysis</option>
                      <option value="Cyber Security">Cyber Security</option>
                      <option value="Programming">Programming</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Research">Research</option>
                      <option value="Software Development">Software Development</option>
                      <option value="Others">Others</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Notification Type</label>
                  <div className="relative">
                    <select
                      value={composeForm.category}
                      onChange={e => setComposeForm(f => ({ ...f, category: e.target.value }))}
                      className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none appearance-none pr-10"
                    >
                      <option value="announcement">📢 Course Announcement</option>
                      <option value="feedback">💬 Feedback &amp; Academic Advice</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Subject / Headline *</label>
                <input
                  type="text"
                  placeholder="e.g. Urgent Update: Week 4 Assignment Deadline & Review Session"
                  value={composeForm.subject}
                  onChange={e => setComposeForm(f => ({ ...f, subject: e.target.value }))}
                  className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Message Content *</label>
                <textarea
                  rows={5}
                  placeholder="Write your message here. Students will receive this in their notification bell and Messages inbox..."
                  value={composeForm.message}
                  onChange={e => setComposeForm(f => ({ ...f, message: e.target.value }))}
                  className="block w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                  <Bell className="w-3.5 h-3.5 text-amber-500" /> This will notify students immediately via the notification bell.
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setMsgTab("inbox")}
                    className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase text-slate-600 hover:bg-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={msgSending}
                    className="flex items-center gap-2 px-8 py-3 bg-[#0B5E3C] hover:bg-emerald-800 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition-all disabled:opacity-60"
                  >
                    {msgSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-amber-400" />}
                    {msgSending ? "Dispatching..." : "Send Message Notification"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ── INBOX TAB ── */}
          {msgTab === "inbox" && (
            <div>
              {loading ? (
                <div className="text-center py-16">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8">
                  <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-black text-slate-500 text-sm uppercase tracking-wider">No Messages Yet</p>
                  <p className="text-xs text-slate-400 mt-1">Student inquiries and your broadcast messages will appear here.</p>
                  <button
                    onClick={() => setMsgTab("compose")}
                    className="mt-4 px-6 py-2.5 bg-[#0B5E3C] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-sm"
                  >
                    Compose First Notification
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isSentByMe = msg.from_user_id === user?.id || msg.from_role === "lecturer";
                    return (
                      <div
                        key={msg.id}
                        className={`p-6 rounded-2xl border transition-all ${
                          !msg.read_at && !isSentByMe
                            ? "bg-emerald-50/40 border-emerald-300 shadow-sm"
                            : "bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                              isSentByMe ? "bg-[#0B5E3C] text-white" : "bg-blue-100 text-blue-800"
                            }`}>
                              {isSentByMe ? "You" : (msg.from_name ? msg.from_name[0] : "S")}
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-900 leading-tight">
                                {isSentByMe ? `To: ${msg.to_name || 'All Students'}` : `From: ${msg.from_name} (Student)`}
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold">
                                {msg.course_title || "General Course"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              msg.category === "announcement" ? "bg-amber-100 text-amber-800" :
                              msg.category === "assignment" ? "bg-blue-100 text-blue-800" :
                              "bg-emerald-100 text-emerald-800"
                            }`}>
                              {msg.category || "Message"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(msg.created_at).toLocaleDateString()} {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        <h4 className="text-sm font-black text-[#0B5E3C] mb-2">{msg.subject}</h4>
                        <p className="text-slate-600 text-xs font-medium leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                          {!isSentByMe ? (
                            <button
                              onClick={() => handleReply(msg)}
                              className="inline-flex items-center gap-1.5 text-xs font-black text-[#0B5E3C] hover:text-emerald-700 uppercase tracking-wider"
                            >
                              <Send className="w-3.5 h-3.5" /> Reply to Student
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Broadcasted Announcement</span>
                          )}

                          {!msg.read_at && !isSentByMe && (
                            <button
                              onClick={() => handleMarkRead(msg.id)}
                              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                            >
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> Mark as Read
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      {/* PAGE HEADER FOR STUDENT */}
      <div className="bg-[#0B5E3C] rounded-[2rem] p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="flex items-center gap-5 z-10">
          <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest text-white/80 mb-1">
              <Bell className="w-3 h-3 text-amber-400" /> Direct Notification Bell Sync
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Messages &amp; Lecturer Inquiries Hub</h1>
            <p className="text-white/60 text-xs font-medium mt-1">Send questions and academic requests — notifications reach lecturers instantly.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl z-10 flex-shrink-0">
          <button onClick={() => setMsgTab("inbox")} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${msgTab === "inbox" ? "bg-white text-[#0B5E3C] shadow-sm" : "text-white/80 hover:text-white"}`}>
            Inbox {unreadCount > 0 ? <span className="ml-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{unreadCount}</span> : `(${messages.length})`}
          </button>
          <button onClick={() => { setReplyTo(null); setMsgTab("compose"); setComposeForm(f => ({ ...f, to_user_id: "lecturer-uuid", to_name: "Course Lecturer" })); }} className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${msgTab === "compose" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-white/80 hover:text-white"}`}>
            <Send className="w-3.5 h-3.5" /> Message Lecturer
          </button>
        </div>
      </div>

      {msgSuccess && (<div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800"><CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" /><p className="flex-grow">{msgSuccess}</p><button onClick={() => setMsgSuccess("")}><X className="w-4 h-4" /></button></div>)}
      {msgError   && (<div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-600"><AlertCircle className="w-4 h-4 flex-shrink-0" /><p className="flex-grow">{msgError}</p><button onClick={() => setMsgError("")}><X className="w-4 h-4" /></button></div>)}

      {/* COMPOSE FOR STUDENT */}
      {msgTab === "compose" && (
        <form onSubmit={handleSendMessage} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2"><Send className="w-4 h-4 text-[#0B5E3C]" /><span className="font-black text-slate-800 text-sm uppercase tracking-tight">{replyTo ? `Replying to: ${replyTo.from_name}` : "Compose Academic Inquiry to Lecturer"}</span></div>
            {replyTo && (<button type="button" onClick={() => { setReplyTo(null); setComposeForm(f => ({ ...f, to_user_id: "lecturer-uuid", to_name: "Course Lecturer" })); }} className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase">Cancel Reply</button>)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Select Enrolled Course</label><div className="relative"><select value={composeForm.course_id} onChange={e => setComposeForm(f => ({ ...f, course_id: e.target.value }))} className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none appearance-none pr-10"><option value="">General (Departmental Inquiry)</option>{enrollments.map(e => <option key={e.id} value={e.course_id}>{e.title}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" /></div></div>
            <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Inquiry Type</label><div className="relative"><select value={composeForm.category} onChange={e => setComposeForm(f => ({ ...f, category: e.target.value }))} className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none appearance-none pr-10"><option value="inquiry">Question on Lecture Material</option><option value="feedback">General Academic Advice</option></select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" /></div></div>
          </div>
          <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Subject / Topic *</label><input type="text" placeholder="e.g. Question regarding Week 3 Database Normalization" value={composeForm.subject} onChange={e => setComposeForm(f => ({ ...f, subject: e.target.value }))} className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" required /></div>
          <div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Message / Inquiry *</label><textarea rows={5} placeholder="Type your question here..." value={composeForm.message} onChange={e => setComposeForm(f => ({ ...f, message: e.target.value }))} className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" required /></div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium"><Bell className="w-3.5 h-3.5 text-amber-500" /> Dispatches instantly to the lecturer.</span>
            <div className="flex gap-3">
              <button type="button" onClick={() => setMsgTab("inbox")} className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-black uppercase text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" disabled={msgSending} className="flex items-center gap-2 px-8 py-3 bg-[#0B5E3C] hover:bg-emerald-800 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition-all disabled:opacity-60">{msgSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-amber-400" />}{msgSending ? "Sending..." : "Send to Lecturer"}</button>
            </div>
          </div>
        </form>
      )}

      {/* INBOX FOR STUDENT */}
      {msgTab === "inbox" && (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
          {loading ? (<div className="text-center py-16"><Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-black text-slate-500 text-sm uppercase tracking-wider">No Messages Yet</p>
              <p className="text-xs text-slate-400 mt-1">Announcements and replies from your lecturers will appear here.</p>
              <button onClick={() => setMsgTab("compose")} className="mt-5 px-6 py-2.5 bg-[#0B5E3C] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-sm">Ask a Question</button>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isFromLecturer = msg.from_role === "lecturer" || msg.from_user_id === "lecturer-uuid";
                return (
                  <div key={msg.id} className={`p-6 rounded-2xl border transition-all ${!msg.read_at && isFromLecturer ? "bg-emerald-50/40 border-emerald-300 shadow-sm" : "bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300"}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${isFromLecturer ? "bg-[#0B5E3C] text-white" : "bg-blue-100 text-blue-800"}`}>{isFromLecturer ? "Prof" : "You"}</div>
                        <div><p className="text-xs font-black text-slate-900 leading-tight">{isFromLecturer ? `From: ${msg.from_name || "Course Lecturer"}` : `To: ${msg.to_name || "Lecturer"}`}</p><p className="text-[10px] text-slate-400 font-bold">{msg.course_title || "General Course"}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${msg.category === "announcement" ? "bg-amber-100 text-amber-800" : msg.category === "assignment" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"}`}>{msg.category || "Message"}</span>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(msg.created_at).toLocaleDateString()} {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                    <h4 className="text-sm font-black text-[#0B5E3C] mb-2">{msg.subject}</h4>
                    <p className="text-slate-600 text-xs font-medium leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      {isFromLecturer ? (<button onClick={() => handleReply(msg)} className="inline-flex items-center gap-1.5 text-xs font-black text-[#0B5E3C] hover:text-emerald-700 uppercase tracking-wider"><Send className="w-3.5 h-3.5" /> Reply to Lecturer</button>) : (<span className="text-[10px] font-bold text-slate-400 uppercase">Your Sent Inquiry</span>)}
                      {!msg.read_at && isFromLecturer && (<button onClick={() => handleMarkRead(msg.id)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"><CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> Mark as Read</button>)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MessagesPage;
