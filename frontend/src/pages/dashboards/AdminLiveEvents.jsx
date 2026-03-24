import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { getEventStatus } from "../../lib/utils";

const AdminLiveEvents = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch public live events list
      const liveRes = await axios.get(`${API_BASE}/events/live`);
      console.log("Admin Live Events response:", liveRes.data);
      const liveEvents = liveRes.data?.events || [];

      // Optionally enrich with merchant names using admin events (populated)
      let merchantMap = {};
      try {
        const adminRes = await axios.get(`${API_BASE}/admin/events`, { headers: authHeaders(token) });
        console.log("Admin Events response (enrichment):", adminRes.data);
        const adminEvents = adminRes.data?.events || [];
        merchantMap = adminEvents.reduce((acc, ev) => {
          acc[ev._id] = ev.createdBy?.name || "";
          return acc;
        }, {});
      } catch {
        // Ignore enrichment failures silently
      }

      const enriched = liveEvents.map((ev) => ({
        ...ev,
        createdByName: merchantMap[ev._id] || ev.createdBy?.name || "—",
      }));
      setEvents(enriched);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Live Events</h2>
        <p className="text-gray-600">Events currently marked as live</p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="w-full p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border shadow-sm text-gray-500">
                No Live Events Available
              </div>
            ) : (
              events.map((ev) => {
                const img =
                  ev?.image && String(ev.image).trim() !== ""
                    ? ev.image
                    : ev?.images && ev.images.length > 0
                    ? ev.images[0].url
                    : "/party.jpg";
                const date = ev.date ? new Date(ev.date).toLocaleDateString() : "-";
                const price =
                  ev.price && Number(ev.price) > 0 ? `₹${Number(ev.price).toLocaleString("en-IN")}` : "Free";
                
                const status = getEventStatus(ev);

                return (
                  <div key={ev._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                    <div className="relative h-40 overflow-hidden">
                      <img src={img} alt={ev.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      
                      {/* Status Badge */}
                      <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm z-10 ${status.bg} ${status.text}`}>
                        {status.label}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 truncate flex-1">{ev.title}</h4>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">{ev.category || "Event"}</div>
                      <div className="text-sm text-gray-600 truncate">{ev.location || "-"}</div>
                      <div className="text-sm text-gray-600">{date}</div>
                      <div className="mt-2 font-semibold text-gray-900">{price}</div>
                      <button
                        onClick={() => navigate("/dashboard/admin/events")}
                        className="mt-3 w-full px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition text-sm"
                      >
                        View
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminLiveEvents;
