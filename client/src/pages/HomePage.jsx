import { Link } from "react-router-dom";
import { 
  BookOpen, UserPlus, ArrowRight, ShieldCheck, Globe, Zap, 
  GraduationCap, Award, CheckCircle2, Star, Users, Briefcase, 
  Search, Play, MessageSquare, PlusCircle, HelpCircle, Layout
} from "lucide-react";
import { useState } from "react";

function HomePage() {
  const [activeTab, setActiveTab] = useState('academic');

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section - UniPam */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 lg:pt-24 border-b border-slate-50">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/50 border border-blue-200 text-blue-700 text-sm font-bold mb-8 animate-fade-in-down">
              <Zap className="w-4 h-4" />
              <span>Excellence in Digital Education</span>
            </div>
            <h1 className="text-4xl sm:text-7xl font-[900] text-[#0d2d57] leading-[1.1] tracking-tighter mb-6">
              UniPam <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-900 uppercase">
                eCampus
              </span>
            </h1>
            <p className="max-w-xl text-lg text-slate-600 leading-relaxed mb-10 font-medium">
              Join the official University Of Sierra Leone eCampus. Access accredited Degree programs, Professional Diplomas, and Free Certificate courses designed for the modern professional.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link 
                to="/course-catalog" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#0d2d57] hover:bg-blue-900 text-white rounded-2xl font-bold shadow-xl shadow-blue-900/20 transition-all hover:-translate-y-1"
              >
                Explore Courses <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/about" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-[#0d2d57] border-2 border-slate-100 rounded-2xl font-bold shadow-sm transition-all"
              >
                About UniPam
              </Link>
            </div>
          </div>
          
          <div className="relative hidden lg:block">
             <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                   <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 -rotate-3 hover:rotate-0 transition-transform duration-500">
                      <div className="bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                         <GraduationCap className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="font-bold text-[#0d2d57] text-sm leading-tight">TEC Accredited</p>
                      <p className="text-xs text-slate-400 mt-1">Tertiary Education Commission</p>
                   </div>
                   <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 rotate-2 hover:rotate-0 transition-transform duration-500">
                      <div className="bg-amber-50 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                         <Star className="w-6 h-6 text-amber-500" />
                      </div>
                      <p className="font-bold text-[#0d2d57] text-sm leading-tight">National Leader</p>
                      <p className="text-xs text-slate-400 mt-1">Top-ranked in Sierra Leone</p>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 rotate-6 hover:rotate-0 transition-transform duration-500">
                      <div className="bg-emerald-50 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                         <Briefcase className="w-6 h-6 text-emerald-600" />
                      </div>
                      <p className="font-bold text-[#0d2d57] text-sm leading-tight">Digital Skills</p>
                      <p className="text-xs text-slate-400 mt-1">Job-ready Curriculum</p>
                   </div>
                   <div className="bg-[#0d2d57] p-4 rounded-3xl shadow-xl border border-blue-900 -rotate-2 text-white hover:rotate-0 transition-transform duration-500">
                      <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                         <Award className="w-6 h-6 text-white" />
                      </div>
                      <p className="font-bold text-sm leading-tight text-white">USL Certification</p>
                      <p className="text-xs text-blue-200 mt-1">Recognized Worldwide</p>
                   </div>
                </div>
             </div>
             {/* Decorative circles */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-slate-100 rounded-full -z-10" />
          </div>
        </div>

        {/* Background blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-3xl -z-20" />
      </section>

      {/* Trust Section - Partners */}
      <section className="bg-white py-10 border-y border-slate-50">
        <div className="container mx-auto px-6 text-center">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">Trusted Partners & Affiliations</p>
           <div className="flex flex-wrap items-center justify-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <span className="font-black text-slate-400 text-xl tracking-tighter italic">Fourah Bay College</span>
              <span className="font-black text-slate-400 text-xl tracking-tighter italic">IPAM</span>
              <span className="font-black text-slate-400 text-xl tracking-tighter italic">COMAHS</span>
              <span className="font-black text-slate-400 text-xl tracking-tighter italic">TEC Sierra Leone</span>
           </div>
        </div>
      </section>

      {/* Academic Faculties */}
      <section className="container mx-auto px-6">
         <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
            <div>
               <h2 className="text-3xl font-[900] text-[#0d2d57] mb-3 uppercase tracking-tight">Our Academic Faculties</h2>
               <p className="text-slate-500 max-w-xl font-medium">Accredited constituent colleges of the University of Sierra Leone.</p>
            </div>
            <Link to="/course-catalog" className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest border-b-2 border-blue-600/10 hover:border-blue-600 transition-all pb-1">
               View Full Catalog <ArrowRight className="w-4 h-4" />
            </Link>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
               { 
                  name: "IPAM - USL", 
                  desc: "Institute of Public Administration and Management. Leading in Management, Accounting, and Information Systems.",
                  color: "bg-blue-50 text-blue-600",
                  icon: <GraduationCap className="w-6 h-6" />
               },
               { 
                  name: "Fourah Bay College", 
                  desc: "The 'Athens of West Africa'. Excellence in Engineering, Social Sciences, Law, and Pure Sciences.",
                  color: "bg-emerald-50 text-emerald-600",
                  icon: <BookOpen className="w-6 h-6" />
               },
               { 
                  name: "COMAHS", 
                  desc: "College of Medicine and Allied Health Sciences. Training the next generation of healthcare leaders.",
                  color: "bg-indigo-50 text-indigo-600",
                  icon: <ShieldCheck className="w-6 h-6" />
               }
            ].map((faculty, i) => (
               <div key={i} className="group p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className={`w-14 h-14 ${faculty.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                     {faculty.icon}
                  </div>
                  <h3 className="text-xl font-black text-[#0d2d57] mb-3 uppercase tracking-tight">{faculty.name}</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">{faculty.desc}</p>
                  <Link to="/course-catalog" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0d2d57] group-hover:text-blue-600 transition-colors">
                     View Programs <PlusCircle className="w-4 h-4" />
                  </Link>
               </div>
            ))}
         </div>
      </section>

      {/* Why USL Digital? */}
      <section className="bg-slate-50 py-24 border-y border-slate-100">
        <div className="container mx-auto px-6">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-[900] text-[#0d2d57] mb-3 uppercase tracking-tight">Why Choose UniPam?</h2>
              <p className="text-slate-500 max-w-xl mx-auto font-medium">University Of Sierra Leone eCampus.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: <ShieldCheck className="w-8 h-8 text-blue-600" />, 
                  title: "Official Accreditation", 
                  desc: "All degrees and certificates are issued directly by the University of Sierra Leone and recognized by the Tertiary Education Commission (TEC)." 
                },
                { 
                  icon: <Briefcase className="w-8 h-8 text-blue-600" />, 
                  title: "Career Ready", 
                  desc: "Our curriculum is developed in partnership with Sierra Leonean industry leaders to ensure graduates are ready for the local and global market." 
                },
                { 
                  icon: <Layout className="w-8 h-8 text-blue-600" />, 
                  title: "Digital Flexibility", 
                  desc: "Learn from anywhere in Sierra Leone or abroad. Our UniPam platform works on low bandwidth and provides offline learning resources." 
                }
              ].map((item, i) => (
                <div key={i} className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                      {item.icon}
                   </div>
                   <h3 className="text-xl font-black text-[#0d2d57] mb-4 uppercase tracking-tight">{item.title}</h3>
                   <p className="text-slate-500 leading-relaxed text-sm font-medium">{item.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-6 pb-24">
         <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-12 lg:p-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
               <div>
                  <h2 className="text-3xl font-[900] text-[#0d2d57] mb-6 uppercase tracking-tight">Student Support FAQ</h2>
                  <p className="text-slate-500 mb-10 font-medium">Need help with the UniPam portal? Here are the most common questions from our students.</p>
                  <Link to="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-slate-50 text-[#0d2d57] rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                     <HelpCircle className="w-5 h-5 text-blue-600" /> Contact Support
                  </Link>
               </div>
               <div className="space-y-6">
                  {[
                     { q: "How do I access my LMS account?", a: "Once your application is approved, use your Student ID and the password sent to your registered email to login to the LMS Dashboard." },
                     { q: "Are the courses TEC accredited?", a: "Yes, all programs offered through UniPam are officially accredited by the Tertiary Education Commission of Sierra Leone." },
                     { q: "How can I verify my certificate?", a: "Every certificate issued has a unique verification ID that can be checked through our public verification portal in the Certificate Wallet." }
                  ].map((faq, i) => (
                     <div key={i} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-50">
                        <h4 className="font-black text-[#0d2d57] text-sm uppercase tracking-tight mb-2 flex items-start gap-3">
                           <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">Q</span>
                           {faq.q}
                        </h4>
                        <p className="text-slate-500 text-xs font-medium leading-relaxed pl-8">{faq.a}</p>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Networking Globally */}
      <section className="bg-[#0d2d57] rounded-[50px] mx-6 py-20 px-10 text-center relative overflow-hidden">
         <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl font-[900] text-white mb-6 uppercase tracking-tight">Official UniPam Portal</h2>
            <p className="text-blue-100 text-lg mb-10 leading-relaxed font-medium">Join thousands of students at the University of Sierra Leone's digital initiative. Secure your future with recognized degrees from West Africa's oldest university.</p>
            <Link 
                to="/user-register" 
                className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-[#0d2d57] rounded-full font-black uppercase tracking-widest shadow-2xl hover:bg-slate-50 transition-all hover:scale-105"
              >
                Start Your Application
            </Link>
         </div>
      </section>

    </div>
  );
}

export default HomePage;
