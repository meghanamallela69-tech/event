import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../components/user/UserLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { FiSearch, FiCalendar, FiMapPin } from "react-icons/fi";
import { BsFilter, BsBookmarkHeart, BsBookmarkHeartFill } from "react-icons/bs";
import toast from "react-hot-toast";

const UserBrowseEvents = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [savedEvents, setSavedEvents] = useState([]);

  const categories = ["all", "Conference", "Music", "Food", "Tech", "Wedding", "Party", "Outdoor"];

  useEffect(() => {
    fetchEvents();
    loadSavedEvents();
  }, []);

  const loadSavedEvents = () => {
    const saved = localStorage.getItem('savedEvents');
    if (saved) {
      setSavedEvents(JSON.parse(saved));
    }
  };

  const toggleSaveEvent = (event) => {
    let updatedSaved = [...savedEvents];
    const isSaved = savedEvents.some(e => e._id === event._id);
    
    if (isSaved) {
      updatedSaved = updatedSaved.filter(e => e._id !== event._id);
      toast.success("Event removed from saved");
    } else {
      updatedSaved.push(event);
      toast.success("Event saved successfully!");
    }
    
    localStorage.setItem('savedEvents', JSON.stringify(updatedSaved));
    setSavedEvents(updatedSaved);
  };

  const isEventSaved = (eventId) => {
    return savedEvents.some(e => e._id === eventId);
  };

  useEffect(() => {
    filterEvents();
  }, [searchTerm, categoryFilter, dateFilter, events]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE}/events`, {
        headers: authHeaders(token),
      });
      if (response.data.success) {
        setEvents(response.data.events);
        setFilteredEvents(response.data.events);
      }
    } catch (error) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (event) => event.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const today = new Date();
      const eventDate = new Date();
      
      filtered = filtered.filter((event) => {
        const eventDateObj = new Date(event.date);
        if (dateFilter === "today") {
          return eventDateObj.toDateString() === today.toDateString();
        } else if (dateFilter === "week") {
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          return eventDateObj >= today && eventDateObj <= weekFromNow;
        } else if (dateFilter === "month") {
          return (
            eventDateObj.getMonth() === today.getMonth() &&
            eventDateObj.getFullYear() === today.getFullYear()
          );
        }
        return true;
      });
    }

    setFilteredEvents(filtered);
  };

  const handleViewDetails = (eventId) => {
    navigate(`/dashboard/user/events/${eventId}`);
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

  return (
    <UserLayout>
      <section className="mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">Browse Events</h2>
        <p className="text-gray-600 mt-1">Discover and book amazing events near you</p>
      </section>

      {/* Search and Filters */}
      <section className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events by name, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <BsFilter className="text-gray-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <FiCalendar className="text-gray-500" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Any Date</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </section>

      {/* Results Count */}
      <section className="mb-4">
        <p className="text-gray-600">
          Showing <span className="font-semibold">{filteredEvents.length}</span> events
        </p>
      </section>

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500 text-lg">No events found matching your criteria</p>
          <button
            onClick={() => {
              setSearchTerm("");
              setCategoryFilter("all");
              setDateFilter("all");
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <section style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '24px' 
        }}>
          {filteredEvents.map((event) => (
            <article key={event._id} style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column'
            }} className="event-card">
              <div style={{ 
                position: 'relative', 
                width: '100%', 
                height: '180px',
                overflow: 'hidden'
              }}>
                {/* Get image based on category or title keywords */}
                {(() => {
                  const getEventImage = (ev) => {
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
                  };
                  return (
                    <img 
                      src={getEventImage(event)} 
                      alt={event.title} 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  );
                })()}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: '#a2783a',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {event.category || "Event"}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSaveEvent(event);
                  }}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  title={isEventSaved(event._id) ? "Remove from saved" : "Save event"}
                >
                  {isEventSaved(event._id) ? (
                    <BsBookmarkHeartFill style={{ color: '#ec4899', fontSize: '18px' }} />
                  ) : (
                    <BsBookmarkHeart style={{ color: '#6b7280', fontSize: '18px' }} />
                  )}
                </button>
              </div>
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: '#1f2937'
                }}>{event.title}</h3>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  marginBottom: '8px',
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  <FiCalendar />
                  {formatDate(event.date)}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  marginBottom: '16px',
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  <FiMapPin />
                  {event.location || "Location TBD"}
                </div>
                <button 
                  onClick={() => handleViewDetails(event._id)}
                  style={{
                    display: 'inline-block',
                    width: '100%',
                    padding: '10px 0',
                    backgroundColor: '#a2783a',
                    color: 'white',
                    textAlign: 'center',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '500',
                    transition: 'background-color 0.3s',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#8b6a30'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#a2783a'}
                >
                  View Details
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </UserLayout>
  );
};

export default UserBrowseEvents;
