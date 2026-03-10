import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";

const AdminEvents = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);

  const load = useCallback(async () => {
    const { data } = await axios.get(`${API_BASE}/admin/events`, { headers: authHeaders(token) });
    setEvents(data.events || []);
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Events</h2>
        <p className="text-gray-600">All events created by merchants</p>
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold">Events</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Image</th>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Rating</th>
                <th className="text-left px-4 py-3">Features</th>
                <th className="text-left px-4 py-3">Merchant</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => {
                const imageSrc = ev.images && ev.images.length > 0 ? ev.images[0].url : null;
                return (
                  <tr key={ev._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {imageSrc ? (
                        <img src={imageSrc} alt={ev.title} className="w-16 h-16 object-cover rounded-lg" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-gray-500">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{ev.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{ev.description?.substring(0, 50)}...</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {ev.category || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {ev.price ? `$${ev.price}` : "Free"}
                    </td>
                    <td className="px-4 py-3">
                      {ev.rating > 0 ? (
                        <span className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          {ev.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {ev.features && ev.features.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {ev.features.slice(0, 2).map((feature, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                              {feature}
                            </span>
                          ))}
                          {ev.features.length > 2 && (
                            <span className="px-2 py-0.5 text-gray-500 text-xs">
                              +{ev.features.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{ev.createdBy?.name || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEvents;
