import { Link, useNavigate } from "react-router";
import { Lock, Chrome, Facebook, Loader2, ScanFace } from "lucide-react";
import { FaceIdModal } from "../components/auth/FaceIdModal";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { useState, useEffect } from "react";
import { authService, getUserFromToken } from "../api/auth.service";
import { toast } from "sonner";
import ReCAPTCHA from "react-google-recaptcha";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showMfa, setShowMfa] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "", totp: "", remember: false });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [faceIdActive, setFaceIdActive] = useState(false);
  const [targetImageUrl, setTargetImageUrl] = useState("");

  // Load remembered username
  useEffect(() => {
    const rememberedUsername = localStorage.getItem("rememberedUsername");
    if (rememberedUsername) {
      setFormData(prev => ({ ...prev, username: rememberedUsername, remember: true }));
    }
  }, []);

  const handleRoleRedirection = (userObj: any, directRole?: string) => {
    console.log("Checking roles for redirection:", userObj);
    const roles: string[] = userObj?.roles || userObj?.realm_access?.roles || [];

    if (directRole && !roles.includes(directRole)) {
      roles.push(directRole);
    }

    if (roles.includes("ADMIN")) {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login({
        username: formData.username,
        password: formData.password,
        totp: formData.totp,
        recaptchaToken: captchaToken || ""
      });

      if (formData.remember) {
        localStorage.setItem("rememberedUsername", formData.username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      window.dispatchEvent(new Event("auth-change"));
      toast.success("Login successful!");

      const user = getUserFromToken();
      handleRoleRedirection(user, response.role);
    } catch (error: any) {
      const errorMessage = error.message || "";
      if (errorMessage.includes("MFA_REQUIRED") || errorMessage.includes("double authentification requise")) {
        setShowMfa(true);
        toast.info("Two-factor authentication required. Please enter your code.");
      } else if (errorMessage.includes("SETUP_REQUIRED")) {
        toast.error(errorMessage, {
          duration: 10000,
          action: {
            label: "Configure 2FA",
            onClick: () => window.open("http://localhost:8181/realms/micro_service_spring/account/", "_blank")
          }
        });
      } else {
        toast.error(errorMessage || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const realm = "micro_service_spring";
    const clientId = "micro_service_spring_client";
    const redirectUri = encodeURIComponent(window.location.origin + "/auth/callback");
    const keycloakUrl = `http://localhost:8181/realms/${realm}/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid&kc_idp_hint=google`;

    window.location.href = keycloakUrl;
  };

  const handleFacebookLogin = () => {
    const realm = "micro_service_spring";
    const clientId = "micro_service_spring_client";
    const redirectUri = encodeURIComponent(window.location.origin + "/auth/callback");
    const keycloakUrl = `http://localhost:8181/realms/${realm}/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid&kc_idp_hint=facebook`;

    window.location.href = keycloakUrl;
  };

  const handleFaceIdClick = async () => {
    if (!formData.username) {
      toast.error("Please enter your username first to use FaceID.");
      return;
    }

    try {
      setLoading(true);
      const user = await authService.getUserByUsername(formData.username);
      if (user.imageUrl) {
        setTargetImageUrl(user.imageUrl);
        setFaceIdActive(true);
      } else {
        toast.error("FaceID is not set up for this account. Please upload a profile image first.");
      }
    } catch (error) {
      toast.error("User not found or FaceID initialization failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleFaceIdSuccess = async () => {
    setFaceIdActive(false);
    try {
      setLoading(true);
      const response = await authService.loginByFaceId(formData.username);
      toast.success("FaceID verified! Identity confirmed.");

      // Role-based redirection for FaceID
      const user = getUserFromToken();
      handleRoleRedirection(user, (response as any).role);

      window.dispatchEvent(new Event("auth-change"));
    } catch (error: any) {
      toast.error(error.message || "FaceID login failed at session creation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden md:block">
          <div className="bg-gradient-to-br from-[#FF6B35] to-[#00D4FF] rounded-3xl p-12 text-white">
            <div className="flex items-center space-x-2 mb-8">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <span className="text-[#FF6B35] text-2xl">E</span>
              </div>
              <span className="text-2xl">EventShop</span>
            </div>
            <h2 className="text-4xl mb-4">Welcome Back!</h2>
            <p className="text-xl text-white/90 mb-8">
              Sign in to access your account and continue your shopping journey.
            </p>
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500"
              alt="Shopping"
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>

        {/* Right Side - Form */}
        <Card>
          <CardContent className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl text-gray-900 dark:text-white mb-2">Sign In</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link to="/signup" className="text-[#FF6B35] hover:underline">
                  Sign up
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              {!showMfa ? (
                <>
                  <Input
                    label="Username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.remember}
                        onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                        className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Remember me</span>
                    </label>
                    <a
                      href="http://127.0.0.1:8181/realms/micro_service_spring/login-actions/reset-credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#FF6B35] hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>

                  {/* reCAPTCHA Section with "Directions" */}
                  <div className="space-y-3 mb-6">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Please complete the security check below to proceed:
                    </p>
                    <div className="flex justify-center bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-white/10">
                      <ReCAPTCHA
                        sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                        onChange={(token) => setCaptchaToken(token)}
                        theme="light"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 text-lg font-semibold bg-[#FF6B35] hover:bg-[#ff8c5a] text-white rounded-xl transition-all shadow-lg shadow-[#FF6B35]/20" disabled={loading || !captchaToken}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </>
              ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-[#FF6B35]" />
                    </div>
                    <h3 className="text-xl font-semibold">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Please enter the 6-digit code from your authenticator app for <b>{formData.username}</b>.
                    </p>
                  </div>

                  <Input
                    label="Verification Code"
                    type="text"
                    placeholder="000 000"
                    value={formData.totp}
                    onChange={(e) => setFormData({ ...formData, totp: e.target.value })}
                    required
                    autoFocus
                    className="text-center text-2xl tracking-[0.5em] font-mono border-[#FF6B35] focus:ring-[#FF6B35]"
                    maxLength={6}
                  />

                  <div className="space-y-3">
                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Login"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={loading}
                      onClick={() => {
                        setShowMfa(false);
                        setFormData({ ...formData, totp: "" });
                      }}
                    >
                      Back to Login
                    </Button>
                  </div>
                </div>
              )}
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-[#0F3460] text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
                <Chrome className="w-5 h-5 mr-2" />
                Google
              </Button>
              <Button variant="outline" className="w-full" onClick={handleFacebookLogin}>
                <Facebook className="w-5 h-5 mr-2" />
                Facebook
              </Button>
            </div>

            <Button
              variant="outline"
              type="button"
              className="w-full mt-4 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white transition-all duration-300"
              onClick={handleFaceIdClick}
              disabled={loading}
            >
              <ScanFace className="w-5 h-5 mr-2" />
              Sign in with FaceID
            </Button>
          </CardContent>
        </Card>
      </div>

      <FaceIdModal
        isOpen={faceIdActive}
        onClose={() => setFaceIdActive(false)}
        username={formData.username}
        targetImageUrl={targetImageUrl}
        onSuccess={handleFaceIdSuccess}
      />
    </div>
  );
}
