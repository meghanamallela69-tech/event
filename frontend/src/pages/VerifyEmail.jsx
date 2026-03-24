import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../lib/http";

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/auth/verify-email?token=${encodeURIComponent(token || "")}`);
        if (data?.success) {
          setStatus("success");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };
    run();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow border text-center">
        {status === "verifying" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-700">Verifying your email…</div>
          </>
        )}
        {status === "success" && (
          <div className="text-green-600 font-medium">Email verified! Redirecting to login…</div>
        )}
        {status === "error" && (
          <div className="text-red-600 font-medium">Verification failed or expired link.</div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
