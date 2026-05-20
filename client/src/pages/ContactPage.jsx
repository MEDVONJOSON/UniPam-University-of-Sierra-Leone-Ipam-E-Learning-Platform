import { useState } from "react";
import { Mail, User, MessageSquare, Send, CheckCircle2, MapPin, Phone, Clock, GraduationCap } from "lucide-react";

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function onSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  const inputClass = "block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#0d2d57] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all uppercase";

  const contactInfo = [
    { icon: <Mail className="w-5 h-5" />, label: "Official Email", value: "registrar@usl.edu.sl" },
    { icon: <Phone className="w-5 h-5" />, label: "Registry Office", value: "+232 00 000 000" },
    { icon: <MapPin className="w-5 h-5" />, label: "Main Campus", value: "Tower Hill, Freetown, SL" },
    { icon: <Clock className="w-5 h-5" />, label: "Registry Hours", value: "Mon – Fri, 8:30am – 4:30pm" }
  ];

  if (submitted) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 max-w-md w-full animate-in fade-in zoom-in-95">
          <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-8 border-4 border-white shadow-xl">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-[#0d2d57] mb-4 uppercase tracking-tight">Submission Successful</h2>
          <p className="text-slate-500 leading-relaxed mb-8 font-medium">
            Your inquiry has been received by the University of Sierra Leone Registry. A representative will contact you shortly.
          </p>
          <button
            onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
            className="w-full py-4 bg-[#0d2d57] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/10"
          >
            Send Another Inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      {/* Institutional Header */}
      <div className="text-center pt-12 max-w-2xl mx-auto">
         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-200">
            <GraduationCap className="w-4 h-4" />
            Registry Support
         </div>
         <h1 className="text-4xl md:text-5xl font-black text-[#0d2d57] mb-4 uppercase tracking-tight">University Help Desk</h1>
         <p className="text-slate-500 text-lg font-medium leading-relaxed">
           Connect with the University of Sierra Leone Digital Campus for admissions, technical support, or partnership inquiries.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-6xl mx-auto px-6">
        {/* Contact Form Area */}
        <div className="lg:col-span-3 bg-white p-10 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
          <h2 className="text-2xl font-black text-[#0d2d57] mb-8 uppercase tracking-tight">Inquiry Form</h2>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text" required placeholder="Full Name" className={inputClass}
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Email / Personal Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email" required placeholder="Email Address" className={inputClass}
                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject of Inquiry</label>
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <input
                    type="text" required placeholder="Ex: Admission Help" className={inputClass}
                    value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Message</label>
               <textarea
                 rows="5" required placeholder="Type your message here..."
                 className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#0d2d57] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all uppercase resize-none"
                 value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
               />
            </div>
            <button
              type="submit"
              className="w-full h-16 flex items-center justify-center gap-3 bg-[#0d2d57] hover:bg-blue-900 text-white text-xs font-black rounded-2xl transition-all shadow-xl shadow-blue-900/20 uppercase tracking-widest"
            >
              <Send className="w-5 h-5" />
              Submit Inquiry
            </button>
          </form>
        </div>

        {/* Contact Statistics/Information */}
        <div className="lg:col-span-2 space-y-4">
          {contactInfo.map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-blue-200 transition-all">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#0d2d57] group-hover:text-white transition-colors">
                {item.icon}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                <p className="text-sm font-black text-[#0d2d57] truncate">{item.value}</p>
              </div>
            </div>
          ))}

          <div className="bg-[#0d2d57] p-10 rounded-[2.5rem] text-white mt-10 shadow-2xl shadow-blue-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <h3 className="text-lg font-black uppercase mb-4 tracking-tight">Visit Freetown Campus</h3>
            <p className="text-sm text-blue-200 leading-relaxed font-bold italic">
              "The University of Sierra Leone welcomes all prospective students to our historic campuses at Tower Hill, Mount Aureol, and beyond."
            </p>
            <div className="mt-8 flex items-center gap-4">
               <div className="w-12 h-px bg-blue-400" />
               <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Oldest in West Africa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
