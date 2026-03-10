import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import useAuth from "../context/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE } from "../lib/http";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    console.log("Login attempt with:", { email });
    
    try {
      const res = await axios.post(
        `${API_BASE}/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      
      console.log("Login response:", res.data);
      
      if (res.data.success) {
        toast.success(res.data.message);
        login(res.data.token, res.data.user);
        
        // Check for redirect after login
        const from = location.state?.from;
        
        console.log("User role:", res.data.user.role);
        console.log("Redirect from:", from);
        
        // Handle redirect from service details page or services page for booking
        if (from && (from === "/services" || from.startsWith("/service/"))) {
          // Redirect back to the original page to complete booking
          navigate(from);
        } else {
          // Default redirect based on role
          const r = res.data.user.role;
          if (r === "admin") {
            navigate("/dashboard/admin");
          } else if (r === "merchant") {
            navigate("/dashboard/merchant");
          } else {
            navigate("/dashboard/user");
          }
        }
        
        setEmail("");
        setPassword("");
      } else {
        toast.error(res.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      console.error("Error response:", error.response?.data);
      const msg = error?.response?.data?.message || "Login failed";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded-lg w-full hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
