import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";

const AdminRegistrations = () => {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);

  const load = useCallback(async () => {
    const { data } = await axios.get(`${API_BASE}/admin/registrations`, { headers: authHeaders(token) });
    setRows(data.registrations || []);
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Registrations</h2>
        <p className="text-gray-600">All user registrations across events</p>
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold">Registrations</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Event</th>
                <th className="text-left px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="px-4 py-3">{r.user?.name || "User"}</td>
                  <td className="px-4 py-3">{r.event?.title || "Event"}</td>
                  <td className="px-4 py-3">{new Date(r.createdAt || Date.now()).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRegistrations;
