import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { motion, AnimatePresence } from "motion/react";
import { X, ScanFace, Loader2, Camera, AlertCircle, CheckCircle2 } from "lucide-react";

interface FaceIdModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetImageUrl: string;
    onSuccess: () => void;
    username: string;
}

export const FaceIdModal = ({ isOpen, onClose, targetImageUrl, onSuccess, username }: FaceIdModalProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [status, setStatus] = useState<"loading" | "scanning" | "success" | "error">("loading");
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const [targetDescriptor, setTargetDescriptor] = useState<Float32Array | null>(null);
    const [isProcessingTarget, setIsProcessingTarget] = useState(false);

    // Models are loaded from a public URI (CDN)
    const MODEL_URL = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/";

    useEffect(() => {
        if (isOpen) {
            loadModels();
        } else {
            stopVideo();
            setTargetDescriptor(null);
            setProgress(0);
        }
    }, [isOpen]);

    const loadModels = async () => {
        try {
            setStatus("loading");
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            ]);
            setIsModelsLoaded(true);
            startVideo();
            if (targetImageUrl) {
                processTargetImage();
            }
        } catch (err) {
            console.error("Error loading models:", err);
            setError("Failed to load FaceID models. Please check your internet connection.");
            setStatus("error");
        }
    };

    const processTargetImage = async () => {
        try {
            setIsProcessingTarget(true);
            const img = await faceapi.fetchImage(targetImageUrl);
            const detections = await faceapi
                .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detections) {
                setTargetDescriptor(detections.descriptor);
            } else {
                setError("Your profile image is not suitable for FaceID verification. Please use a clear portrait.");
                setStatus("error");
            }
        } catch (err) {
            console.error("Error processing target image:", err);
            setError("Failed to process your profile image.");
            setStatus("error");
        } finally {
            setIsProcessingTarget(false);
        }
    };

    const startVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Wait for video to actually start playing
                videoRef.current.onloadedmetadata = () => {
                    setStatus("scanning");
                    setIsScanning(true);
                };
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Camera access denied. Please enable camera permissions.");
            setStatus("error");
        }
    };

    const stopVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsScanning(false);
    };

    useEffect(() => {
        let interval: any;
        if (isScanning && isModelsLoaded && targetDescriptor) {
            interval = setInterval(async () => {
                handleFaceScan();
            }, 100); // Faster scan loop
        }
        return () => clearInterval(interval);
    }, [isScanning, isModelsLoaded, targetDescriptor]);

    const handleFaceScan = async () => {
        if (!videoRef.current || !targetDescriptor) return;

        try {
            // Detect face in video
            const detections = await faceapi
                .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detections) {
                setProgress((prev) => Math.max(0, prev - 2));
                return;
            }

            // Compare descriptors
            const distance = faceapi.euclideanDistance(detections.descriptor, targetDescriptor);

            // distance < 0.6 is typical threshold for "same person"
            if (distance < 0.5) {
                setProgress((prev) => {
                    const next = prev + 5;
                    if (next >= 100) {
                        handleSuccess();
                        return 100;
                    }
                    return next;
                });
            } else {
                setProgress((prev) => Math.max(0, prev - 5));
            }
        } catch (err) {
            console.error("Face scan error:", err);
        }
    };

    const handleSuccess = () => {
        setStatus("success");
        setIsScanning(false); // Stop the beam
        stopVideo(); // Stop camera immediately
        setTimeout(() => {
            onSuccess();
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-[#1A1A2E] rounded-[2rem] shadow-2xl overflow-hidden max-w-md w-full relative border border-white/20"
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 hover:bg-gray-200 transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 flex flex-col items-center">
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">FaceID Verification</h2>
                        <p className="text-gray-500 dark:text-gray-400">Verifying identity for <b>{username}</b></p>
                    </div>

                    <div className="relative w-72 h-72 mb-8">
                        {/* Circular Progress Bar Outer */}
                        <svg className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] rotate-[-90deg] drop-shadow-[0_0_15px_rgba(255,107,53,0.3)]">
                            <circle
                                cx="50%"
                                cy="50%"
                                r="46%"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-gray-100/20 dark:text-white/5"
                            />
                            <motion.circle
                                cx="50%"
                                cy="50%"
                                r="46%"
                                fill="none"
                                stroke="url(#gradient)"
                                strokeWidth="6"
                                strokeDasharray="100 100"
                                animate={{ strokeDashoffset: 100 - progress }}
                                transition={{ duration: 0.3 }}
                                strokeLinecap="round"
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#FF6B35" />
                                    <stop offset="100%" stopColor="#00D4FF" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Camera Frame (Circle) */}
                        <div className="absolute inset-0 rounded-full border-2 border-white/20 p-2 overflow-hidden bg-black shadow-inner">
                            <motion.div
                                animate={status === "scanning" ? { scale: [1, 1.02, 1], opacity: [0.8, 1, 0.8] } : {}}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-full h-full rounded-full overflow-hidden relative"
                            >
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover scale-x-[-1]"
                                />

                                {/* Scanning Animation Beam */}
                                {status === "scanning" && (
                                    <>
                                        <motion.div
                                            animate={{ top: ["0%", "100%", "0%"] }}
                                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF6B35] to-transparent z-10 shadow-[0_0_20px_rgba(255,107,53,1)]"
                                        />
                                        {/* Radial Grid effect */}
                                        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(255,107,53,0.2)_100%)]" />
                                    </>
                                )}

                                {/* Overlays based on status */}
                                <AnimatePresence>
                                    {(status === "loading" || isProcessingTarget) && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4 text-center backdrop-blur-md"
                                        >
                                            <div className="relative">
                                                <div className="w-16 h-16 border-4 border-t-[#FF6B35] border-white/10 rounded-full animate-spin mb-4" />
                                                <ScanFace className="absolute inset-0 m-auto w-6 h-6 text-[#FF6B35]" />
                                            </div>
                                            <p className="text-sm font-medium tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">
                                                {isProcessingTarget ? "Analyzing ID..." : "Initializing..."}
                                            </p>
                                        </motion.div>
                                    )}

                                    {status === "success" && (
                                        <motion.div
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/80 backdrop-blur-sm text-white"
                                        >
                                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-2 animate-bounce">
                                                <CheckCircle2 className="w-12 h-12" />
                                            </div>
                                            <p className="text-xl font-bold tracking-tight">Identity Verified</p>
                                        </motion.div>
                                    )}

                                    {status === "error" && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/90 text-white p-6 text-center backdrop-blur-sm"
                                        >
                                            <AlertCircle className="w-12 h-12 mb-3 animate-pulse" />
                                            <p className="text-sm font-medium mb-4 leading-tight">{error}</p>
                                            <button
                                                onClick={() => { setError(null); loadModels(); }}
                                                className="px-6 py-2 bg-white text-red-600 rounded-full text-sm font-bold shadow-lg hover:bg-gray-100 transition-all active:scale-95"
                                            >
                                                Retry Scan
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>

                        {/* Corner Brackets */}
                        <div className="absolute -inset-2 pointer-events-none">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#FF6B35] rounded-tl-xl" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#FF6B35] rounded-tr-xl" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#FF6B35] rounded-bl-xl" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#FF6B35] rounded-br-xl" />
                        </div>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="flex items-center justify-between text-xs tracking-widest uppercase mb-1 px-2">
                            <span className="text-gray-500 dark:text-gray-400 font-bold">Biometric Match</span>
                            <span className="text-[#FF6B35] font-black">{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-gradient-to-r from-[#FF6B35] via-[#ff8c5a] to-[#00D4FF] shadow-[0_0_10px_rgba(255,107,53,0.5)]"
                            />
                        </div>
                    </div>

                    <p className="mt-8 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
                        <Camera className="w-4 h-4 mr-2" />
                        Keep your face within the circle and stay still.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};
