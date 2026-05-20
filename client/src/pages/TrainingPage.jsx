import { Link } from "react-router-dom";
import { 
  Code, Brain, Shield, Briefcase, CheckCircle2, ArrowRight, 
  Compass, Award, GraduationCap, Zap, Globe, MessageSquare, Building2 
} from "lucide-react";

function TrainingPage() {
  const roadmaps = [
    {
      icon: <Code className="w-8 h-8" />,
      color: "from-[#0d2d57] to-blue-600",
      title: "Software Engineering",
      desc: "Designed for the African tech ecosystem. Master the full lifecycle of software development.",
      duration: "6 Months",
      courses: 12,
      points: ["Algorithms & Data Structures", "Mobile App Development", "Scalable Backend Systems", "Cloud Computing for Devs", "Final Capstone Project"]
    },
    {
      icon: <Brain className="w-8 h-8" />,
      color: "from-blue-700 to-indigo-800",
      title: "Data Analytics",
      desc: "Powering decision-making in public and private sectors using data-driven insights.",
      duration: "4 Months",
      courses: 8,
      points: ["SQL & Data Querying", "Statistical Analysis", "Tableau & PowerBI", "Big Data Fundamentals", "Business Intelligence"]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      color: "from-[#0d2d57] to-slate-800",
      title: "Information Security",
      desc: "Protecting national and corporate digital assets from evolving cyber threats.",
      duration: "5 Months",
      courses: 10,
      points: ["Network Security", "Cryptography", "Risk Management", "Ethical Hacking", "Governance & Compliance"]
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      color: "from-blue-900 to-[#0d2d57]",
      title: "Public Administration",
      desc: "Modernizing governance and public service delivery through digital leadership.",
      duration: "6 Months",
      courses: 7,
      points: ["Policy Analysis", "E-Governance", "Strategic Management", "Public Finance", "Ethics in Leadership"]
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Header with Background Pattern */}
      <section className="relative text-center pt-20 pb-24 -mx-4 sm:-mx-6 lg:-mx-8 px-6 bg-[#0d2d57] text-white">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-black mb-6 uppercase tracking-widest">
            <Compass className="w-4 h-4" />
            Strategic Specializations
          </div>
          <h1 className="text-4xl sm:text-6xl font-black leading-tight mb-8 uppercase tracking-tight">
            Academic <span className="text-blue-400">Roadmaps</span>
          </h1>
          <p className="text-lg text-blue-100 leading-relaxed mb-12 max-w-2xl mx-auto font-medium">
            Join a structured academic path designed by the University of Sierra Leone to bridge the skills gap and drive national development.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
             <div className="bg-white/5 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/10 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-black uppercase tracking-widest">TEC Accredited</span>
             </div>
             <div className="bg-white/5 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/10 flex items-center gap-3">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-black uppercase tracking-widest">Campus Validated</span>
             </div>
          </div>
        </div>
      </section>

      {/* APEL Section - Official Institutional Content */}
      <section className="container mx-auto px-6">
         <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col lg:flex-row items-stretch">
            <div className="lg:w-1/2 p-12 lg:p-20 space-y-10">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                     <GraduationCap className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-black text-[#0d2d57] uppercase tracking-tight leading-none">Experience <br />into Credits</h2>
               </div>
               <p className="text-slate-500 leading-relaxed text-lg font-medium italic">
                  "The University of Sierra Leone recognizes the value of professional experience. Our APEL program allows you to fast-track your degree based on your years in the workforce."
               </p>
               <div className="space-y-4">
                  {[
                    "Accreditation of Prior Experiential Learning (APEL)",
                    "Partial exemptions for MBA and Master tracks",
                    "Official certification of professional years",
                    "Reduced tuition burden for verified experts"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3">
                       <CheckCircle2 className="w-4 h-4 text-blue-600" />
                       <span className="text-[#0d2d57] font-black text-[10px] uppercase tracking-widest">{text}</span>
                    </div>
                  ))}
               </div>
               <button className="px-10 py-5 bg-[#0d2d57] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-900 transition-all hover:scale-105 active:scale-95">
                  Check APEL Eligibility
               </button>
            </div>
            <div className="lg:w-1/2 bg-[#0d2d57] relative p-12 flex items-center justify-center">
               <div className="absolute inset-0 bg-blue-900 opacity-50" />
               <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-md">
                  <div className="p-8 bg-white rounded-[2rem] shadow-2xl transform hover:-rotate-1 transition-transform">
                     <p className="text-4xl font-black text-[#0d2d57]">1827</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Established Legacy</p>
                  </div>
                  <div className="p-8 bg-blue-600 rounded-[2rem] shadow-2xl text-white transform hover:rotate-1 transition-transform">
                     <p className="text-4xl font-black">100%</p>
                     <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mt-2">Official Recognition</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Roadmap Cards */}
      <section className="container mx-auto px-6">
        <div className="text-center mb-16">
           <h2 className="text-3xl font-black text-[#0d2d57] mb-3 uppercase">Academic Pathways</h2>
           <p className="text-slate-500 font-medium">Curated journeys through the University of Sierra Leone's faculty programs.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {roadmaps.map((item, i) => (
            <div key={i} className="group bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col">
              {/* Image + Overlay */}
              <div className="relative h-72 overflow-hidden">
                 <img src={`https://picsum.photos/seed/${i+88}/800/600`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={item.title} />
                 <div className={`absolute inset-0 bg-gradient-to-t ${item.color} opacity-90 group-hover:opacity-80 transition-opacity`} />
                 <div className="absolute inset-x-0 bottom-0 p-10 text-white">
                    <div className="flex items-center gap-5">
                       <div className="w-16 h-16 bg-white/20 rounded-[1.5rem] backdrop-blur-md border border-white/20 flex items-center justify-center">
                          {item.icon}
                       </div>
                       <div>
                          <h3 className="text-2xl font-black uppercase tracking-tight leading-tight">{item.title}</h3>
                          <p className="text-blue-200 text-xs font-black uppercase tracking-[0.2em]">{item.duration} Specialization</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Content Area */}
              <div className="p-10 flex-grow flex flex-col">
                <p className="text-slate-500 font-medium leading-relaxed mb-10 flex-grow italic">"{item.desc}"</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                  {item.points.map((point, j) => (
                    <div key={j} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{point}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/course-catalog"
                  className="w-full h-16 flex items-center justify-center gap-3 bg-[#0d2d57] text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all hover:bg-blue-900 shadow-2xl shadow-blue-900/10"
                >
                  View Pathway <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Support CTA */}
      <section className="container mx-auto px-6 py-12 text-center max-w-4xl">
         <div className="space-y-8">
            <h2 className="text-4xl font-black text-[#0d2d57] uppercase tracking-tight">University Career Guidance</h2>
            <p className="text-slate-500 text-lg leading-relaxed font-medium">
               The USL Career Services department is here to help you choose the right path for your professional goals. Speak with our student advisors today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
               <Link to="/contact" className="px-12 py-5 bg-[#0d2d57] text-white rounded-full font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform">Consult Advisor</Link>
               <div className="flex items-center gap-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                     <MessageSquare className="w-5 h-5" />
                  </div>
                  <span>Support Center Open</span>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}

export default TrainingPage;
