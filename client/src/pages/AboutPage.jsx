import { Globe, Target, Rocket, Users, ShieldCheck, BookOpen, Lightbulb, ArrowRight, Award, CheckCircle2, MapPin, Building2, Landmark, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

function AboutPage() {
  const values = [
    { icon: <Globe className="w-7 h-7 text-blue-600" />, title: "Digital Inclusion", desc: "Expanding access to world-class higher education for every Sierra Leonean, regardless of their location." },
    { icon: <ShieldCheck className="w-7 h-7 text-blue-600" />, title: "Academic Integrity", desc: "Upholding the same rigorous standards in our digital campus as in our physical classrooms at Fourah Bay College and IPAM." },
    { icon: <Users className="w-7 h-7 text-blue-600" />, title: "Institutional Synergy", desc: "Unifying USL's diverse faculties under a single, seamless digital learning ecosystem powered by UniPam." },
    { icon: <Lightbulb className="w-7 h-7 text-blue-600" />, title: "Future Ready", desc: "Equipping graduates with the digital literacy and specialized skills required for Sierra Leone's growing economy." }
  ];

  const milestones = [
    { phase: "Traditional Foundation", title: "Legacy of Excellence", desc: "Rooted in the rich history of Fourah Bay College, the oldest university in West Africa.", icon: <Landmark className="w-6 h-6" /> },
    { phase: "Digital Expansion", title: "UniPam", desc: "Launching the official portal to provide flexible, self-paced learning to students nationwide.", icon: <Rocket className="w-6 h-6" /> },
    { phase: "Future Focus", title: "National Innovation Hub", desc: "Integrating AI and advanced vocational training to drive Sierra Leone's 2030 development goals.", icon: <GraduationCap className="w-6 h-6" /> }
  ];

  const constituentColleges = [
    { name: "Fourah Bay College (FBC)", role: "Humanities & Sciences", since: "1827", icon: <Building2 className="w-8 h-8" /> },
    { name: "IPAM", role: "Management & Technology", since: "1980", icon: <Building2 className="w-8 h-8" /> },
    { name: "COMAHS", role: "Medicine & Health Sciences", since: "1988", icon: <Building2 className="w-8 h-8" /> }
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Section - Official USL Digital Branded */}
      <section className="relative text-center pt-20 pb-24 -mx-4 sm:-mx-6 lg:-mx-8 px-8 bg-slate-50 border-b border-slate-100 overflow-hidden">
         <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
         <div className="max-w-4xl mx-auto space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/50 border border-blue-200 text-blue-700 text-[10px] font-black mb-4 uppercase tracking-[0.2em]">
              <GraduationCap className="w-4 h-4" />
              Official Digital Portal
            </div>
            <h1 className="text-4xl sm:text-6xl font-[900] text-[#0d2d57] leading-tight uppercase tracking-tight">
              UniPam
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-500 leading-relaxed font-medium">
              Bridging the gap between our historic academic legacy and the future of digital education. UniPam is the official University Of Sierra Leone eCampus initiative designed for global excellence and local impact.
            </p>
         </div>
      </section>

      {/* Legacy & Future - Dual Card Layout */}
      <section className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-[#0d2d57] p-12 rounded-[40px] text-white relative overflow-hidden group shadow-xl">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 transition-transform group-hover:scale-150 duration-700" />
           <Target className="w-12 h-12 text-blue-400 mb-6" />
           <h2 className="text-3xl font-black mb-4 uppercase">Our Vision</h2>
           <p className="text-blue-100 leading-relaxed text-lg font-medium">
             To be the premier digital university hub in West Africa, transforming lives through accessible, high-quality, and innovative distance learning solutions that meet the evolving needs of the 21st century.
           </p>
        </div>
        <div className="bg-white border border-slate-100 p-12 rounded-[40px] shadow-sm relative overflow-hidden group">
           <Rocket className="w-12 h-12 text-blue-600 mb-6" />
           <h2 className="text-3xl font-black text-[#0d2d57] mb-4 uppercase">Our Mission</h2>
           <p className="text-slate-500 leading-relaxed text-lg italic font-medium">
             "To provide flexible and equitable access to top-tier university education, professional training, and research-led digital learning for all citizens of Sierra Leone and the global community."
           </p>
        </div>
      </section>

      {/* Constituent Colleges - Cleaned Partners Section */}
      <section className="bg-slate-50 py-24 border-y border-slate-100">
         <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-black text-[#0d2d57] mb-12 uppercase">Our Constituent Colleges</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {constituentColleges.map((college, i) => (
                  <div key={i} className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                     <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        {college.icon}
                     </div>
                     <h3 className="text-xl font-black text-[#0d2d57] mb-2 uppercase">{college.name}</h3>
                     <p className="text-blue-600 text-xs font-black uppercase tracking-widest mb-4">{college.role}</p>
                     <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Established in {college.since}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Core Values */}
      <section className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-[#0d2d57] mb-3 uppercase">Digital Values</h2>
          <p className="text-slate-500 font-medium">The principles governing our virtual campus environment.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, i) => (
            <div key={i} className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
              <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-slate-50 mb-6 group-hover:bg-[#0d2d57] group-hover:text-white transition-all transform group-hover:rotate-6">
                {v.icon}
              </div>
              <h3 className="text-lg font-black text-[#0d2d57] mb-4 group-hover:text-blue-600 transition-colors uppercase leading-tight">{v.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Institutional Roadmap */}
      <section className="container mx-auto px-6 bg-white rounded-[40px] border border-slate-100 p-12 lg:p-20 shadow-sm overflow-hidden relative">
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-3xl font-black text-[#0d2d57] mb-3 uppercase">Strategic Roadmap</h2>
          <p className="text-slate-500 font-medium">Phasing our digital transformation for national impact.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
           {milestones.map((m, i) => (
             <div key={i} className="relative group">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-slate-50 hidden md:block" />
                <div className="space-y-6">
                   <div className="w-12 h-12 rounded-2xl bg-[#0d2d57] text-white flex items-center justify-center font-black group-hover:bg-blue-600 transition-colors shadow-lg">
                      {m.icon}
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">{m.phase}</p>
                      <h3 className="text-xl font-black text-[#0d2d57] mb-4 uppercase">{m.title}</h3>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed italic">"{m.desc}"</p>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-6 py-12 text-center">
         <div className="bg-[#0d2d57] p-16 rounded-[50px] text-white relative overflow-hidden">
            <h2 className="text-4xl font-black mb-6 uppercase tracking-tight">Become a UniPam Student</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto font-medium">Join thousands of professionals earning recognized degrees and certificates from UniPam.</p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
               <Link to="/user-register" className="px-10 py-5 bg-blue-600 text-white rounded-full font-black uppercase tracking-widest shadow-2xl hover:bg-blue-500 transition-all hover:scale-105 active:scale-95">Apply Online Now</Link>
               <Link to="/contact" className="px-10 py-5 border border-white/20 text-white rounded-full font-black uppercase tracking-widest hover:bg-white/10 transition-all">Support Desk</Link>
            </div>
         </div>
      </section>

    </div>
  );
}

export default AboutPage;
