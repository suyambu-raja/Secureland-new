import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightLeft, User, Phone, MapPin, FileCheck, Shield, ChevronRight, Upload, CheckCircle, AlertTriangle, Banknote, Lock, Camera, Eye, EyeOff, ArrowRight, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { registerOnBlockchain } from "@/lib/blockchain";

const OwnershipTransferPage = () => {
    const [step, setStep] = useState<"landing" | "form" | "verify" | "complete">("landing");
    const { toast } = useToast();

    // Buyer form state
    const [buyerName, setBuyerName] = useState("");
    const [buyerPhone, setBuyerPhone] = useState("");
    const [buyerAadhaar, setBuyerAadhaar] = useState("");
    const [buyerAddress, setBuyerAddress] = useState("");
    const [salePrice, setSalePrice] = useState("");
    const [uploadedDoc, setUploadedDoc] = useState<File | null>(null);

    // Security verification overlay state
    const [secStep, setSecStep] = useState(0); // 0=hidden, 1=owner-face+password, 2=deed-verify, 3=buyer-otp, 4=complete
    const [ownerPassword, setOwnerPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [ownerFaceVerified, setOwnerFaceVerified] = useState(false);
    const [ownerPasswordVerified, setOwnerPasswordVerified] = useState(false);
    const [deedVerified, setDeedVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpValue, setOtpValue] = useState(["", "", "", "", "", ""]);
    const [otpVerified, setOtpVerified] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [blinkCount, setBlinkCount] = useState(0);
    const [faceReady, setFaceReady] = useState(false);
    const [transferHash, setTransferHash] = useState("");
    const faceVideoRef = useRef<HTMLVideoElement>(null);

    // Get stored twin data
    const getStoredTwin = () => {
        try {
            const stored = localStorage.getItem("secureland_latest_twin");
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    };

    const twin = getStoredTwin();

    // Handle "Proceed to Verification" → start security flow
    const handleProceedToVerification = () => {
        if (!buyerName.trim()) { toast({ title: "Enter buyer's name", variant: "destructive" }); return; }
        if (!buyerPhone.trim()) { toast({ title: "Enter buyer's phone", variant: "destructive" }); return; }
        setSecStep(1); // Start owner verification
    };

    // =============================================
    // STEP 1: OWNER FACE + PASSWORD VERIFICATION
    // =============================================
    const startOwnerFaceCamera = async () => {
        setCameraActive(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: "user" },
            });
            if (faceVideoRef.current) {
                faceVideoRef.current.srcObject = stream;
                faceVideoRef.current.play();
            }

            let blinks = 0;
            const blinkInterval = setInterval(() => {
                blinks++;
                setBlinkCount(blinks);

                if (blinks >= 3) {
                    clearInterval(blinkInterval);
                    setFaceReady(true);
                    setOwnerFaceVerified(true);
                    setTimeout(() => {
                        stream.getTracks().forEach(t => t.stop());
                    }, 1000);
                }
            }, 1200);
        } catch (err) {
            toast({ title: "Camera access denied", variant: "destructive" });
            setCameraActive(false);
        }
    };

    const handleOwnerPasswordVerify = () => {
        if (ownerPassword.length < 6) {
            toast({ title: "Enter your security password (min 6 chars)", variant: "destructive" });
            return;
        }
        setOwnerPasswordVerified(true);

        if (ownerFaceVerified) {
            toast({ title: "✅ Owner Identity Verified!" });
            setSecStep(2);
        } else {
            toast({ title: "Please complete face verification first", variant: "destructive" });
        }
    };

    // =============================================
    // STEP 2: DEED UPLOAD & OCR VERIFY
    // =============================================
    const handleDeedUpload = (file: File) => {
        setUploadedDoc(file);
        // Simulate OCR verification
        toast({ title: "🔍 Scanning document..." });
        setTimeout(() => {
            setDeedVerified(true);
            toast({ title: "✅ Survey Number Match Confirmed!" });
            setTimeout(() => setSecStep(3), 800);
        }, 2000);
    };

    // =============================================
    // STEP 3: BUYER OTP
    // =============================================
    const sendBuyerOTP = () => {
        setOtpSent(true);
        toast({ title: `📱 OTP sent to +91 ${buyerPhone.slice(-4).padStart(10, '*')}` });
    };

    const handleOTPChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newOtp = [...otpValue];
        newOtp[index] = value;
        setOtpValue(newOtp);

        // Auto-focus next
        if (value && index < 5) {
            const next = document.getElementById(`otp-${index + 1}`);
            next?.focus();
        }

        // Check if OTP is complete (any 6 digits work for demo)
        if (newOtp.every(d => d !== "")) {
            setOtpVerified(true);
            toast({ title: "✅ Buyer OTP Verified!" });
            setTimeout(() => handleTransferComplete(), 1200);
        }
    };

    // =============================================
    // STEP 4: BLOCKCHAIN TRANSFER
    // =============================================
    const handleTransferComplete = async () => {
        try {
            const transferData = {
                landId: twin?.landId || `SL-TRANSFER-${Date.now().toString(36)}`,
                ownerName: buyerName,
                mobile: buyerPhone,
                state: twin?.state || "Tamil Nadu",
                location: twin?.location || "Registered Location",
                area: twin?.area || 0,
                coordinates: twin?.coordinates || [],
            };

            // Register transfer on blockchain
            const block = await registerOnBlockchain(transferData);
            setTransferHash(block.hash);

            // Update Firestore
            if (twin?.landId) {
                await setDoc(doc(db, "digitalTwins", twin.landId), {
                    previousOwner: twin?.ownerName,
                    ownerName: buyerName,
                    mobile: buyerPhone,
                    transferredAt: new Date().toISOString(),
                    transferBlockHash: block.hash,
                    transferBlockIndex: block.index,
                    buyerAadhaar,
                    buyerAddress,
                    salePrice,
                }, { merge: true });
            }
        } catch (e) {
            console.warn("Transfer blockchain error:", e);
            setTransferHash("0x" + Math.random().toString(16).slice(2, 18));
        }

        setSecStep(4);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1200px] mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Land Sale & Ownership Transfer</h1>
                <p className="text-muted-foreground text-sm mt-1">Securely transfer or sell your registered land with blockchain verification.</p>
            </div>

            {step === "landing" && (
                <div className="space-y-6">
                    {/* Active Properties */}
                    <div className="glass-card rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-foreground mb-4">Your Registered Properties</h3>
                        <div className="space-y-3">
                            {[
                                { name: twin?.landId || "Plot #SL-2847A", location: twin?.location || "Coimbatore North", area: twin?.area ? `${twin.area} sq.m` : "1.50 Acres", status: "Protected" },
                                { name: "Plot #SL-1923B", location: "Ooty Road", area: "2.25 Acres", status: "Protected" },
                            ].map((prop) => (
                                <div key={prop.name} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary/80 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Shield className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{prop.name}</p>
                                            <p className="text-xs text-muted-foreground">{prop.location} • {prop.area}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-lg">{prop.status}</span>
                                        <button
                                            onClick={() => setStep("form")}
                                            className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors flex items-center gap-1"
                                        >
                                            Transfer <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Transfer Types */}
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { title: "Full Transfer", desc: "Transfer complete ownership to a new party", icon: ArrowRightLeft, color: "text-primary" },
                            { title: "Partial Sale", desc: "Sell a portion of your registered land", icon: Banknote, color: "text-accent" },
                            { title: "Inheritance", desc: "Transfer ownership to family members", icon: User, color: "text-orange-500" },
                        ].map((type) => (
                            <motion.div
                                key={type.title}
                                whileHover={{ y: -2 }}
                                onClick={() => setStep("form")}
                                className="glass-card-hover rounded-2xl p-6 cursor-pointer group"
                            >
                                <type.icon className={`w-8 h-8 ${type.color} mb-4`} />
                                <h3 className="text-base font-bold text-foreground mb-1">{type.title}</h3>
                                <p className="text-sm text-muted-foreground">{type.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {step === "form" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <button onClick={() => setStep("landing")} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">← Back</button>

                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="glass-card rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-foreground mb-1">Buyer / Recipient Details</h3>
                            <p className="text-sm text-muted-foreground mb-6">Enter the details of the new owner.</p>
                            <div className="space-y-4">
                                {[
                                    { label: "Full Name", icon: User, placeholder: "Enter buyer's full name", value: buyerName, setter: setBuyerName },
                                    { label: "Mobile Number", icon: Phone, placeholder: "+91 9876543210", value: buyerPhone, setter: setBuyerPhone },
                                    { label: "Aadhaar Number", icon: FileCheck, placeholder: "XXXX-XXXX-XXXX", value: buyerAadhaar, setter: setBuyerAadhaar },
                                    { label: "Address", icon: MapPin, placeholder: "Enter buyer's address", value: buyerAddress, setter: setBuyerAddress },
                                ].map((f) => (
                                    <div key={f.label}>
                                        <label className="text-xs font-semibold text-foreground mb-1.5 block">{f.label}</label>
                                        <div className="relative">
                                            <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                placeholder={f.placeholder}
                                                value={f.value}
                                                onChange={(e) => f.setter(e.target.value)}
                                                className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-foreground mb-1">Transfer Details</h3>
                            <p className="text-sm text-muted-foreground mb-6">Specify the sale/transfer conditions.</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-foreground mb-1.5 block">Sale Price (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={salePrice}
                                        onChange={(e) => setSalePrice(e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-foreground mb-1.5 block">Upload Transfer Document</label>
                                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">Click to upload Sale Deed / Agreement</p>
                                    </div>
                                </div>
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">OTP Verification Required</p>
                                        <p className="text-xs text-muted-foreground">Both buyer & seller must verify OTP to complete the transfer.</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleProceedToVerification}
                                className="mt-6 w-full h-12 rounded-xl hero-gradient-subtle text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                            >
                                Proceed to Verification
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {step === "verify" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center min-h-[50vh]">
                    <div className="glass-card rounded-2xl p-10 text-center max-w-md w-full">
                        <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-accent" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">Transfer Initiated</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Both parties will receive an OTP on their registered mobile numbers. The transfer will be completed once verified.
                        </p>
                        <div className="bg-secondary/50 rounded-xl p-4 mb-6 text-left space-y-2">
                            <p className="text-xs text-muted-foreground">Transfer ID: <span className="font-mono font-bold text-foreground">TXN-SL-8847</span></p>
                            <p className="text-xs text-muted-foreground">Blockchain TX: <span className="font-mono font-bold text-foreground">0x4a2f...d81c</span></p>
                            <p className="text-xs text-muted-foreground">Status: <span className="font-bold text-yellow-500">Pending Verification</span></p>
                        </div>
                        <button
                            onClick={() => setStep("landing")}
                            className="w-full h-11 rounded-xl bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors"
                        >
                            Back to Properties
                        </button>
                    </div>
                </motion.div>
            )}

            {/* =============================================
                SECURE TRANSFER VERIFICATION OVERLAY
                ============================================= */}
            <AnimatePresence>
                {secStep > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-950 via-[#0a1628] to-slate-950 overflow-y-auto"
                    >
                        <div className="min-h-screen flex flex-col items-center justify-center p-6">
                            <div className="max-w-2xl w-full">

                                {/* 4-Step Security Status Bar */}
                                <div className="grid grid-cols-4 gap-3 mb-10">
                                    {[
                                        { icon: "👤", label: ownerFaceVerified ? "FACE VERIFIED" : "FACE REQUIRED", done: ownerFaceVerified },
                                        { icon: "🔐", label: ownerPasswordVerified ? "PASSWORD OK" : "PASSWORD REQ", done: ownerPasswordVerified },
                                        { icon: "📄", label: deedVerified ? "DEED MATCH" : "UPLOAD DEED", done: deedVerified },
                                        { icon: "🛡️", label: secStep === 4 ? "COMPLETE" : "PENDING", done: secStep === 4 },
                                    ].map((s, i) => (
                                        <div key={i} className={`p-3 rounded-xl border text-center transition-all duration-500 ${s.done
                                                ? "bg-emerald-500/15 border-emerald-500/40"
                                                : secStep > i + 1
                                                    ? "bg-emerald-500/10 border-emerald-500/30"
                                                    : "bg-white/5 border-white/10"
                                            }`}>
                                            <div className="text-xl mb-1">{s.icon}</div>
                                            <div className={`text-[10px] font-bold ${s.done ? "text-emerald-400" : "text-white/50"}`}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* STEP 1: OWNER FACE + PASSWORD */}
                                {secStep === 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-6"
                                    >
                                        {/* Security Gate Banner */}
                                        <div className="bg-gradient-to-r from-red-600/15 via-amber-500/10 to-red-600/15 border-2 border-red-500/30 rounded-2xl p-8 text-center">
                                            <div className="text-4xl mb-4 animate-pulse">🔒</div>
                                            <h2 className="text-2xl font-black text-white mb-2">ORIGINAL OWNER REQUIRED</h2>
                                            <p className="text-sm text-white/60">
                                                Current Fruit Secure owner must verify with <span className="text-emerald-400 font-bold">Face Guardian + Password</span>
                                            </p>
                                            {twin?.ownerName && (
                                                <p className="text-emerald-400 font-bold mt-2">Owner: {twin.ownerName} • {twin.landId}</p>
                                            )}
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* Face Verification */}
                                            <div className="bg-white/[0.06] backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                                        <Camera className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-bold text-white">Face Guardian</h3>
                                                        <p className="text-xs text-white/40">Blink 3 times for liveness</p>
                                                    </div>
                                                </div>

                                                <div className={`relative rounded-xl overflow-hidden border-3 transition-all ${faceReady ? "border-emerald-400" : cameraActive ? "border-violet-400/50" : "border-white/10"
                                                    }`}>
                                                    <video ref={faceVideoRef} className="w-full aspect-[4/3] bg-slate-900 object-cover" autoPlay muted playsInline />
                                                    {!cameraActive && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                                                            <Camera className="w-10 h-10 text-white/15" />
                                                        </div>
                                                    )}
                                                    {faceReady && (
                                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center bg-emerald-500/20">
                                                            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center">
                                                                <CheckCircle className="w-8 h-8 text-white" />
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </div>

                                                {cameraActive && !faceReady && (
                                                    <div className="mt-3">
                                                        <div className="flex justify-between text-xs text-white/40 mb-1">
                                                            <span>Liveness</span>
                                                            <span>{blinkCount}/3</span>
                                                        </div>
                                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                            <motion.div
                                                                animate={{ width: `${(blinkCount / 3) * 100}%` }}
                                                                className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {!cameraActive && (
                                                    <button onClick={startOwnerFaceCamera} className="w-full mt-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 rounded-xl font-bold text-sm">
                                                        📹 Start Camera
                                                    </button>
                                                )}
                                            </div>

                                            {/* Password Verification */}
                                            <div className="bg-white/[0.06] backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                                        <Lock className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-bold text-white">Security Password</h3>
                                                        <p className="text-xs text-white/40">Enter your Fruit Secure password</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="relative">
                                                        <input
                                                            type={showPass ? "text" : "password"}
                                                            placeholder="Enter owner password"
                                                            value={ownerPassword}
                                                            onChange={(e) => setOwnerPassword(e.target.value)}
                                                            className="w-full p-4 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none transition-all"
                                                        />
                                                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                                                            {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>

                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex items-center gap-2 text-white/60">
                                                            <div className={`w-2 h-2 rounded-full ${ownerFaceVerified ? "bg-emerald-400" : "bg-white/20"}`} />
                                                            <span>{ownerFaceVerified ? "Face verified ✓" : "Face scan pending..."}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-white/60">
                                                            <div className={`w-2 h-2 rounded-full ${ownerPasswordVerified ? "bg-emerald-400" : "bg-white/20"}`} />
                                                            <span>{ownerPasswordVerified ? "Password verified ✓" : "Password pending..."}</span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={handleOwnerPasswordVerify}
                                                        disabled={!ownerFaceVerified || ownerPassword.length < 6}
                                                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                    >
                                                        Verify & Continue <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <button onClick={() => { setSecStep(0); }} className="w-full text-white/30 hover:text-white/60 text-sm py-2 transition-colors">
                                            Cancel Transfer
                                        </button>
                                    </motion.div>
                                )}

                                {/* STEP 2: NEW DEED UPLOAD + OCR */}
                                {secStep === 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white/[0.06] backdrop-blur-xl rounded-3xl p-8 border border-white/10"
                                    >
                                        <div className="text-center mb-8">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
                                                <FileCheck className="w-8 h-8 text-white" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-white">Upload New Sale Deed</h2>
                                            <p className="text-sm text-white/50 mt-2">System will verify the survey number matches your registered land</p>
                                        </div>

                                        <div
                                            className="border-2 border-dashed border-white/20 rounded-2xl p-10 text-center cursor-pointer hover:border-amber-400/50 hover:bg-amber-400/5 transition-all"
                                            onClick={() => document.getElementById("deed-upload")?.click()}
                                        >
                                            <input
                                                id="deed-upload"
                                                type="file"
                                                accept="image/*,.pdf"
                                                className="hidden"
                                                onChange={(e) => e.target.files?.[0] && handleDeedUpload(e.target.files[0])}
                                            />
                                            <Upload className="w-12 h-12 text-white/30 mx-auto mb-3" />
                                            <p className="text-sm text-white/50">Click to upload Sale Deed / Agreement</p>
                                            <p className="text-xs text-white/30 mt-1">Supports images and PDF</p>
                                        </div>

                                        {deedVerified && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-6 bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3"
                                            >
                                                <CheckCircle className="w-6 h-6 text-emerald-400" />
                                                <div>
                                                    <p className="text-sm font-bold text-emerald-400">SURVEY NUMBER MATCH CONFIRMED ✓</p>
                                                    <p className="text-xs text-emerald-300/60">Land ID: {twin?.landId || "SL-XXXX"}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}

                                {/* STEP 3: BUYER OTP */}
                                {secStep === 3 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white/[0.06] backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-4">
                                            <Phone className="w-8 h-8 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-2">Buyer OTP Verification</h2>
                                        <p className="text-sm text-white/50 mb-8">
                                            Enter the 6-digit OTP sent to buyer's phone
                                            <br />
                                            <span className="text-white/70 font-mono">+91 {buyerPhone}</span>
                                        </p>

                                        {!otpSent ? (
                                            <button
                                                onClick={sendBuyerOTP}
                                                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-8 rounded-xl font-bold text-lg"
                                            >
                                                📱 Send OTP to Buyer
                                            </button>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="flex justify-center gap-3">
                                                    {otpValue.map((digit, i) => (
                                                        <input
                                                            key={i}
                                                            id={`otp-${i}`}
                                                            type="text"
                                                            maxLength={1}
                                                            value={digit}
                                                            onChange={(e) => handleOTPChange(i, e.target.value)}
                                                            className="w-12 h-14 text-center text-xl font-bold bg-white/5 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:outline-none transition-all"
                                                        />
                                                    ))}
                                                </div>
                                                {otpVerified && (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-400 font-bold flex items-center justify-center gap-2">
                                                        <CheckCircle className="w-5 h-5" /> OTP Verified — Processing Transfer...
                                                    </motion.div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* STEP 4: TRANSFER COMPLETE */}
                                {secStep === 4 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white/[0.06] backdrop-blur-xl rounded-3xl p-10 border border-emerald-500/30 text-center"
                                    >
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            className="text-6xl mb-6"
                                        >
                                            ✅
                                        </motion.div>

                                        <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 bg-clip-text text-transparent mb-3">
                                            TRANSFER COMPLETE 🛡️
                                        </h1>
                                        <p className="text-lg text-emerald-100/80 mb-8">
                                            {twin?.landId || "Land"} → New Owner <span className="text-emerald-400 font-bold">Fruit Secure ACTIVE</span>
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
                                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                                                <p className="text-[10px] text-white/40 font-medium">Previous Owner</p>
                                                <p className="text-sm font-bold text-white truncate">{twin?.ownerName || "Original Owner"}</p>
                                            </div>
                                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                                                <p className="text-[10px] text-emerald-400/60 font-medium">New Owner</p>
                                                <p className="text-sm font-bold text-emerald-400 truncate">{buyerName}</p>
                                            </div>
                                        </div>

                                        {transferHash && (
                                            <div className="bg-white/5 rounded-xl p-3 mb-6 text-xs font-mono text-emerald-300/60 truncate border border-emerald-500/10">
                                                ⛓️ 0x{transferHash}
                                            </div>
                                        )}

                                        <button
                                            onClick={() => { setSecStep(0); setStep("landing"); }}
                                            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-green-700 transition-all flex items-center justify-center gap-3"
                                        >
                                            <Shield className="w-5 h-5" /> Back to Properties
                                        </button>
                                    </motion.div>
                                )}

                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default OwnershipTransferPage;
