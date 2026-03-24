import { useState } from "react";
import axios from "axios";
import { API_BASE } from "../lib/http";

const LoginTest = () => {
  const [results, setResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const testCredentials = [
    { email: "admin@gmail.com", password: "Admin@123", role: "Admin" },
    { email: "merchant@test.com", password: "Merchant@123", role: "Merchant" },
    { email: "user@test.com", password: "User@123", role: "User" }
  ];

  const testLogin = async (email, password, role) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        return {
          role,
          email,
          status: "✅ SUCCESS",
          message: `Logged in as ${response.data.user.name}`,
          token: response.data.token.substring(0, 20) + "...",
          userRole: response.data.user.role
        };
      } else {
        return {
          role,
          email,
          status: "❌ FAILED",
          message: response.data.message || "Login failed",
          token: null,
          userRole: null
        };
      }
    } catch (error) {
      return {
        role,
        email,
        status: "❌ ERROR",
        message: error.response?.data?.message || error.message,
        token: null,
        userRole: null
      };
    }
  };

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    
    const testResults = [];
    
    for (const cred of testCredentials) {
      const result = await testLogin(cred.email, cred.password, cred.role);
      testResults.push(result);
      setResults([...testResults]);
    }
    
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-6">Login System Test</h1>
          
          <div className="text-center mb-6">
            <button
              onClick={runTests}
              disabled={testing}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {testing ? "Testing..." : "Run Login Tests"}
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Credentials:</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testCredentials.map((cred, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">{cred.role}</h3>
                  <p className="text-sm text-gray-600">Email: {cred.email}</p>
                  <p className="text-sm text-gray-600">Password: {cred.password}</p>
                </div>
              ))}
            </div>
          </div>

          {results.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{result.role} Login</h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        result.status.includes('SUCCESS') 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Email: {result.email}</p>
                    <p className="text-sm text-gray-600 mb-1">Message: {result.message}</p>
                    {result.token && (
                      <>
                        <p className="text-sm text-gray-600 mb-1">Token: {result.token}</p>
                        <p className="text-sm text-gray-600">User Role: {result.userRole}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              API Base URL: <code className="bg-gray-100 px-2 py-1 rounded">{API_BASE}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginTest;