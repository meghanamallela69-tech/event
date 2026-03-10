import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Register from "./pages/Register";

import PrivateRoute from "./components/PrivateRoute";
import RoleRoute from "./components/RoleRoute";

import AuthProvider from "./context/AuthProvider";

import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blogs from "./pages/Blogs";
import FAQ from "./pages/FAQ";

import UserDashboard from "./pages/dashboards/UserDashboard";
import UserBrowseEvents from "./pages/dashboards/UserBrowseEvents";
import UserEventDetails from "./pages/dashboards/UserEventDetails";
import UserMyEvents from "./pages/dashboards/UserMyEvents";
import UserProfile from "./pages/dashboards/UserProfile";
import UserSavedEvents from "./pages/dashboards/UserSavedEvents";
import UserNotifications from "./pages/dashboards/UserNotifications";
import AdminDashboardUI from "./pages/dashboards/AdminDashboardUI";
import MerchantDashboard from "./pages/dashboards/MerchantDashboard";
import MerchantEvents from "./pages/dashboards/MerchantEvents";
import MerchantCreateEvent from "./pages/dashboards/MerchantCreateEvent";
import MerchantEditEvent from "./pages/dashboards/MerchantEditEvent";
import MerchantBookings from "./pages/dashboards/MerchantBookings";
import MerchantPayments from "./pages/dashboards/MerchantPayments";
import MerchantProfile from "./pages/dashboards/MerchantProfile";
import MerchantSettings from "./pages/dashboards/MerchantSettings";

import AdminMerchants from "./pages/dashboards/AdminMerchants";
import AdminUsers from "./pages/dashboards/AdminUsers";
import AdminEvents from "./pages/dashboards/AdminEvents";
import AdminRegistrations from "./pages/dashboards/AdminRegistrations";
import AdminAnalytics from "./pages/dashboards/AdminAnalytics";
import AdminSettings from "./pages/dashboards/AdminSettings";
import AdminCategories from "./pages/dashboards/AdminCategories";
import AdminPayments from "./pages/dashboards/AdminPayments";
import AdminServices from "./pages/dashboards/AdminServices";

const AppContent = () => {
  const location = useLocation();
  const hideChrome = location.pathname.startsWith("/dashboard");
  return (
    <div className="flex flex-col min-h-screen">

      {!hideChrome && <Navbar />}

      <main className="flex-grow">

        <Routes>

          {/* PUBLIC PAGES */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/service/:id" element={<ServiceDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/faqs" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* USER DASHBOARD */}
          <Route
            path="/dashboard/user"
            element={
              <PrivateRoute>
                <RoleRoute role="user">
                  <UserDashboard />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/user/browse"
            element={
              <PrivateRoute>
                <RoleRoute role="user">
                  <UserBrowseEvents />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/user/events/:eventId"
            element={
              <PrivateRoute>
                <RoleRoute role="user">
                  <UserEventDetails />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/user/bookings"
            element={
              <PrivateRoute>
                <RoleRoute role="user">
                  <UserMyEvents />
                </RoleRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/user/profile"
            element={
              <PrivateRoute>
                <RoleRoute role="user">
                  <UserProfile />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/user/saved"
            element={
              <PrivateRoute>
                <RoleRoute role="user">
                  <UserSavedEvents />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/user/notifications"
            element={
              <PrivateRoute>
                <RoleRoute role="user">
                  <UserNotifications />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* ADMIN DASHBOARD */}
          <Route
            path="/dashboard/admin"
            element={
              <PrivateRoute>
                <RoleRoute role="admin">
                  <AdminDashboardUI />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/admin/merchants"
            element={
              <PrivateRoute>
                <RoleRoute role="admin">
                  <AdminMerchants />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/admin/users"
            element={
              <PrivateRoute>
                <RoleRoute role="admin">
                  <AdminUsers />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/admin/events"
            element={
              <PrivateRoute>
                <RoleRoute role="admin">
                  <AdminEvents />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/admin/registrations"
            element={
              <PrivateRoute>
                <RoleRoute role="admin">
                  <AdminRegistrations />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/admin/analytics"
            element={
              <PrivateRoute>
                <RoleRoute role="admin">
                  <AdminAnalytics />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/admin/settings"
            element={
              <PrivateRoute>
                <RoleRoute role="admin">
                  <AdminSettings />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/admin/categories"
            element={
              <PrivateRoute>
                <RoleRoute role="admin">
                  <AdminCategories />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/admin/payments"
            element={
              <PrivateRoute>
                <RoleRoute role="admin">
                  <AdminPayments />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/admin/services"
            element={
              <PrivateRoute>
                <RoleRoute role="admin">
                  <AdminServices />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* MERCHANT DASHBOARD */}
          <Route
            path="/dashboard/merchant"
            element={
              <PrivateRoute>
                <RoleRoute role="merchant">
                  <MerchantDashboard />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/merchant/events"
            element={
              <PrivateRoute>
                <RoleRoute role="merchant">
                  <MerchantEvents />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/merchant/create"
            element={
              <PrivateRoute>
                <RoleRoute role="merchant">
                  <MerchantCreateEvent />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/merchant/events/edit/:eventId"
            element={
              <PrivateRoute>
                <RoleRoute role="merchant">
                  <MerchantEditEvent />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/merchant/bookings"
            element={
              <PrivateRoute>
                <RoleRoute role="merchant">
                  <MerchantBookings />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/merchant/payments"
            element={
              <PrivateRoute>
                <RoleRoute role="merchant">
                  <MerchantPayments />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/merchant/profile"
            element={
              <PrivateRoute>
                <RoleRoute role="merchant">
                  <MerchantProfile />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard/merchant/settings"
            element={
              <PrivateRoute>
                <RoleRoute role="merchant">
                  <MerchantSettings />
                </RoleRoute>
              </PrivateRoute>
            }
          />

        </Routes>

      </main>

      {!hideChrome && <Footer />}

      <Toaster />

    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
