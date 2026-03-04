import { Search, Bell, Globe, Moon, Sun, Shield, User, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isDark, setIsDark] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("secureland_current_user") || "{}");
  const userName = currentUser.name || "Guest";
  const userPhone = currentUser.phone || "";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("secureland_current_user");
    navigate("/login");
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 h-[68px] glass-light border-b border-border/40 flex items-center justify-between px-6 lg:px-10"
    >
      <div className="flex items-center gap-3 w-[220px]">
        <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center shadow-lg shadow-primary/20">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground hidden sm:block">
          Secure<span className="gradient-text font-black">Land</span>
        </span>
      </div>

      <div className="flex-1 max-w-xl mx-8 hidden md:block">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search verified lands, coordinates, owners..."
            className="w-full h-11 pl-10 pr-4 rounded-full bg-secondary/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-background transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border/50 bg-secondary/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end w-[220px]">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button className="w-10 h-10 rounded-full hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
          <Globe className="w-5 h-5" />
        </button>
        <button className="w-10 h-10 rounded-full hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-destructive animate-pulse" />
        </button>

        {/* Profile Avatar + Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 ml-2 group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-sm font-bold text-white shadow-md group-hover:shadow-lg transition-shadow">
              {initials}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${showProfile ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-14 w-72 glass-card rounded-2xl border border-border/50 shadow-2xl overflow-hidden z-50"
              >
                {/* Profile Header */}
                <div className="p-5 bg-gradient-to-br from-primary/10 to-accent/5 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-lg font-bold text-white shadow-lg">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-foreground truncate">{userName}</p>
                      <p className="text-sm text-muted-foreground">+91 {userPhone}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] text-emerald-500 font-semibold">Verified Account</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/30">
                    <User className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground font-medium">Full Name</p>
                      <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/30">
                    <Shield className="w-4 h-4 text-accent shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground font-medium">Mobile Number</p>
                      <p className="text-sm font-semibold text-foreground">+91 {userPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/30">
                    <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground font-medium">Account Status</p>
                      <p className="text-sm font-semibold text-emerald-500">Active</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-3 border-t border-border/40">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
