import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import useAuth from "../context/useAuth";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    await axios
      .post(
        "http://localhost:4000/api/v1/auth/register",
        { name, email, password, role },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((res) => {
        toast.success(res.data.message);
        login(res.data.token, res.data.user);
        const r = res.data.user.role;
        if (r === "admin") navigate("/dashboard/admin");
        else if (r === "merchant") navigate("/dashboard/merchant");
        else navigate("/dashboard/user");
        setName("");
        setEmail("");
        setPassword("");
      })
      .catch((error) => {
        const msg = error?.response?.data?.message || "Register failed";
        toast.error(msg);
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Create Account</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I want to register as:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User (Browse and book events)</option>
              <option value="merchant">Merchant (Create and manage events)</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded-lg w-full hover:bg-blue-700 transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
