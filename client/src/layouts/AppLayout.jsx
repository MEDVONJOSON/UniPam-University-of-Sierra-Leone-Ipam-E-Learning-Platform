import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { getCurrentUser, hydrateCurrentUser, logoutUser } from "../services/authService";
import { 
  LogOut, User, Menu, X, BookOpen, LayoutDashboard, Award, 
  GraduationCap, Info, Mail, Search, ChevronDown, Facebook, 
  Twitter, Linkedin, Instagram, Phone, MapPin, Globe, Bell, ShoppingCart, ShieldCheck
} from "lucide-react";

function AppLayout() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  useEffect(() => {
    hydrateCurrentUser()
      .then((user) => setCurrentUser({
        id: user.id,
        name: user.fullName || "",
        email: user.email,
        role: user.role
      }))
      .catch(() => {
        // No active session yet.
      });
  }, []);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    navigate("/");
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all hover:text-blue-300 ${
      isActive ? "text-blue-300 ring-1 ring-blue-500/30 bg-blue-500/10 rounded-full" : "text-white"
    }`;

  const mobileNavItemClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-3 text-base font-bold border-l-4 transition-colors ${
      isActive ? "bg-blue-900/50 border-blue-400 text-blue-400" : "border-transparent text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-[#0d2d57] shadow-xl border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Top Left Logo: UniPam */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="bg-gradient-to-br from-blue-500 to-blue-800 p-2.5 rounded-[12px] shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                 <span className="text-2xl font-black text-white tracking-tighter leading-none">UniPam</span>
                 <span className="text-[9px] text-blue-400 font-black tracking-[0.2em] uppercase mt-0.5">University Of Sierra Leone eCampus</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2 h-full">
              {/* Explore Dropdown */}
              <div className="relative h-full flex items-center">
                 <button
                   onMouseEnter={() => setIsExploreOpen(true)}
                   className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all group"
                 >
                    Explore <ChevronDown className={`w-4 h-4 transition-transform ${isExploreOpen ? 'rotate-180' : ''}`} />
                 </button>

                 {isExploreOpen && (
                   <div
                     onMouseLeave={() => setIsExploreOpen(false)}
                     className="absolute top-[80%] left-0 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 animate-in fade-in slide-in-from-top-2 duration-200"
                   >
                      <div className="space-y-1">
                         <Link to="/course-catalog" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 group transition-colors">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                               <Award className="w-4 h-4" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-[#0d2d57]">Undergraduate Programs</p>
                               <p className="text-[10px] text-slate-400">Bachelor Degrees</p>
                            </div>
                         </Link>
                         <Link to="/course-catalog" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 group transition-colors">
                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                               <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-[#0d2d57]">Certificate Courses</p>
                               <p className="text-[10px] text-slate-400">Skill Acquisition</p>
                            </div>
                         </Link>
                         <Link to="/training" className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 group transition-colors">
                            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                               <GraduationCap className="w-4 h-4" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-[#0d2d57]">Postgraduate School</p>
                               <p className="text-[10px] text-slate-400">PhDs & Masters</p>
                            </div>
                         </Link>
                      </div>
                   </div>
                 )}
              </div>

              <div className="w-[1px] h-6 bg-white/10 mx-2" />

              <NavLink to="/course-catalog" className={navItemClass}>
                 <Search className="w-4 h-4" /> Search
              </NavLink>
              <NavLink to="/training" className={navItemClass}>Specializations</NavLink>
              <NavLink to="/about" className={navItemClass}>About</NavLink>
              <NavLink to="/contact" className={navItemClass}>Contact</NavLink>
            </nav>

            {/* Desktop Auth Section */}
            <div className="hidden lg:flex items-center gap-4">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  {/* Action Icons */}
                  <div className="flex items-center gap-1 mr-4">
                     <button className="p-2.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-all relative">
                        <GraduationCap className="w-5 h-5" />
                     </button>
                     <button className="p-2.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-all relative">
                        <ShoppingCart className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">0</span>
                     </button>
                     <button className="p-2.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-all relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">1</span>
                     </button>
                  </div>

                  <div className="w-px h-8 bg-white/10 mx-2" />

                  <NavLink
                    to="/user-dashboard"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 rounded-full transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-400 flex items-center justify-center bg-white/10">
                       <User className="w-4 h-4 text-blue-300" />
                    </div>
                    <span className="text-white font-black text-sm group-hover:text-blue-300 transition-colors uppercase">{currentUser.name?.split(' ')[0]}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </NavLink>

                  {currentUser.role === 'admin' && (
                    <Link
                      to="/admin-dashboard"
                      className="p-2.5 text-red-300 hover:text-white hover:bg-red-500/10 rounded-xl transition-all relative border border-red-500/20"
                      title="Registry Panel"
                    >
                      <ShieldCheck className="w-5 h-5" />
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="p-2.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/user-login"
                    className="px-4 py-2 text-sm font-bold text-white hover:text-blue-300 transition-colors"
                  >
                    LMS Login
                  </Link>
                  <Link
                    to="/user-register"
                    className="px-6 py-2.5 text-sm font-[900] text-[#0d2d57] bg-white hover:bg-slate-100 rounded-full transition-all shadow-xl active:scale-95 uppercase tracking-wider"
                  >
                    Apply Now
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 rounded-xl text-white bg-white/5 border border-white/10 hover:bg-white/10 focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-[#0d2d57] border-t border-blue-900/50 p-4">
            <div className="space-y-1 mb-6">
              <NavLink to="/" className={mobileNavItemClass} onClick={() => setIsMenuOpen(false)}>Home</NavLink>
              <NavLink to="/course-catalog" className={mobileNavItemClass} onClick={() => setIsMenuOpen(false)}>Courses</NavLink>
              <NavLink to="/training" className={mobileNavItemClass} onClick={() => setIsMenuOpen(false)}>Specializations</NavLink>
              <NavLink to="/about" className={mobileNavItemClass} onClick={() => setIsMenuOpen(false)}>About</NavLink>
              <NavLink to="/contact" className={mobileNavItemClass} onClick={() => setIsMenuOpen(false)}>Contact</NavLink>
              {currentUser && (
                <>
                  <NavLink to="/user-dashboard" className={mobileNavItemClass} onClick={() => setIsMenuOpen(false)}>LMS Dashboard</NavLink>
                  <NavLink to="/profile" className={mobileNavItemClass} onClick={() => setIsMenuOpen(false)}>Profile</NavLink>
                </>
              )}
            </div>
            {!currentUser && (
              <div className="flex flex-col gap-3">
                <Link
                  to="/user-login"
                  className="w-full text-center py-3.5 text-white font-bold border border-blue-500/30 rounded-2xl hover:bg-blue-900/30"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Student Login
                </Link>
                <Link
                  to="/user-register"
                  className="w-full text-center py-3.5 bg-white text-[#0d2d57] font-[900] rounded-2xl hover:bg-slate-100 shadow-xl"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Join Campus
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <Outlet />
      </main>

      <footer className="bg-[#0b1b31] text-slate-400 pt-20 pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
           <div className="space-y-6">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-blue-500 p-1.5 rounded-lg shadow-lg">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-[900] text-white tracking-tight leading-tight">UniPam</span>
              </Link>
              <p className="text-sm leading-relaxed text-slate-400">
                Fostering excellence, innovation, and digital transformation in higher education across Sierra Leone and beyond. UniPam is your gateway to world-class learning.
              </p>
              <div className="flex items-center gap-4">
                 {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                    <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                       <Icon className="w-5 h-5" />
                    </a>
                 ))}
              </div>
           </div>

           <div>
              <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Faculties & Programs</h4>
              <ul className="space-y-4 text-sm font-medium">
                 <li><Link to="/course-catalog" className="hover:text-blue-400 transition-colors">Faculty of Engineering</Link></li>
                 <li><Link to="/course-catalog" className="hover:text-blue-400 transition-colors">Social Sciences & Law</Link></li>
                 <li><Link to="/course-catalog" className="hover:text-blue-400 transition-colors">Arts and Humanities</Link></li>
                 <li><Link to="/course-catalog" className="hover:text-blue-400 transition-colors">Pure & Applied Sciences</Link></li>
                 <li><Link to="/training" className="hover:text-blue-400 transition-colors">Postgraduate School</Link></li>
              </ul>
           </div>

           <div>
              <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Student Portal</h4>
              <ul className="space-y-4 text-sm font-medium">
                 <li><Link to="/about" className="hover:text-blue-400 transition-colors">Academic Calendar</Link></li>
                 <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Admission Portal</Link></li>
                 <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Scholarship Hub</Link></li>
                 <li><Link to="/about" className="hover:text-blue-400 transition-colors">Research Repository</Link></li>
                 <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Career Services</Link></li>
              </ul>
           </div>

           <div>
              <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Campus Contact</h4>
              <ul className="space-y-4 text-sm font-medium">
                 <li className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                    <span>A.J. Momoh St, Tower Hill, Freetown, Sierra Leone</span>
                 </li>
                 <li className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-500" />
                    <span>+232 00 000 000</span>
                 </li>
                 <li className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <span>registrar@usl.edu.sl</span>
                 </li>
                 <li className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <span>www.usl.edu.sl</span>
                 </li>
              </ul>
           </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
           <p className="text-xs text-slate-500 italic">© {new Date().getFullYear()} UniPam. University Of Sierra Leone eCampus.</p>
           <div className="flex gap-6 text-xs font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
              <Link to="/admin-login" className="hover:text-red-400 transition-colors">Admin Portal</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}

export default AppLayout;
