import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import toast from "react-hot-toast";

const serviceOptions = ["Decoration", "Catering", "Photography", "Entertainment", "Logistics", "Venue", "Other"];

const AdminMerchants = () => {
  const { token } = useAuth();
  const [merchants, setMerchants] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", serviceType: "", password: "" });
  const [errors, setErrors] = useState({});

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/admin/merchants`, { headers: authHeaders(token) });
      setMerchants(data.merchants || []);
    } catch {
      toast.error("Failed to load merchants");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Merchant name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.serviceType) e.serviceType = "Select a service type";
    if (!form.password || form.password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/admin/create-merchant`, form, {
        headers: { ...authHeaders(token), "Content-Type": "application/json" },
      });
      toast.success(data.message || "Merchant created");
      setOpen(false);
      setForm({ name: "", email: "", phone: "", serviceType: "", password: "" });
      setErrors({});
      await load();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create merchant";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Manage Merchants</h2>
            <p className="text-gray-600">Create and manage merchant accounts</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition"
          >
            Add Merchant
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold">Merchants</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Service Type</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Created Date</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((m) => (
                <tr key={m._id} className="border-t">
                  <td className="px-4 py-3">{m.name}</td>
                  <td className="px-4 py-3">{m.email}</td>
                  <td className="px-4 py-3">{m.serviceType || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${m.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                      {m.status || "active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[420px] space-y-4">
            <div className="text-lg font-semibold">Add Merchant</div>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Merchant Name"
                  className="border rounded-lg px-3 py-2 w-full"
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>
              <div>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="border rounded-lg px-3 py-2 w-full"
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>
              <div>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
              <div>
                <select
                  name="serviceType"
                  value={form.serviceType}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2 w-full"
                >
                  <option value="">Select Service Type</option>
                  {serviceOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {errors.serviceType && <p className="text-xs text-red-600 mt-1">{errors.serviceType}</p>}
              </div>
              <div>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="border rounded-lg px-3 py-2 w-full"
                />
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-70"
                >
                  {loading ? "Creating..." : "Create Merchant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminMerchants;
