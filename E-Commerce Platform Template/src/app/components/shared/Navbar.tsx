import { Link, useNavigate } from "react-router";
import { ShoppingCart, User, Search, Menu, Moon, Sun, LogOut, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { authService, getUserFromToken } from "../../api/auth.service";
import { productService } from "../../api/product.service";
import { cartStore } from "../../lib/cart";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);

      if (token) {
        try {
          const user = getUserFromToken();
          if (user?.sub) {
            const profileData = await authService.getUser(user.sub, { skipAuthRedirect: true, omitAuthHeader: true });
            setProfile(profileData);
          }
        } catch (error) {
          console.error("Failed to fetch profile in navbar", error);
        }
      } else {
        setProfile(null);
        setFavoritesCount(0);
      }
    };

    const fetchFavoritesCount = async () => {
      try {
        const count = await productService.getFavoritesCount();
        setFavoritesCount(count);
      } catch (error) {
        console.error("Failed to fetch favorites count", error);
      }
    };

    const syncCartCount = () => {
      setCartCount(cartStore.getCount());
    };

    const handleAuthChange = async () => {
      await checkAuth();
      const token = localStorage.getItem("token");
      if (token) {
        await fetchFavoritesCount();
      }
    };

    checkAuth();
    if (localStorage.getItem("token")) {
      fetchFavoritesCount();
    }
    syncCartCount();
    
    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", checkAuth);
    window.addEventListener("favorites-changed", fetchFavoritesCount);
    window.addEventListener(cartStore.eventName, syncCartCount);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("favorites-changed", fetchFavoritesCount);
      window.removeEventListener(cartStore.eventName, syncCartCount);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("auth-change"));
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-[#1A1A2E] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          {(() => {
            const user = getUserFromToken();
            const roles = user?.roles || user?.realm_access?.roles || [];
            const homePath = roles.includes("ADMIN") ? "/admin" : "/";
            return (
              <Link to={homePath} className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#00D4FF] rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">Vh</span>
                </div>
                <span className="text-xl text-[#2C3E50] dark:text-white">VendHub</span>
              </Link>
            );
          })()}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 ml-10">
            <Link to="/products" className="text-gray-700 dark:text-gray-300 hover:text-[#FF6B35] transition-colors">
              Products
            </Link>
            <Link to="/events" className="text-gray-700 dark:text-gray-300 hover:text-[#FF6B35] transition-colors">
              Events
            </Link>
            {isLoggedIn && (
              <Link to="/forums" className="text-gray-700 dark:text-gray-300 hover:text-[#FF6B35] transition-colors">
                Forum
              </Link>
            )}
            <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-[#FF6B35] transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-[#FF6B35] transition-colors">
              Contact
            </Link>
          </div>

          <div className="flex-1" /> {/* Spacer */}

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isLoggedIn && (
              <>
                <Link to="/favorites" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
                  <Heart className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 bg-[#FF6B35] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {favoritesCount}
                  </span>
                </Link>
                <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
                  <ShoppingCart className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 bg-[#FF6B35] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                </Link>
              </>
            )}

            {isLoggedIn && (() => {
              const user = getUserFromToken();
              const roles = user?.roles || user?.realm_access?.roles || [];
              return roles.includes("USER") ? (
                <>
                  <Link to="/dashboard" className="hidden md:flex items-center space-x-2 p-1 pr-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#FF6B35] to-[#00D4FF] flex items-center justify-center text-white text-xs shadow-sm">
                      {profile?.imageUrl ? (
                        <img src={profile.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {profile?.username || "My Account"}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="hidden md:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                    aria-label="Logout"
                  >
                    <LogOut className="w-6 h-6" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="hidden md:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              );
            })()}
            {!isLoggedIn && (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/login">
                  <Button size="sm">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" variant="outline">Sign Up</Button>
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-3">
              <Link to="/products" className="text-gray-700 dark:text-gray-300 hover:text-[#FF6B35] py-2">
                Products
              </Link>
              <Link to="/events" className="text-gray-700 dark:text-gray-300 hover:text-[#FF6B35] py-2">
                Events
              </Link>
              {isLoggedIn && (
                <Link to="/forums" className="text-gray-700 dark:text-gray-300 hover:text-[#FF6B35] py-2">
                  Forum
                </Link>
              )}
              <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-[#FF6B35] py-2">
                About
              </Link>
              <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-[#FF6B35] py-2">
                Contact
              </Link>
              {isLoggedIn ? (
                <>
                  <Link to="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-[#FF6B35] py-2">
                    Dashboard
                  </Link>
                  <Link to="/favorites" className="text-gray-700 dark:text-gray-300 hover:text-[#FF6B35] py-2">
                    Favorites
                  </Link>
                  <Link to="/cart" className="text-gray-700 dark:text-gray-300 hover:text-[#FF6B35] py-2">
                    Cart
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-gray-700 dark:text-gray-300 hover:text-[#FF6B35] py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="py-2">
                  <Button className="w-full" size="sm">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
