import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import MerchantLayout from "../../components/merchant/MerchantLayout";
import { BsCalendar2Event } from "react-icons/bs";
import { FaEdit, FaTrash, FaPlus, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import toast from "react-hot-toast";

const MerchantEvents = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/merchant/events`, { headers: authHeaders(token) });
      console.log("Loaded events:", data.events); // Debug log
      setEvents(data.events || []);
    } catch (error) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const removeEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`${API_BASE}/merchant/events/${id}`, { headers: authHeaders(token) });
      setEvents((prev) => prev.filter((e) => e._id !== id));
      toast.success("Event deleted successfully");
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <MerchantLayout>
      <section className="mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">My Events</h2>
        <p className="text-gray-600 mt-1">Manage all your created events</p>
      </section>

      {/* Create Event Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/dashboard/merchant/create")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <FaPlus />
          Create New Event
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <BsCalendar2Event className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No events found</p>
          <p className="text-gray-400 mt-2">Create your first event to get started</p>
          <button
            onClick={() => navigate("/dashboard/merchant/create")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Event
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {events.map((ev) => {
            // Get image - use first image from images array or fallback
            const eventImage = ev.images && ev.images.length > 0 
              ? ev.images[0].url 
              : "/party.jpg";
            
            return (
              <div 
                key={ev._id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                {/* Event Image */}
                <div className="relative h-36 overflow-hidden">
                  <img 
                    src={eventImage} 
                    alt={ev.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="text-white font-semibold truncate">{ev.title}</h4>
                    <span className="text-white/80 text-xs">{ev.category || "Event"}</span>
                  </div>
                  {ev.rating > 0 && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-yellow-900 rounded text-xs font-medium flex items-center gap-1">
                      ⭐ {ev.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                
                {/* Event Details */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-semibold text-blue-600">
                      {ev.price ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(ev.price) : "Free"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {ev.features?.length || 0} features
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => navigate(`/dashboard/merchant/events/edit/${ev._id}`)}
                      className="flex-1 px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => removeEvent(ev._id)}
                      className="p-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MerchantLayout>
  );
};

export default MerchantEvents;
