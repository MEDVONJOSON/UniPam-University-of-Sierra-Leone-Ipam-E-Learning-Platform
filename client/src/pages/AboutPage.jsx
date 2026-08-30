import { Globe, Target, Rocket, Users, ShieldCheck, BookOpen, Lightbulb, ArrowRight, Award, CheckCircle2, MapPin, Building2, Landmark, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

function AboutPage() {
  const values = [
    { icon: <Globe className="w-7 h-7 text-brand-600" />, title: "Digital Inclusion", desc: "Expanding access to world-class higher education for every Sierra Leonean, regardless of their location." },
    { icon: <ShieldCheck className="w-7 h-7 text-brand-600" />, title: "Academic Integrity", desc: "Upholding the same rigorous standards in our digital campus as in our physical classrooms at Fourah Bay College and IPAM." },
    { icon: <Users className="w-7 h-7 text-brand-600" />, title: "Institutional Synergy", desc: "Unifying USL's diverse faculties under a single, seamless digital learning ecosystem powered by UniPam." },
    { icon: <Lightbulb className="w-7 h-7 text-brand-600" />, title: "Future Ready", desc: "Equipping graduates with the digital literacy and specialized skills required for Sierra Leone's growing economy." }
  ];

  const milestones = [
    { phase: "Traditional Foundation", title: "Legacy of Excellence", desc: "Rooted in the rich history of Fourah Bay College, the oldest university in West Africa.", icon: <Landmark className="w-6 h-6" /> },
    { phase: "Digital Expansion", title: "UniPam", desc: "Launching the official portal to provide flexible, self-paced learning to students nationwide.", icon: <Rocket className="w-6 h-6" /> },
    { phase: "Future Focus", title: "National Innovation Hub", desc: "Integrating AI and advanced vocational training to drive Sierra Leone's 2030 development goals.", icon: <GraduationCap className="w-6 h-6" /> }
  ];

  const constituentColleges = [
    { name: "Fourah Bay College (FBC)", role: "Humanities & Sciences", since: "1827", icon: <Building2 className="w-8 h-8" /> },
    { name: "IPAM", role: "Business, Management & Technology", since: "Est.", href: "/ipam", icon: <Building2 className="w-8 h-8" /> },
    { name: "COMAHS", role: "Medicine & Health Sciences", since: "1988", icon: <Building2 className="w-8 h-8" /> }
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Section - Official USL Digital Branded */}
      <section className="relative text-center pt-20 pb-24 -mx-4 sm:-mx-6 lg:-mx-8 px-8 bg-[#0B5E3C] text-white overflow-hidden">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
         <div className="max-w-4xl mx-auto space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-200 text-[10px] font-black mb-4 uppercase tracking-[0.2em]">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              Official Digital Portal
            </div>
            <h1 className="text-4xl sm:text-6xl font-[900] text-white leading-tight uppercase tracking-tight">
              About UniPam
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-brand-100 leading-relaxed font-medium">
              Bridging the gap between our historic academic legacy and the future of digital education. UniPam is the official University of Sierra Leone eLearning initiative designed for global excellence and local impact.
            </p>
         </div>
      </section>

      {/* Legacy & Future - Dual Card Layout */}
      <section className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-[#0B5E3C] p-12 rounded-[40px] text-white relative overflow-hidden group shadow-xl">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 transition-transform group-hover:scale-150 duration-700" />
           <Target className="w-12 h-12 text-amber-400 mb-6" />
           <h2 className="text-3xl font-black mb-4 uppercase">Our Vision</h2>
           <p className="text-brand-100 leading-relaxed text-lg font-medium">
             To be the premier digital university hub in West Africa, transforming lives through accessible, high-quality, and innovative distance learning solutions that meet the evolving needs of the 21st century.
           </p>
        </div>
        <div className="bg-white border border-slate-200 p-12 rounded-[40px] shadow-sm relative overflow-hidden group">
           <Rocket className="w-12 h-12 text-[#0B5E3C] mb-6" />
           <h2 className="text-3xl font-black text-[#0B5E3C] mb-4 uppercase">Our Mission</h2>
           <p className="text-slate-600 leading-relaxed text-lg italic font-medium">
             "To provide flexible and equitable access to top-tier university education, professional training, and research-led digital learning for all citizens of Sierra Leone and the global community."
           </p>
        </div>
      </section>

      {/* Constituent Colleges - Cleaned Partners Section */}
      <section className="bg-slate-50 py-24 border-y border-slate-200">
         <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-black text-[#0B5E3C] mb-12 uppercase">Our Constituent Colleges</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {constituentColleges.map((college, i) => (
                  <div key={i} className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
                     <div className="w-16 h-16 bg-emerald-50 text-[#0B5E3C] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#0B5E3C] group-hover:text-white transition-all">
                        {college.icon}
                     </div>
                     <h3 className="text-xl font-black text-[#0B5E3C] mb-2 uppercase">{college.name}</h3>
                     <p className="text-emerald-700 text-xs font-black uppercase tracking-widest mb-4">{college.role}</p>
                     <p className="badge-gold">{college.since} {college.since !== "Est." ? "" : "— USL Constituent College"}</p>
                     {college.href && (
                       <Link to={college.href} className="mt-4 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#0B5E3C] hover:text-emerald-700 transition-colors">
                         View Programmes <ArrowRight className="w-3.5 h-3.5" />
                       </Link>
                     )}
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Core Values */}
      <section className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-[#0B5E3C] mb-3 uppercase">Digital Values</h2>
          <p className="text-slate-600 font-medium">The principles governing our virtual campus environment.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, i) => (
            <div key={i} className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 group">
              <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-emerald-50 text-[#0B5E3C] mb-6 group-hover:bg-[#0B5E3C] group-hover:text-white transition-all transform group-hover:rotate-6">
                {v.icon}
              </div>
              <h3 className="text-lg font-black text-[#0B5E3C] mb-4 uppercase leading-tight">{v.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Institutional Roadmap */}
      <section className="container mx-auto px-6 bg-white rounded-[40px] border border-slate-200 p-12 lg:p-20 shadow-sm overflow-hidden relative">
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-3xl font-black text-[#0B5E3C] mb-3 uppercase">Strategic Roadmap</h2>
          <p className="text-slate-600 font-medium">Phasing our digital transformation for national impact.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
           {milestones.map((m, i) => (
             <div key={i} className="relative group">
                <div className="space-y-6">
                   <div className="w-12 h-12 rounded-2xl bg-[#0B5E3C] text-white flex items-center justify-center font-black shadow-lg">
                      {m.icon}
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2">{m.phase}</p>
                      <h3 className="text-xl font-black text-[#0B5E3C] mb-4 uppercase">{m.title}</h3>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{m.desc}"</p>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-6 py-12 text-center">
         <div className="bg-[#0B5E3C] p-16 rounded-[50px] text-white relative overflow-hidden shadow-2xl">
            <h2 className="text-4xl font-black mb-6 uppercase tracking-tight">Become a UniPam Student</h2>
            <p className="text-brand-100 text-lg mb-10 max-w-2xl mx-auto font-medium">Join thousands of professionals earning recognized degrees and certificates from UniPam.</p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
               <Link to="/register" className="px-10 py-5 bg-white text-[#0B5E3C] rounded-full font-black uppercase tracking-widest shadow-2xl hover:bg-slate-50 transition-all hover:scale-105 active:scale-95">Apply Online Now</Link>
               <Link to="/contact" className="px-10 py-5 border border-white/20 text-white rounded-full font-black uppercase tracking-widest hover:bg-white/10 transition-all">Support Desk</Link>
            </div>
         </div>
      </section>

    </div>
  );
}

export default AboutPage;
