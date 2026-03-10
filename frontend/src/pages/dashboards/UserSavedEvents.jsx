import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../components/user/UserLayout";
import { BsBookmarkHeartFill, BsCalendar2Event } from "react-icons/bs";
import { FaMapMarkerAlt, FaTicketAlt } from "react-icons/fa";
import toast from "react-hot-toast";

const UserSavedEvents = () => {
  const navigate = useNavigate();
  const [savedEvents, setSavedEvents] = useState([]);

  useEffect(() => {
    loadSavedEvents();
  }, []);

  const loadSavedEvents = () => {
    const saved = localStorage.getItem('savedEvents');
    if (saved) {
      setSavedEvents(JSON.parse(saved));
    }
  };

  const removeEvent = (eventId) => {
    const updated = savedEvents.filter(e => e._id !== eventId);
    localStorage.setItem('savedEvents', JSON.stringify(updated));
    setSavedEvents(updated);
    toast.success("Event removed from saved");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get image based on category or title keywords
  const getEventImage = (event) => {
    if (event?.image && event.image.trim() !== "") return event.image;
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
    if (event?.category && categoryImages[event.category]) return categoryImages[event.category];
    const title = (event?.title || "").toLowerCase();
    if (title.includes("wedding") || title.includes("marriage")) return "/wedding.jpg";
    if (title.includes("music") || title.includes("concert") || title.includes("band")) return "/party.jpg";
    if (title.includes("party") || title.includes("celebration")) return "/party.jpg";
    if (title.includes("birthday")) return "/birthday.jpg";
    if (title.includes("conference") || title.includes("meeting")) return "/gamenight.jpg";
    if (title.includes("food") || title.includes("dinner")) return "/restaurant.jpg";
    if (title.includes("outdoor") || title.includes("camping")) return "/camping.jpg";
    if (title.includes("anniversary")) return "/anniversary.jpg";
    return "/party.jpg";
  };

  return (
    <UserLayout>
      <section className="mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">Saved Events</h2>
        <p className="text-gray-600 mt-1">Your bookmarked events</p>
      </section>

      {savedEvents.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border">
          <BsBookmarkHeartFill className="mx-auto text-5xl text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No saved events yet</p>
          <p className="text-gray-400 mt-2">Start saving events you're interested in!</p>
          <button
            onClick={() => navigate("/dashboard/user/browse")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse Events
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {savedEvents.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
            >
              {/* Card Header */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={getEventImage(event)}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="inline-block px-2 py-1 bg-white/90 rounded text-xs font-medium text-gray-700 mb-1">
                    {event.category || "Event"}
                  </span>
                  <h3 className="text-white font-semibold text-lg truncate">{event.title}</h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                  <BsCalendar2Event className="text-blue-500" />
                  <span>{formatDate(event.date)}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                  <FaMapMarkerAlt className="text-red-500" />
                  <span className="truncate">{event.location || "Location TBD"}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/dashboard/user/events/${event._id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <FaTicketAlt />
                    Book Now
                  </button>
                  <button
                    onClick={() => removeEvent(event._id)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                    title="Remove from saved"
                  >
                    <BsBookmarkHeartFill />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </UserLayout>
  );
};

export default UserSavedEvents;
