import { Link } from "react-router";
import { Package, Calendar, ShoppingBag, Heart, Bell, Settings as SettingsIcon, Shield, Loader2, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { mockEvents } from "../../data/mockData";
import { formatCurrency, formatDate } from "../../lib/utils";
import { useState, useEffect, useRef } from "react";
import { authService, getUserFromToken } from "../../api/auth.service";
import { recommendationService, InteractionStats } from "../../api/recommendation.service";
import { Product, productService } from "../../api/product.service";
import { Commande, orderService } from "../../api/order.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/Dialog";
import { Switch } from "../../components/ui/switch";
import { toast } from "sonner";

export function UserDashboard() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isLoading2FA, setIsLoading2FA] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [interactionStats, setInteractionStats] = useState<InteractionStats | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Commande[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = getUserFromToken();

  const upcomingEvents = mockEvents.slice(0, 2);

  useEffect(() => {
    if (user?.sub) {
      check2FAStatus();
      fetchProfile();
      
      recommendationService.getInteractionStats()
        .then(setInteractionStats)
        .catch(() => {});
      productService.getFavoritesCount()
        .then(setFavoritesCount)
        .catch(() => {});
      
      
      setLoadingRecommendations(true);
      recommendationService.getPersonalizedRecommendations(6)
        .then(setRecommendations)
        .catch(() => {})
        .finally(() => setLoadingRecommendations(false));

      orderService.getCommandesByClientId(user.sub)
        .then((orders) => setRecentOrders(orders.slice(0, 3)))
        .catch(() => setRecentOrders([]));
    }
  }, [user?.sub]);

  const fetchProfile = async () => {
    try {
      const data = await authService.getUser(user.sub, { skipAuthRedirect: true, omitAuthHeader: true });
      setProfile(data);
    } catch (error) {
      console.error("Failed to fetch profile", error);
    }
  };

  const check2FAStatus = async () => {
    try {
      const response = await authService.get2FAStatus(user.sub, { skipAuthRedirect: true });
      setIs2FAEnabled(response.enabled);
    } catch (error) {
      console.error("Failed to fetch 2FA status", error);
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    setIsLoading2FA(true);
    try {
      if (enabled) {
        await authService.enable2FA(user.sub);
        toast.success("2FA requirements enabled! You'll be asked to set it up on your next login.");
        setIs2FAEnabled(true);
      } else {
        await authService.disable2FA(user.sub);
        toast.info("2FA has been disabled.");
        setIs2FAEnabled(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update 2FA status");
    } finally {
      setIsLoading2FA(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.sub) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file.");
      return;
    }

    setIsUploadingPhoto(true);
    const toastId = toast.loading("Uploading your new profile photo...");

    try {
      const response = await authService.updateProfileImage(user.sub, file);
      toast.success("Profile photo updated successfully!", { id: toastId });

      // Refresh profile to show new image
      fetchProfile();

      // Update Navbar image by triggering auth-change
      window.dispatchEvent(new Event("auth-change"));
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image", { id: toastId });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const stats = [
    { label: "Total Orders", value: recentOrders.length.toString(), icon: ShoppingBag, color: "from-blue-500 to-blue-600" },
    { label: "Active Events", value: "3", icon: Calendar, color: "from-purple-500 to-purple-600" },
    { label: "Products Viewed", value: interactionStats?.CLICK?.toString() || "0", icon: Package, color: "from-cyan-500 to-cyan-600" },
    { label: "Wishlist Items", value: favoritesCount.toString(), icon: Heart, color: "from-pink-500 to-pink-600" },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "info"> = {
      delivered: "success",
      in_transit: "info",
      processing: "warning",
    };
    return variants[status] || "default";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 dark:text-white mb-2">Welcome back, {user?.name || "User"}!</h1>
          <p className="text-gray-600 dark:text-gray-400">Here's what's happening with your account</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="flex items-center">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mr-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Link to="/orders">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <Link key={order.id} to={`/orders/${order.id}`}>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1F4068] rounded-lg hover:bg-gray-100 dark:hover:bg-[#2C5282] transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#00D4FF] rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-gray-900 dark:text-white">Order #{order.id}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{order.lignesCommande?.length || 0} items • {formatDate(order.createdAt || new Date().toISOString())}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-900 dark:text-white mb-1">{formatCurrency(order.prixTotal || 0)}</p>
                          <Badge variant={getStatusBadge(order.status)}>
                            {order.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {recentOrders.length === 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">No orders yet. Start shopping to create your first order.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Link to="/products">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                      <ShoppingBag className="w-6 h-6 mb-1" />
                      <span className="text-xs">Shop</span>
                    </Button>
                  </Link>
                  <Link to="/events">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                      <Calendar className="w-6 h-6 mb-1" />
                      <span className="text-xs">Events</span>
                    </Button>
                  </Link>
                  <Link to="/support">
                    <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                      <Bell className="w-6 h-6 mb-1" />
                      <span className="text-xs">Support</span>
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col items-center justify-center text-gray-700 dark:text-gray-200"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    <SettingsIcon className="w-6 h-6 mb-1" />
                    <span className="text-xs">Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <Link key={event.id} to={`/events/${event.id}`}>
                      <div className="flex space-x-3 p-3 bg-gray-50 dark:bg-[#1F4068] rounded-lg hover:bg-gray-100 dark:hover:bg-[#2C5282] transition-colors">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#00D4FF] rounded-lg flex flex-col items-center justify-center text-white shrink-0">
                          <span className="text-lg">{new Date(event.date).getDate()}</span>
                          <span className="text-xs">{new Date(event.date).toLocaleString("en-US", { month: "short" })}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white line-clamp-2">{event.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{event.time}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link to="/events">
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    Browse More Events
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <div
                    onClick={handlePhotoClick}
                    className="relative group w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#00D4FF] flex items-center justify-center text-white text-xl overflow-hidden border-2 border-white dark:border-white/10 shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  >
                    {profile?.imageUrl ? (
                      <img src={profile.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.split(' ').map((n: any) => n[0]).join('') || "JD"
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      {isUploadingPhoto ? (
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      ) : (
                        <Camera className="w-6 h-6 text-white" />
                      )}
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white">{profile?.firstName ? `${profile.firstName} ${profile.lastName}` : (user?.name || "John Doe")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{profile?.email || user?.email || "john.doe@example.com"}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Member Since</span>
                    <span className="text-gray-900 dark:text-white">Nov 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Spent</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(2899.88)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Personalized Recommendations */}
        {recommendations.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✨ Recommended for You
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRecommendations ? (
                <p className="text-gray-600 dark:text-gray-400">Loading recommendations...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.map((product) => (
                    <Link key={product.id} to={`/products/${product.id}`}>
                      <Card hover>
                        <div className="relative">
                          <img
                            src={product.imageUrl || "https://via.placeholder.com/300x200"}
                            alt={product.name}
                            className="w-full h-40 object-cover rounded-t-lg"
                          />
                        </div>
                        <CardContent className="pt-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.category}</p>
                          <h4 className="text-sm text-gray-900 dark:text-white mb-2 line-clamp-2">{product.name}</h4>
                          {product.tags && product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {product.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded">{tag}</span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-lg text-[#FF6B35] font-bold">{formatCurrency(product.price)}</span>
                            <Badge variant={product.status ? "success" : "danger"} className="text-xs">
                              {product.status ? "In Stock" : "Out"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Settings Modal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#1A1A2E] border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2 text-gray-900 dark:text-white">
              <SettingsIcon className="w-6 h-6 text-[#FF6B35]" />
              Account Settings
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Manage your security preferences and account settings.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#16213E] rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Enhance your account security</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isLoading2FA && <Loader2 className="w-4 h-4 animate-spin text-[#FF6B35]" />}
                <Switch
                  checked={is2FAEnabled}
                  onCheckedChange={handleToggle2FA}
                  disabled={isLoading2FA}
                />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white">About 2FA</p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-4">
                <li>When enabled, you'll need to provide an OTP code during login.</li>
                <li>Uses Time-based One-Time Password (TOTP) standards.</li>
                <li>Compatible with Google Authenticator, Authy, etc.</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="primary"
              className="bg-[#FF6B35] hover:bg-[#e85a24] text-white"
              onClick={() => setIsSettingsOpen(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
