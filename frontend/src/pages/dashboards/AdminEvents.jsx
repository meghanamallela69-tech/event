import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { FaCalendarAlt, FaMapMarkerAlt, FaUser, FaTag } from "react-icons/fa";

const AdminEvents = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/admin/events`, { headers: authHeaders(token) });
      setEvents(data.events || []);
    } catch (error) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const formatPrice = (price) => {
    if (!price || price === 0) return "Free";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  const getStatusBadge = (event) => {
    const now = new Date();
    const eventDate = event.date ? new Date(event.date) : null;
    
    if (eventDate && eventDate < now) {
      return { label: "Completed", className: "bg-gray-100 text-gray-700" };
    }
    if (event.status === "inactive") {
      return { label: "Inactive", className: "bg-red-100 text-red-700" };
    }
    return { label: "Active", className: "bg-green-100 text-green-700" };
  };

  const getEventTypeBadge = (eventType) => {
    if (eventType === "ticketed") {
      return { label: "Ticketed", className: "bg-purple-100 text-purple-700", icon: "🎫" };
    }
    return { label: "Full Service", className: "bg-blue-100 text-blue-700", icon: "🤝" };
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Events</h2>
        <p className="text-gray-600">All events created by merchants</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border">
          <p className="text-gray-500">No events found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {events.map((ev) => {
            const imageSrc = ev.images && ev.images.length > 0 ? ev.images[0].url : null;
            const status = getStatusBadge(ev);
            const type = getEventTypeBadge(ev.eventType);
            
            return (
              <div key={ev._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group">
                {/* Image Header */}
                <div className="relative h-40 overflow-hidden">
                  {imageSrc ? (
                    <img src={imageSrc} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">No Image</span>
                    </div>
                  )}
                  {/* Status Badge */}
                  <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                    {status.label}
                  </span>
                  {/* Event Type Badge */}
                  <span className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${type.className}`}>
                    {type.icon} {type.label}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Title & Category */}
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1" title={ev.title}>{ev.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                        {ev.category || "Uncategorized"}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-500 line-clamp-2">{ev.description || "No description"}</p>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <FaTag className="text-amber-600 text-sm" />
                    <span className="text-lg font-bold text-amber-600">{formatPrice(ev.price)}</span>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-1 text-sm text-gray-600">
                    {ev.date && (
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400 text-xs" />
                        <span>{new Date(ev.date).toLocaleDateString('en-IN')}</span>
                        {ev.time && <span>at {ev.time}</span>}
                      </div>
                    )}
                    {ev.location && (
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-gray-400 text-xs" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                    )}
                    {ev.createdBy?.name && (
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400 text-xs" />
                        <span>by {ev.createdBy.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Features/Addons */}
                  {ev.addons && ev.addons.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t">
                      {ev.addons.slice(0, 2).map((addon, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs">
                          {addon.name}
                        </span>
                      ))}
                      {ev.addons.length > 2 && (
                        <span className="px-2 py-0.5 text-gray-500 text-xs">+{ev.addons.length - 2}</span>
                      )}
                    </div>
                  )}

                  {/* Ticket Types (for ticketed events) */}
                  {ev.eventType === "ticketed" && ev.ticketTypes && ev.ticketTypes.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500 mb-1">Ticket Types:</p>
                      <div className="flex flex-wrap gap-1">
                        {ev.ticketTypes.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                            {t.name}: {formatPrice(t.price)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Event ID Footer */}
                  <div className="pt-3 border-t text-xs text-gray-400">
                    Event ID: {ev._id?.slice(-8).toUpperCase()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminEvents;
