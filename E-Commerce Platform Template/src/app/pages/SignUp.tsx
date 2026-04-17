import { Link, useNavigate } from "react-router";
import { Chrome, Facebook, Loader2 } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useState } from "react";
import { authService } from "../api/auth.service";
import { toast } from "sonner";
import ReCAPTCHA from "react-google-recaptcha";

export function SignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        recaptchaToken: captchaToken || ""
      });

      // Extract userId from response string "User registered successfully with ID: {userId}"
      // Or if the backend returns just ID, it's easier. 
      // Based on AuthController: return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully with ID: " + userId);
      const userId = response.split(": ").pop();

      toast.success("Account created! Let's set up your profile.");
      navigate("/setup-profile", { state: { userId } });
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Form */}
        <Card>
          <CardContent className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl text-gray-900 dark:text-white mb-2">Create Account</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="text-[#FF6B35] hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
                <Input
                  label="Last Name"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
              <Input
                label="Username"
                type="text"
                placeholder="johndoe123"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="+216 12 345 678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />

              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                  className="w-4 h-4 mt-1 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                  required
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  I agree to the{" "}
                  <Link to="#" className="text-[#FF6B35] hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="#" className="text-[#FF6B35] hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {/* reCAPTCHA Section */}
              <div className="space-y-3 mb-6">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Please complete the security check:
                </p>
                <div className="flex justify-center bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-white/10">
                  <ReCAPTCHA
                    sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                    onChange={(token) => setCaptchaToken(token)}
                    theme="light"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-lg font-semibold bg-[#FF6B35] hover:bg-[#ff8c5a] text-white rounded-xl" disabled={loading || !captchaToken}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-[#0F3460] text-gray-500 dark:text-gray-400">
                  Or sign up with
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
          </CardContent>
        </Card>

        {/* Right Side - Branding */}
        <div className="hidden md:block">
          <div className="bg-gradient-to-br from-[#00D4FF] to-[#FF6B35] rounded-3xl p-12 text-white">
            <h2 className="text-4xl mb-4">Join VendHub Today!</h2>
            <p className="text-xl text-white/90 mb-8">
              Create an account and unlock access to exclusive products, events, and member benefits.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                <span>Access to exclusive deals</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                <span>Early event ticket access</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                <span>Order tracking & history</span>
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1557821552-17105176677c?w=500"
              alt="Shopping"
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
