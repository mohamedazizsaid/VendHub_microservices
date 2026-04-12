import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";

// Public pages
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import Login from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import ProfileSetup from "./pages/ProfileSetup";
import AuthCallback from "./pages/AuthCallback";

// User pages
import { UserDashboard } from "./pages/user/Dashboard";
import { ProductsList } from "./pages/user/ProductsList";
import { ProductDetails } from "./pages/user/ProductDetails";
import { ShoppingCart } from "./pages/user/ShoppingCart";
import { Favorites } from "./pages/user/Favorites";
import { EventsList } from "./pages/user/EventsList";
import { EventDetails } from "./pages/user/EventDetails";
import { OrdersList } from "./pages/user/OrdersList";
import { OrderTracking } from "./pages/user/OrderTracking";
import { Support } from "./pages/user/Support";
import { ForumsList } from "./pages/user/ForumsList";
import { ForumDiscussion } from "./pages/user/ForumDiscussion";

// Admin pages
import { AdminDashboard } from "./pages/admin/Dashboard";
import { UserManagement } from "./pages/admin/UserManagement";
import { ProductManagement } from "./pages/admin/ProductManagement";
import { OrderManagement } from "./pages/admin/OrderManagement";
import { EventManagement } from "./pages/admin/EventManagement";
import { Analytics } from "./pages/admin/Analytics";
import { Settings } from "./pages/admin/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: About },
      { path: "contact", Component: Contact },
      { path: "login", Component: Login },
      { path: "signup", Component: SignUp },
      { path: "setup-profile", Component: ProfileSetup },
      { path: "auth/callback", Component: AuthCallback },
      { path: "products", Component: ProductsList },
      { path: "products/:id", Component: ProductDetails },
      { path: "events", Component: EventsList },
      { path: "events/:id", Component: EventDetails },
      { path: "cart", Component: ShoppingCart },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "dashboard", Component: UserDashboard },
          { path: "favorites", Component: Favorites },
          { path: "forums", Component: ForumsList },
          { path: "forums/:id", Component: ForumDiscussion },
          { path: "orders", Component: OrdersList },
          { path: "orders/:id", Component: OrderTracking },
          { path: "support", Component: Support },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
    children: [
      {
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: "users", Component: UserManagement },
          { path: "products", Component: ProductManagement },
          { path: "orders", Component: OrderManagement },
          { path: "events", Component: EventManagement },
          { path: "analytics", Component: Analytics },
          { path: "settings", Component: Settings },
        ],
      },
    ],
  },
]);
