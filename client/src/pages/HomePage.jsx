import { Link } from "react-router-dom";
import {
  BookOpen, UserPlus, ArrowRight, ShieldCheck, Globe, Zap,
  GraduationCap, Award, CheckCircle2, Star, Users, Briefcase,
  Search, Play, MessageSquare, PlusCircle, HelpCircle, Layout,
  Calculator, Cpu, Scale, BookMarked, Clock, ChevronDown
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import InfoCard from "../components/InfoCard";
import { universityService } from "../services/universityService";

function HomePage() {
  const [activeTab, setActiveTab] = useState('academic');
  const [faculties, setFaculties] = useState([]);

  useEffect(() => {
    let alive = true;
    universityService.getIpamFaculties()
      .then((facs) => {
        if (alive && facs && facs.length > 0) setFaculties(facs);
      })
      .catch(() => {
        // Fallback works automatically
      });
    return () => { alive = false; };
  }, []);

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section - UniPam */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 lg:pt-24 border-b border-slate-50">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100/50 border border-brand-200 text-brand-700 text-sm font-bold mb-8 animate-fade-in-down">
              <Zap className="w-4 h-4" />
              <span>Excellence in Digital Education</span>
            </div>
            <h1 className="text-4xl sm:text-7xl font-[900] text-[#0B5E3C] leading-[1.1] tracking-tighter mb-6">
              UniPam <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-900 uppercase">
                eLearning
              </span>
            </h1>
            <p className="max-w-xl text-lg text-slate-600 leading-relaxed mb-10 font-medium">
              Join the official University of Sierra Leone eLearning platform. Access accredited Degree programs, Professional Diplomas, and Free Certificate courses designed for the modern professional.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link 
                to="/register" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#0B5E3C] hover:bg-emerald-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#0B5E3C]/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Start Learning <ArrowRight className="w-4 h-4 text-amber-400" />
              </Link>
              <Link 
                to="/app/repository" 
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-emerald-50/50 text-[#0B5E3C] border-2 border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm transition-all"
              >
                Explore Repository
              </Link>
            </div>
          </div>
          
          <div className="relative hidden lg:block">
             <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                   <InfoCard icon={GraduationCap} title="TEC Accredited" subtitle="Tertiary Education Commission" tone="brand" rotate="-rotate-3" />
                   <InfoCard icon={Star} title="National Leader" subtitle="Top-ranked in Sierra Leone" tone="gold" rotate="rotate-2" />
                </div>
                <div className="space-y-4">
                   <InfoCard icon={Briefcase} title="Digital Skills" subtitle="Job-ready Curriculum" tone="brand" rotate="rotate-6" />
                   <InfoCard icon={Award} title="USL Certification" subtitle="Recognized Worldwide" dark rotate="-rotate-2" />
                </div>
             </div>
             {/* Decorative circles */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-slate-100 rounded-full -z-10" />
          </div>
        </div>

        {/* Background blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-brand-100/20 rounded-full blur-3xl -z-20" />
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
      <section id="faculties-section" className="container mx-auto px-6 scroll-mt-24">
         <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-8">
            <div>
               <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black uppercase tracking-widest mb-3">
                 <GraduationCap className="w-3.5 h-3.5" /> 5 Specialized Academic Units
               </div>
               <h2 className="inline-block gold-underline text-3xl sm:text-4xl font-[900] text-[#0B5E3C] uppercase tracking-tight">IPAM Faculties</h2>
               <p className="text-slate-600 max-w-2xl font-medium mt-2 text-sm">
                 Institute of Public Administration and Management — University of Sierra Leone.
                 Browse programmes across all faculties.
               </p>
            </div>
            <Link to="/ipam" className="flex items-center gap-2 text-[#0B5E3C] font-black text-xs uppercase tracking-widest hover:text-emerald-700 transition-colors group">
               View Full Directory (39 Programmes) <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
         </div>

         {/* 5 Faculty Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {[
               {
                  name: "Accounting & Finance",
                  desc: "Accounting, Auditing, Financial Economics, Banking, Financial Services & Taxation.",
                  icon: <Calculator className="w-6 h-6" />,
                  slug: "accounting-finance",
                  id: "f1",
                  iconBg: "bg-emerald-50 text-emerald-700",
                  borderAccent: "border-t-4 border-t-emerald-500",
                  badge: "8 Programmes"
               },
               {
                  name: "Information Systems & Technology",
                  desc: "Computing, Information Systems, Software Development, Networks, Cybersecurity & Analytics.",
                  icon: <Cpu className="w-6 h-6" />,
                  slug: "info-systems-tech",
                  id: "f2",
                  iconBg: "bg-blue-50 text-blue-700",
                  borderAccent: "border-t-4 border-t-blue-500",
                  badge: "3 Programmes"
               },
               {
                  name: "Business Administration & Entrepreneurship",
                  desc: "Management, Innovation, HR, Procurement, Supply Chain, Logistics, Marketing & Projects.",
                  icon: <Briefcase className="w-6 h-6" />,
                  slug: "business-admin-entrepreneurship",
                  id: "f3",
                  iconBg: "bg-amber-50 text-amber-700",
                  borderAccent: "border-t-4 border-t-amber-400",
                  badge: "13 Programmes"
               },
               {
                  name: "Leadership & Governance",
                  desc: "Public Sector Leadership, Public Policy, Public Administration, Development & Governance.",
                  icon: <Scale className="w-6 h-6" />,
                  slug: "leadership-governance",
                  id: "f4",
                  iconBg: "bg-[#F5F2EB] text-[#5C4F3D]",
                  borderAccent: "border-t-4 border-t-[#85754E]",
                  badge: "7 Programmes"
               },
               {
                  name: "Extra-Mural Studies",
                  desc: "Professional diplomas & certificate courses taking university education to local communities.",
                  icon: <BookMarked className="w-6 h-6" />,
                  slug: "extra-mural-studies",
                  id: "f5",
                  iconBg: "bg-rose-50 text-rose-700",
                  borderAccent: "border-t-4 border-t-rose-500",
                  badge: "8 Programmes"
               }
            ].map((faculty, i) => (
               <Link
                  key={i}
                  to={`/ipam/${faculty.slug}`}
                  className={`group text-left flex flex-col p-6 bg-white border border-slate-200 ${faculty.borderAccent} rounded-3xl hover:border-emerald-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative`}
               >
                  <div className="flex items-center justify-between mb-4">
                     <div className={`w-12 h-12 ${faculty.iconBg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        {faculty.icon}
                     </div>
                     <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-[#0B5E3C] group-hover:text-white transition-colors">
                        {faculty.badge}
                     </span>
                  </div>
                  <h3 className="text-sm font-black text-[#0B5E3C] mb-2 uppercase tracking-tight leading-tight line-clamp-2">
                     {faculty.name}
                  </h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed flex-grow line-clamp-3">
                     {faculty.desc}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between w-full">
                     <span className="text-[10px] font-bold text-slate-400">
                        View Portal
                     </span>
                     <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#0B5E3C] group-hover:translate-x-1 transition-transform">
                        Explore <ArrowRight className="w-3 h-3" />
                     </span>
                  </div>
               </Link>
            ))}
         </div>
      </section>


      {/* Why USL Digital? */}
      <section className="bg-slate-50 py-24 border-y border-slate-100">
        <div className="container mx-auto px-6">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-[900] text-[#0B5E3C] mb-3 uppercase tracking-tight">Why Choose UniPam?</h2>
              <p className="text-slate-600 max-w-xl mx-auto font-medium">University of Sierra Leone eLearning.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />, 
                  title: "Official Accreditation", 
                  desc: "All degrees and certificates are issued directly by the University of Sierra Leone and recognized by the Tertiary Education Commission (TEC)." 
                },
                { 
                  icon: <Briefcase className="w-8 h-8 text-emerald-600" />, 
                  title: "Career Ready", 
                  desc: "Our curriculum is developed in partnership with Sierra Leonean industry leaders to ensure graduates are ready for the local and global market." 
                },
                { 
                  icon: <Layout className="w-8 h-8 text-emerald-600" />, 
                  title: "Digital Flexibility", 
                  desc: "Learn from anywhere in Sierra Leone or abroad. Our UniPam platform works on low bandwidth and provides offline learning resources." 
                }
              ].map((item, i) => (
                <div key={i} className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
                   <div className="w-16 h-16 bg-emerald-50 text-[#0B5E3C] rounded-2xl flex items-center justify-center mb-6">
                      {item.icon}
                   </div>
                   <h3 className="text-xl font-black text-[#0B5E3C] mb-4 uppercase tracking-tight">{item.title}</h3>
                   <p className="text-slate-600 leading-relaxed text-sm font-medium">{item.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-6 pb-24">
         <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm p-12 lg:p-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
               <div>
                  <h2 className="text-3xl font-[900] text-[#0B5E3C] mb-6 uppercase tracking-tight">Student Support FAQ</h2>
                  <p className="text-slate-600 mb-10 font-medium">Need help with the UniPam portal? Here are the most common questions from our students.</p>
                  <Link to="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-50 text-[#0B5E3C] rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-100 transition-all">
                     <HelpCircle className="w-5 h-5 text-[#0B5E3C]" /> Contact Support
                  </Link>
               </div>
               <div className="space-y-6">
                  {[
                     { q: "How do I access my LMS account?", a: "Once your application is approved, use your Student ID and the password sent to your registered email to login to the LMS Dashboard." },
                     { q: "Are the courses TEC accredited?", a: "Yes, all programs offered through UniPam are officially accredited by the Tertiary Education Commission of Sierra Leone." },
                     { q: "How can I verify my certificate?", a: "Every certificate issued has a unique verification ID that can be checked through our public verification portal in the Certificate Wallet." }
                  ].map((faq, i) => (
                     <div key={i} className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200">
                        <h4 className="font-black text-[#0B5E3C] text-sm uppercase tracking-tight mb-2 flex items-start gap-3">
                           <span className="w-5 h-5 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 font-bold">Q</span>
                           {faq.q}
                        </h4>
                        <p className="text-slate-600 text-xs font-medium leading-relaxed pl-8">{faq.a}</p>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Networking Globally */}
      <section className="bg-[#0B5E3C] rounded-[50px] mx-6 py-20 px-10 text-center relative overflow-hidden">
         <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl font-[900] text-white mb-6 uppercase tracking-tight">Official UniPam Portal</h2>
            <p className="text-brand-100 text-lg mb-10 leading-relaxed font-medium">Join thousands of students at the University of Sierra Leone's digital initiative. Secure your future with recognized degrees from West Africa's oldest university.</p>
            <Link 
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-[#0B5E3C] rounded-full font-black uppercase tracking-widest shadow-2xl hover:bg-slate-50 transition-all hover:scale-105"
              >
                Start Learning
            </Link>
         </div>
      </section>

    </div>
  );
}

export default HomePage;
