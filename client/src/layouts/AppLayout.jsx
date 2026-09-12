import { useEffect, useState, useRef } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { getCurrentUser, hydrateCurrentUser, logoutUser } from "../services/authService";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../services/platformService";
import {
  LogOut, User, Menu, X, BookOpen, LayoutDashboard, Award,
  GraduationCap, Info, Mail, Search, ChevronDown, Facebook,
  Twitter, Linkedin, Instagram, Phone, MapPin, Globe, Bell, ShoppingCart, ShieldCheck,
  CheckCircle2, Clock, FileText, CheckCheck, Loader2
} from "lucide-react";

function AppLayout() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const fetchNotifs = () => {
    if (getCurrentUser()) {
      getNotifications()
        .then((res) => {
          setNotifications(res.notifications || []);
          setUnreadCount(res.unreadCount || 0);
        })
        .catch(() => { });
    }
  };

  useEffect(() => {
    hydrateCurrentUser()
      .then((user) => {
        setCurrentUser({
          id: user.id,
          name: user.fullName || "",
          email: user.email,
          role: user.role,
          profilePhotoUrl: user.profilePhotoUrl || user.profile_photo_url || null
        });
        fetchNotifs();
      })
      .catch(() => {
        // No active session yet.
      });
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (_) { }
  };

  const handleNotifClick = async (notif) => {
    try {
      if (!notif.read_at) {
        await markNotificationRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setIsNotifOpen(false);
      if (notif.link) {
        navigate(notif.link);
      }
    } catch (_) { }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    navigate("/");
  };

  const navItemClass = ({ isActive }) =>
    `relative flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all hover:text-hover-300 ${isActive ? "text-gold-400 ring-1 ring-brand-500/30 bg-brand-500/10 rounded-full after:content-[''] after:absolute after:left-4 after:right-4 after:-bottom-1 after:h-[2px] after:rounded-full after:bg-gold-500" : "text-white"
    }`;

  const mobileNavItemClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-3 text-base font-bold border-l-4 transition-colors ${isActive ? "bg-brand-900/50 border-gold-500 text-gold-400" : "border-transparent text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-[#0B5E3C] shadow-xl border-b border-brand-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Top Left Logo: UniPam */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-[14px] bg-white shadow-xl overflow-hidden flex items-center justify-center p-1 transform group-hover:scale-105 transition-all duration-300">
                <img
                  src="/img/unipam-logo.png"
                  alt="UniPam Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white tracking-tighter leading-none">UniPam</span>
                <span className="text-[9px] text-white/90 font-black tracking-[0.2em] uppercase mt-0.5">UNIPAM ELEARNING WEB APPLICATION IPAM</span>
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
                  Explore <ChevronDown className={`w-4 h-4 text-white transition-transform ${isExploreOpen ? 'rotate-180' : ''}`} />
                </button>

                  {isExploreOpen && (
                    <div
                      onMouseLeave={() => setIsExploreOpen(false)}
                      className="absolute top-[80%] left-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 animate-in fade-in slide-in-from-top-2 duration-200 z-50"
                    >
                      <div className="space-y-1">
                        <Link 
                          to="/training" 
                          onClick={() => setIsExploreOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 group transition-colors"
                        >
                          <div>
                            <p className="text-sm font-black text-[#0B5E3C] group-hover:text-[#0B5E3C]">Explore Programmes By Faculty</p>
                            <p className="text-[10px] font-bold text-slate-500">17 Bachelor Degrees · 4 Years</p>
                          </div>
                        </Link>
                        <Link 
                          to="/login" 
                          onClick={() => setIsExploreOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 group transition-colors border-t border-slate-100 mt-1"
                        >
                          <div>
                            <p className="text-sm font-black text-[#0B5E3C]">Sign In And Access Repository</p>
                            <p className="text-[10px] font-bold text-slate-500">Student Sign In</p>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
              </div>

              <div className="w-[1px] h-6 bg-white/10 mx-2" />

              <NavLink to="/app/repository" className={navItemClass}>
                <Search className="w-4 h-4 text-amber-400" /> Search
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
                    <button className="p-2.5 text-amber-400 hover:bg-white/10 rounded-xl transition-all relative">
                      <GraduationCap className="w-5 h-5 text-amber-400" />
                    </button>
                    <button className="p-2.5 text-amber-400 hover:bg-white/10 rounded-xl transition-all relative">
                      <ShoppingCart className="w-5 h-5 text-amber-400" />
                      <span className="absolute top-2 right-2 w-4 h-4 bg-amber-400 text-brand-950 text-[10px] font-black rounded-full flex items-center justify-center">0</span>
                    </button>
                    {/* Notification Bell with Dropdown */}
                    <div className="relative" ref={notifRef}>
                      <button
                        onClick={() => setIsNotifOpen(v => !v)}
                        className="p-2.5 text-amber-400 hover:bg-white/10 rounded-xl transition-all relative"
                        title="Notifications"
                      >
                        <Bell className="w-5 h-5 text-amber-400" />
                        {unreadCount > 0 && (
                          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-amber-400 text-brand-950 text-[10px] font-black rounded-full flex items-center justify-center shadow-lg animate-pulse">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </button>

                      {isNotifOpen && (
                        <div className="absolute right-0 top-[120%] w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <Bell className="w-4 h-4 text-[#0B5E3C]" />
                              <span className="font-black text-slate-800 text-sm">Notifications</span>
                              {unreadCount > 0 && (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                                  {unreadCount} new
                                </span>
                              )}
                            </div>
                            {unreadCount > 0 && (
                              <button
                                onClick={handleMarkAllRead}
                                className="text-[10px] font-bold text-hover-600 hover:underline uppercase tracking-wider flex items-center gap-1"
                              >
                                <CheckCheck className="w-3 h-3" /> Mark read
                              </button>
                            )}
                          </div>

                          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 mt-2 space-y-1">
                            {notifications.length === 0 ? (
                              <div className="text-center py-8 text-slate-400">
                                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                                <p className="text-xs font-bold">No notifications yet</p>
                                <p className="text-[10px] text-slate-300 mt-0.5">You will be alerted when new lecture materials are uploaded.</p>
                              </div>
                            ) : (
                              notifications.map((notif) => (
                                <div
                                  key={notif.id}
                                  onClick={() => handleNotifClick(notif)}
                                  className={`p-3 rounded-2xl cursor-pointer transition-all flex items-start gap-3 text-left ${notif.read_at ? "bg-white hover:bg-slate-50 text-slate-600" : "bg-emerald-50/60 hover:bg-emerald-50 text-slate-900 font-bold border border-emerald-100/60"
                                    }`}
                                >
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${notif.read_at ? "bg-slate-100 text-slate-400" : "bg-[#0B5E3C] text-white"}`}>
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1 mb-0.5">
                                      <p className="text-xs font-black text-slate-800 line-clamp-1">{notif.title}</p>
                                      {!notif.read_at && (
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-normal">{notif.message}</p>
                                    <span className="text-[9px] text-slate-400 flex items-center gap-1 mt-1 font-normal">
                                      <Clock className="w-2.5 h-2.5" />
                                      {new Date(notif.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="pt-3 border-t border-slate-100 mt-2 text-center">
                            <Link
                              to="/app/repository"
                              onClick={() => setIsNotifOpen(false)}
                              className="text-[10px] font-black text-[#0B5E3C] hover:underline uppercase tracking-widest"
                            >
                              Go to Repository →
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-px h-8 bg-white/10 mx-2" />

                  <NavLink
                    to="/app/dashboard"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 rounded-full transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-brand-400 flex items-center justify-center bg-white/10">
                      {currentUser?.profilePhotoUrl ? (
                        <img src={currentUser.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-brand-300" />
                      )}
                    </div>
                    <span className="text-white font-black text-sm group-hover:text-hover-300 transition-colors uppercase">{currentUser.name?.split(' ')[0]}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </NavLink>

                  {currentUser.role === 'admin' && (
                    <Link
                      to="/admin-dashboard"
                      className="p-2.5 text-gold-400 hover:text-white hover:bg-gold-500/10 rounded-xl transition-all relative border border-gold-500/30"
                      title="Registry Panel"
                    >
                      <ShieldCheck className="w-5 h-5" />
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="p-2.5 text-brand-200 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-bold text-white hover:text-hover-300 transition-colors"
                  >
                    LMS Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2.5 text-sm font-[900] text-[#0B5E3C] bg-white hover:bg-slate-100 rounded-full transition-all shadow-xl active:scale-95 uppercase tracking-wider"
                  >
                    Sign Up
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
          <div className="lg:hidden bg-[#0B5E3C] border-t border-brand-900/50 p-4">
            <div className="space-y-1 mb-6">
              <NavLink to="/" className={mobileNavItemClass} onClick={() => setIsMenuOpen(false)}>Home</NavLink>
              <NavLink to="/ipam" className={mobileNavItemClass} onClick={() => setIsMenuOpen(false)}>IPAM Faculties & Programmes</NavLink>
              <NavLink to="/ipam?level=Degree" className={mobileNavItemClass} onClick={() => setIsMenuOpen(false)}>Undergraduate Programs</NavLink>
              <NavLink to="/training" className={mobileNavItemClass} onClick={() => setIsMenuOpen(false)}>Specializations</NavLink>
              <NavLink to="/about" className={mobileNavItemClass} onClick={() => setIsMenuOpen(false)}>About</NavLink>
              <NavLink to="/contact" className={mobileNavItemClass} onClick={() => setIsMenuOpen(false)}>Contact</NavLink>
              {currentUser && (
                <>
                  <NavLink to="/app/dashboard" className={mobileNavItemClass} onClick={() => setIsMenuOpen(false)}>LMS Dashboard</NavLink>
                  <NavLink to="/app/profile" className={mobileNavItemClass} onClick={() => setIsMenuOpen(false)}>Profile</NavLink>
                </>
              )}
            </div>
            {!currentUser && (
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  className="w-full text-center py-3.5 text-white font-bold border border-brand-500/30 rounded-2xl hover:bg-hover-700/30"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Student Login
                </Link>
                <Link
                  to="/register"
                  className="w-full text-center py-3.5 bg-white text-[#0B5E3C] font-[900] rounded-2xl hover:bg-slate-100 shadow-xl"
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

      <footer className="bg-[#073823] text-slate-400 pt-20 pb-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-white shadow-lg overflow-hidden flex items-center justify-center">
                <img
                  src="/img/unipam-logo.png"
                  alt="UNIPAM logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-xl font-[900] text-white tracking-tight leading-tight">UniPam</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Fostering excellence, innovation, and digital transformation in learning at the Institute of Public Administration and Management (IPAM), University of Sierra Leone. UniPam is your gateway to course materials, academic collaboration, and learning.
            </p>
            <div className="flex items-center gap-4">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-hover-600 hover:text-white transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Faculties & Programs</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>Accounting & Finance</li>
              <li>Information Systems & Technology</li>
              <li>Business Administration & Entrepreneurship</li>
              <li>Leadership & Governance</li>
              <li>Extra-Mural Studies</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Student Portal</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>Course Materials</li>
              <li>Notifications</li>
              <li>My Dashboard</li>
              <li>Academic Calendar</li>
              <li>Contact Support</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Campus Contact</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-500 mt-0.5" />
                <span>A.J. Momoh St, Tower Hill, Freetown, Sierra Leone</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-500" />
                <span>+23279688260 / +23272659157</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-500" />
                <span>registrar@usl.edu.sl</span>
              </li>
              <li className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-brand-500" />
                <span>www.usl.edu.sl</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-slate-500 italic">© {new Date().getFullYear()} UniPam. IPAM-USL e-learning platform.</p>
          <div className="flex gap-6 text-xs font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            <Link to="/admin-login" className="hover:text-gold-400 transition-colors">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AppLayout;
