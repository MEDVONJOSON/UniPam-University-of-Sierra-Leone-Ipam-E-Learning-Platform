import { useState } from "react";
import { Mail, User, MessageSquare, Send, CheckCircle2, MapPin, Phone, Clock, GraduationCap } from "lucide-react";

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function onSubmit(event) {
    event.preventDefault();
    const body = [
      `Full Name: ${form.name}`,
      `Email Address: ${form.email}`,
      "",
      form.message
    ].join("\\n");
    const mailtoUrl = `mailto:registrar@usl.edu.sl?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  }

  const inputClass = "block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B5E3C]/20 focus:border-[#0B5E3C] transition-all";

  const contactInfo = [
    { icon: <Mail className="w-5 h-5 text-emerald-600" />, label: "Official Email", value: "registrar@usl.edu.sl", href: "mailto:registrar@usl.edu.sl" },
    { icon: <Phone className="w-5 h-5 text-emerald-600" />, label: "Registry Office", value: "+23279688260 / +23272659157" },
    { icon: <MapPin className="w-5 h-5 text-emerald-600" />, label: "Main Campus", value: "Tower Hill, Freetown, SL" },
    { icon: <Clock className="w-5 h-5 text-emerald-600" />, label: "Registry Hours", value: "Mon – Fri, 8:30am – 4:30pm" }
  ];

  if (submitted) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-200 max-w-md w-full animate-in fade-in zoom-in-95">
          <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-emerald-50 text-[#0B5E3C] mb-8 border-4 border-white shadow-xl">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-[900] text-[#0B5E3C] mb-4 uppercase tracking-tight">Submission Successful</h2>
          <p className="text-slate-600 leading-relaxed mb-8 font-medium">
            Your inquiry has been received by the University of Sierra Leone Registry. A representative will contact you shortly.
          </p>
          <button
            onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
            className="w-full py-4 bg-[#0B5E3C] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-xl"
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
         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-[#0B5E3C] text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-200">
            <GraduationCap className="w-4 h-4 text-amber-500" />
            IPAM Platform Support
         </div>
         <h1 className="text-4xl md:text-5xl font-[900] text-[#0B5E3C] mb-4 uppercase tracking-tight">IPAM-USL Support</h1>
         <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed">
           Connect with the IPAM-USL platform team for technical support or academic communication assistance.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-6xl mx-auto px-6">
        {/* Contact Form Area */}
        <div className="lg:col-span-3 bg-white p-10 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-brand-600" />
          <h2 className="text-2xl font-black text-[#0B5E3C] mb-8 uppercase tracking-tight">Inquiry Form</h2>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-hover-500 uppercase tracking-widest ml-1">Full Name</label>
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
                <label className="text-[10px] font-black text-hover-500 uppercase tracking-widest ml-1">Student Email / Personal Email</label>
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
               <label className="text-[10px] font-black text-hover-500 uppercase tracking-widest ml-1">Subject of Inquiry</label>
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
               <label className="text-[10px] font-black text-hover-500 uppercase tracking-widest ml-1">Detailed Message</label>
               <textarea
                 rows="5" required placeholder="Type your message here..."
                 className="block w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-[#0B5E3C] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all uppercase resize-none"
                 value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
               />
            </div>
            <button
              type="submit"
              className="w-full h-16 flex items-center justify-center gap-3 bg-[#0B5E3C] hover:bg-hover-700 text-white text-xs font-black rounded-2xl transition-all shadow-xl shadow-brand-900/20 uppercase tracking-widest"
            >
              <Send className="w-5 h-5" />
              Submit Inquiry
            </button>
          </form>
        </div>

        {/* Contact Statistics/Information */}
        <div className="lg:col-span-2 space-y-4">
          {contactInfo.map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-hover-200 transition-all">
              <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-hover-700 group-hover:text-white transition-colors">
                {item.icon}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-hover-500 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="text-sm font-black text-[#0B5E3C] truncate hover:underline">
                    {item.value}
                  </a>
                ) : (
                  <p className="text-sm font-black text-[#0B5E3C] truncate">{item.value}</p>
                )}
              </div>
            </div>
          ))}

          <div className="bg-[#0B5E3C] p-10 rounded-[2.5rem] text-white mt-10 shadow-2xl shadow-brand-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <h3 className="text-lg font-black uppercase mb-4 tracking-tight">Your Learning, One Platform</h3>
            <p className="text-sm text-brand-200 leading-relaxed font-bold italic">
              "Access your course materials, connect with your lecturers, and manage your learning — all in one secure place, built for IPAM-USL."
            </p>
            <div className="mt-8 flex items-center gap-4">
               <div className="w-12 h-px bg-brand-400" />
               <span className="text-[10px] font-black uppercase tracking-widest text-brand-400">UniPam</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
