import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, ArrowRight, Shield, UserPlus, Loader2, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const module = searchParams.get("module") || "protection";
  const { toast } = useToast();

  const handleLogin = () => {
    setError("");

    if (phone.length < 10) {
      toast({ title: "Invalid Number", description: "Please enter a valid 10-digit mobile number.", variant: "destructive" });
      return;
    }
    if (!password) {
      toast({ title: "Password Required", description: "Please enter your password.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Check credentials against stored users
      const users = JSON.parse(localStorage.getItem("secureland_users") || "[]");
      const matchedUser = users.find((u: any) => u.phone === phone && u.password === password);

      if (!matchedUser) {
        // Check if phone exists but password is wrong
        const phoneExists = users.find((u: any) => u.phone === phone);
        if (phoneExists) {
          setError("Invalid password. Please try again.");
          toast({ title: "Login Failed", description: "Incorrect password for this mobile number.", variant: "destructive" });
        } else {
          setError("This mobile number is not registered. Please register first.");
          toast({ title: "Not Registered", description: "No account found with this mobile number. Please register.", variant: "destructive" });
        }
        setLoading(false);
        return;
      }

      // Login successful
      localStorage.setItem("secureland_current_user", JSON.stringify({ name: matchedUser.name, phone: matchedUser.phone }));
      toast({ title: "Login Successful!", description: `Welcome back, ${matchedUser.name}!` });
      navigate(module === "marketplace" ? "/marketplace/dashboard" : "/protection/dashboard");
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient relative items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 30% 50%, hsla(190,100%,50%,0.3) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, hsla(209,82%,30%,0.2) 0%, transparent 50%)`
        }} />
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-20 h-20 rounded-2xl bg-primary-foreground/10 backdrop-blur-xl border border-primary-foreground/20 flex items-center justify-center mx-auto mb-8"
          >
            <Shield className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-extrabold tracking-widest text-primary-foreground mb-3"
          >
            SECURELAND
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-primary-foreground/60 text-sm"
          >
            {module === "marketplace" ? "AI-Powered Land Marketplace" : "AI-Powered Land Protection"}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-primary-foreground/40 text-xs mt-8"
          >
            © {new Date().getFullYear()} SecureLand. All rights reserved.
          </motion.p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">SECURELAND</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
          <p className="text-sm text-muted-foreground mb-8">Enter your credentials to continue</p>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive font-medium">{error}</p>
            </motion.div>
          )}

          <div className="space-y-4">
            {/* Mobile Number */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Mobile Number</label>
              <div className="flex gap-2">
                <div className="h-12 px-3 rounded-lg bg-secondary border border-border flex items-center text-sm text-muted-foreground font-medium">+91</div>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                    placeholder="9876543210"
                    className="w-full h-12 pl-10 pr-4 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Enter your password"
                  className="w-full h-12 pl-10 pr-11 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading || phone.length < 10 || !password}
              className="w-full h-12 rounded-xl hero-gradient-subtle text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Login <ArrowRight className="w-4 h-4" /></>}
            </button>

            <div className="relative flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              onClick={() => navigate(`/register?module=${module}`)}
              className="w-full h-12 rounded-xl border-2 border-primary/30 bg-primary/5 text-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all"
            >
              <UserPlus className="w-4 h-4" /> New Register
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
