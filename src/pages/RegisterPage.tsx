import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, ArrowRight, Shield, ChevronLeft, User, Lock, Eye, EyeOff, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RegisterPage = () => {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const module = searchParams.get("module") || "protection";
    const { toast } = useToast();

    const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

    const handleRegister = () => {
        if (!name.trim()) { toast({ title: "Name Required", description: "Please enter your full name.", variant: "destructive" }); return; }
        if (phone.length < 10) { toast({ title: "Invalid Number", description: "Please enter a valid 10-digit mobile number.", variant: "destructive" }); return; }
        if (password.length < 6) { toast({ title: "Weak Password", description: "Password must be at least 6 characters.", variant: "destructive" }); return; }
        if (!passwordsMatch) { toast({ title: "Password Mismatch", description: "Passwords do not match.", variant: "destructive" }); return; }

        // Check if phone already registered
        const existingUsers = JSON.parse(localStorage.getItem("secureland_users") || "[]");
        const alreadyExists = existingUsers.find((u: any) => u.phone === phone);
        if (alreadyExists) {
            toast({ title: "Already Registered", description: "This mobile number is already registered. Please login.", variant: "destructive" });
            return;
        }

        setLoading(true);
        setTimeout(() => {
            // Save user credentials to localStorage
            const newUser = { name, phone, password };
            existingUsers.push(newUser);
            localStorage.setItem("secureland_users", JSON.stringify(existingUsers));
            localStorage.setItem("secureland_current_user", JSON.stringify({ name, phone }));

            toast({ title: "Registration Successful!", description: "Welcome to SecureLand. Let's register your land." });
            navigate("/protection/register-land");
            setLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Hero */}
            <div className="hidden lg:flex lg:w-1/2 hero-gradient relative items-center justify-center p-12">
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `radial-gradient(circle at 30% 50%, hsla(190,100%,50%,0.3) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, hsla(145,65%,32%,0.2) 0%, transparent 50%)`
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
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-3xl font-extrabold tracking-widest text-primary-foreground mb-3">
                        SECURELAND
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-primary-foreground/60 text-sm">
                        Create Your Secure Account
                    </motion.p>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-12 space-y-4 text-left max-w-xs mx-auto">
                        {["AI-powered land protection", "Satellite boundary monitoring", "Blockchain-verified ownership", "Fraud detection alerts"].map((f, i) => (
                            <div key={i} className="flex items-center gap-3 text-primary-foreground/70">
                                <CheckCircle className="w-4 h-4 text-cyan shrink-0" />
                                <span className="text-sm">{f}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex items-center justify-center p-6 bg-background">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold text-foreground tracking-tight">SECURELAND</span>
                    </div>

                    <h2 className="text-2xl font-bold text-foreground mb-1">Create Account</h2>
                    <p className="text-sm text-muted-foreground mb-6">Register to start protecting your land</p>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-foreground mb-1.5 block">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name"
                                    className="w-full h-12 pl-10 pr-4 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground mb-1.5 block">Mobile Number</label>
                            <div className="flex gap-2">
                                <div className="h-12 px-3 rounded-lg bg-secondary border border-border flex items-center text-sm text-muted-foreground font-medium">+91</div>
                                <div className="relative flex-1">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="9876543210"
                                        className="w-full h-12 pl-10 pr-4 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground mb-1.5 block">Create Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters"
                                    className="w-full h-12 pl-10 pr-11 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground mb-1.5 block">Re-enter Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password"
                                    className={`w-full h-12 pl-10 pr-11 rounded-lg bg-secondary border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all ${confirmPassword.length > 0 ? passwordsMatch ? "border-accent focus:ring-accent/30" : "border-destructive focus:ring-destructive/30" : "border-border focus:ring-primary/30"
                                        }`} />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {confirmPassword.length > 0 && !passwordsMatch && <p className="text-xs text-destructive mt-1.5 font-medium">Passwords do not match</p>}
                            {passwordsMatch && <p className="text-xs text-accent mt-1.5 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Passwords match</p>}
                        </div>

                        <button onClick={handleRegister} disabled={loading || !name || phone.length < 10 || password.length < 6 || !passwordsMatch}
                            className="w-full h-12 rounded-xl hero-gradient-subtle text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Register <ArrowRight className="w-4 h-4" /></>}
                        </button>

                        <button onClick={() => navigate(`/login?module=${module}`)} className="w-full flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Already have an account? Login
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterPage;
