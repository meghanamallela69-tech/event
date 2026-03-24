import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { FaTag } from "react-icons/fa";

const AdminCategories = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/admin/events`, { headers: authHeaders(token) })
      .then((res) => {
        const events = res.data.events || [];
        // Aggregate categories from real events
        const catMap = {};
        events.forEach((ev) => {
          const cat = ev.category || "Uncategorized";
          catMap[cat] = (catMap[cat] || 0) + 1;
        });
        const sorted = Object.entries(catMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        setCategories(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Event Categories</h2>
        <p className="text-gray-600">Categories derived from all events on the platform</p>
      </div>
      {categories.length === 0 ? (
        <div className="rounded-xl bg-white border shadow-sm p-12 text-center">
          <FaTag className="text-5xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No event categories found. Create events to populate categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.name} className="bg-white rounded-xl p-5 shadow-sm border flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <FaTag className="text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{cat.name}</p>
                <p className="text-sm text-gray-500">{cat.count} event{cat.count !== 1 ? "s" : ""}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;

