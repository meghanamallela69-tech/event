import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../components/user/UserLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { FiCalendar, FiMapPin, FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import toast from "react-hot-toast";

const UserMyEvents = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE}/events/my-registrations`, {
        headers: authHeaders(token),
      });
      if (response.data.success) {
        setRegistrations(response.data.registrations);
      }
    } catch (error) {
      toast.error("Failed to load your events");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return <FiCheckCircle className="text-green-600" />;
      case "pending":
        return <FiClock className="text-amber-600" />;
      case "cancelled":
        return <FiXCircle className="text-red-600" />;
      default:
        return <FiCheckCircle className="text-green-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredRegistrations = registrations.filter((reg) => {
    if (activeTab === "all") return true;
    if (activeTab === "upcoming") {
      const eventDate = new Date(reg.event?.date);
      return eventDate >= new Date();
    }
    if (activeTab === "past") {
      const eventDate = new Date(reg.event?.date);
      return eventDate < new Date();
    }
    return true;
  });

  const handleViewDetails = (eventId) => {
    navigate(`/dashboard/user/events/${eventId}`);
  };

  return (
    <UserLayout>
      <section className="mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">My Events</h2>
        <p className="text-gray-600 mt-1">Manage your event registrations and bookings</p>
      </section>

      {/* Stats Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900">{registrations.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Upcoming Events</p>
          <p className="text-2xl font-bold text-blue-600">
            {registrations.filter((r) => new Date(r.event?.date) >= new Date()).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Past Events</p>
          <p className="text-2xl font-bold text-gray-600">
            {registrations.filter((r) => new Date(r.event?.date) < new Date()).length}
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white rounded-xl shadow-sm p-2 mb-6">
        <div className="flex gap-2">
          {["all", "upcoming", "past"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Events List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500 text-lg">No events found</p>
          <p className="text-gray-400 mt-2">You haven't registered for any events yet</p>
          <button
            onClick={() => navigate("/dashboard/user/browse")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse Events
          </button>
        </div>
      ) : (
        <section className="space-y-4">
          {filteredRegistrations.map((reg) => (
            <article
              key={reg._id}
              className="bg-white rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Event Image */}
                <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={(() => {
                      const ev = reg.event;
                      if (ev?.image && ev.image.trim() !== "") return ev.image;
                      const categoryImages = {
                        "Wedding": "/wedding.jpg",
                        "Party": "/party.jpg",
                        "Music": "/party.jpg",
                        "Conference": "/gamenight.jpg",
                        "Food": "/restaurant.jpg",
                        "Tech": "/gamenight.jpg",
                        "Outdoor": "/camping.jpg",
                        "Birthday": "/birthday.jpg",
                        "Anniversary": "/anniversary.jpg"
                      };
                      if (ev?.category && categoryImages[ev.category]) return categoryImages[ev.category];
                      const title = (ev?.title || "").toLowerCase();
                      if (title.includes("wedding") || title.includes("marriage")) return "/wedding.jpg";
                      if (title.includes("music") || title.includes("concert") || title.includes("band")) return "/party.jpg";
                      if (title.includes("party") || title.includes("celebration")) return "/party.jpg";
                      if (title.includes("birthday")) return "/birthday.jpg";
                      if (title.includes("conference") || title.includes("meeting")) return "/gamenight.jpg";
                      if (title.includes("food") || title.includes("dinner")) return "/restaurant.jpg";
                      if (title.includes("outdoor") || title.includes("camping")) return "/camping.jpg";
                      if (title.includes("anniversary")) return "/anniversary.jpg";
                      return "/party.jpg";
                    })()}
                    alt={reg.event?.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Event Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reg.event?.title}
                    </h3>
                    <span
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        reg.status
                      )}`}
                    >
                      {getStatusIcon(reg.status)}
                      {reg.status || "Confirmed"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiCalendar className="text-gray-400" />
                      <span className="text-sm">{formatDate(reg.event?.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiMapPin className="text-gray-400" />
                      <span className="text-sm">{reg.event?.location || "Location TBD"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Registered on {formatDate(reg.createdAt)}
                    </div>
                    <button
                      onClick={() => handleViewDetails(reg.event?._id)}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </UserLayout>
  );
};

export default UserMyEvents;
