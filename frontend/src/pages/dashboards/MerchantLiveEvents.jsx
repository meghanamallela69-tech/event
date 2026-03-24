import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import MerchantLayout from "../../components/merchant/MerchantLayout";
import { FaBroadcastTower, FaEye, FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import toast from "react-hot-toast";
import GridLayout from "../../components/common/GridLayout";

const LiveEventCard = ({ event, onViewDetails, onManageEvent }) => {
  const eventImage = event.images && event.images.length > 0 
    ? event.images[0].url 
    : "/party.jpg";

  const formatTime = (dateString, timeString) => {
    if (!dateString) return "Time TBD";
    const date = new Date(dateString);
    if (timeString) {
      return `${date.toLocaleDateString()} at ${timeString}`;
    }
    return date.toLocaleDateString();
  };

  const getTimeRemaining = (dateString, timeString) => {
    if (!dateString) return "Time TBD";
    
    const eventDate = new Date(dateString);
    if (timeString) {
      const [hours, minutes] = timeString.split(":");
      eventDate.setHours(hours, minutes);
    }
    
    const now = new Date();
    const diffMs = eventDate - now;
    
    if (diffMs < 0) {
      return "Event Started";
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `Starts in ${diffHours}h ${diffMinutes}m`;
    } else {
      return `Starts in ${diffMinutes}m`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Event Image with Live Badge */}
      <div className="relative h-48">
        <img 
          src={eventImage} 
          alt={event.title} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            LIVE TODAY
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-black/70 text-white">
            {getTimeRemaining(event.date, event.time)}
          </span>
        </div>
      </div>

      {/* Event Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <FaCalendarAlt className="mr-2 text-blue-500" />
            <span>{formatTime(event.date, event.time)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FaMapMarkerAlt className="mr-2 text-red-500" />
            <span className="truncate">{event.location || "Location TBD"}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FaUsers className="mr-2 text-green-500" />
            <span>{event.bookingsCount || 0} attendees registered</span>
          </div>
        </div>

        {/* Live Stats */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-blue-600">{event.bookingsCount || 0}</p>
              <p className="text-xs text-gray-500">Total Bookings</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">
                ₹{((event.bookingsCount || 0) * (event.price || 0)).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Revenue</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(event)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <FaEye />
            View Details
          </button>
          <button
            onClick={() => onManageEvent(event)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
          >
            <FaBroadcastTower />
            Manage Live
          </button>
        </div>
      </div>
    </div>
  );
};

const MerchantLiveEvents = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [liveEvents, setLiveEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLiveEvents = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/merchant/events`, { headers: authHeaders(token) });
      const events = data.events || [];
      
      // Filter events that are happening today
      const today = new Date();
      const todayStr = today.toDateString();
      
      const live = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === todayStr;
      });
      
      setLiveEvents(live);
    } catch (error) {
      toast.error("Failed to load live events");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadLiveEvents();
    
    // Refresh every 30 seconds to keep live data updated
    const interval = setInterval(loadLiveEvents, 30000);
    return () => clearInterval(interval);
  }, [loadLiveEvents]);

  const handleViewDetails = (event) => {
    navigate(`/dashboard/merchant/events/${event._id}/details`);
  };

  const handleManageEvent = (event) => {
    navigate(`/dashboard/merchant/events/${event._id}/manage`);
  };

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaBroadcastTower className="text-red-500" />
              Live Events
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                LIVE
              </span>
            </h1>
            <p className="text-gray-600 mt-1">Monitor and manage your events happening today</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FaClock />
            <span>Auto-refreshes every 30 seconds</span>
          </div>
        </div>

        {/* Live Events Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Live Events Today</p>
                <h3 className="text-3xl font-bold mt-2">{liveEvents.length}</h3>
              </div>
              <FaBroadcastTower className="text-2xl text-red-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Attendees</p>
                <h3 className="text-3xl font-bold mt-2">
                  {liveEvents.reduce((sum, event) => sum + (event.bookingsCount || 0), 0)}
                </h3>
              </div>
              <FaUsers className="text-2xl text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Live Revenue</p>
                <h3 className="text-3xl font-bold mt-2">
                  ₹{liveEvents.reduce((sum, event) => sum + ((event.bookingsCount || 0) * (event.price || 0)), 0).toLocaleString()}
                </h3>
              </div>
              <FaCalendarAlt className="text-2xl text-green-200" />
            </div>
          </div>
        </div>

        {/* Live Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : liveEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FaBroadcastTower className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No live events today</h3>
            <p className="text-gray-500 mb-6">You don't have any events scheduled for today</p>
            <button
              onClick={() => navigate("/dashboard/merchant/create")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create New Event
            </button>
          </div>
        ) : (
          <GridLayout>
            {liveEvents.map((event) => (
              <LiveEventCard
                key={event._id}
                event={event}
                onViewDetails={handleViewDetails}
                onManageEvent={handleManageEvent}
              />
            ))}
          </GridLayout>
        )}
      </div>
    </MerchantLayout>
  );
};

export default MerchantLiveEvents;