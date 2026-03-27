import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaGlassCheers,
  FaBuilding,
  FaBirthdayCake,
  FaUtensils,
  FaCamera,
  FaPaintBrush,
  FaMusic,
  FaCampground,
  FaGamepad,
  FaSearch,
  FaSadTear,
  FaStar,
  FaTimes,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import axios from "axios";
import useAuth from "../context/useAuth";
import BookingModal from "../components/BookingModal";
import EventDetailsModal from "../components/EventDetailsModal";
import { API_BASE } from "../lib/http";

const Services = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [selectedRating, setSelectedRating] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bookedServiceId, setBookedServiceId] = useState(null);

  // Category icon map
  const categoryIconMap = {
    wedding: FaGlassCheers,
    corporate: FaBuilding,
    birthday: FaBirthdayCake,
    catering: FaUtensils,
    photography: FaCamera,
    decoration: FaPaintBrush,
    concert: FaMusic,
    camping: FaCampground,
    gaming: FaGamepad,
    anniversary: FaGlassCheers,
    party: FaGlassCheers,
    other: FaGlassCheers,
  };

  const categoryColorMap = {
    wedding: "bg-pink-50 text-pink-600",
    corporate: "bg-indigo-50 text-indigo-600",
    birthday: "bg-amber-50 text-amber-600",
    catering: "bg-rose-50 text-rose-600",
    photography: "bg-blue-50 text-blue-600",
    decoration: "bg-emerald-50 text-emerald-600",
    concert: "bg-purple-50 text-purple-600",
    camping: "bg-green-50 text-green-600",
    gaming: "bg-orange-50 text-orange-600",
    anniversary: "bg-red-50 text-red-600",
    party: "bg-yellow-50 text-yellow-600",
    other: "bg-gray-50 text-gray-600",
  };

  // Fetch real events (created by merchants) from API
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/events`);
      const events = res.data.events || [];
      // Map event fields to match card rendering expectations
      const mapped = events.map((ev) => ({
        ...ev,
        id: ev._id,
        description: ev.description || ev.title,
        price: ev.price || 0,
        rating: ev.rating || 0,
        category: (ev.category || "other").toLowerCase(),
        images: ev.images || [],
      }));
      setServices(mapped);
      // Set max price dynamically from actual event prices
      const highest = Math.max(...mapped.map((e) => e.price || 0), 100000);
      const roundedMax = Math.ceil(highest / 100000) * 100000; // round up to nearest lakh
      setMaxPrice(roundedMax);
      setPriceRange([0, roundedMax]);
    } catch (err) {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Derive unique categories from real data
  const categories = [...new Set(services.map((s) => s.category))]
    .filter(Boolean)
    .map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // Handle booking button click
  const handleBookClick = (service) => {
    // Check if user is logged in - check both context and localStorage
    const storedToken = localStorage.getItem("token");
    const isLoggedIn = storedToken || token;
    
    if (!isLoggedIn) {
      // User is not logged in - save intended service and redirect to login
      localStorage.setItem("pendingBooking", JSON.stringify(service));
      navigate("/login", { state: { from: "/services" } });
      toast.error("Please login to book this service");
      return;
    }
    
    // User is logged in - open booking modal
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  // Handle view details button click
  const handleViewDetailsClick = (service) => {
    setSelectedService(service);
    setIsDetailsModalOpen(true);
  };

  // Handle successful booking
  const handleBookingSuccess = (booking) => {
    setBookedServiceId(booking.serviceId || booking._id);
    toast.success("Booking confirmed! Check your dashboard for details.");
  };

  // Check for pending booking after login - watch token changes
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const pendingBooking = localStorage.getItem("pendingBooking");
    
    if (storedToken && token && pendingBooking) {
      try {
        const service = JSON.parse(pendingBooking);
        setSelectedService(service);
        setIsBookingModalOpen(true);
        localStorage.removeItem("pendingBooking");
        toast.success("Welcome back! Continue your booking");
      } catch (e) {
        console.error("Failed to parse pending booking:", e);
        localStorage.removeItem("pendingBooking");
      }
    }
  }, [token]); // Re-run when token changes

  // Filter services based on all criteria
  const filteredItems = services.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      (item.title || "").toLowerCase().includes(query) ||
      (item.category || "").toLowerCase().includes(query) ||
      (item.description || "").toLowerCase().includes(query);

    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    const matchesRating = !selectedRating || item.rating >= parseInt(selectedRating);
    const matchesCategory = !selectedCategory || item.category === selectedCategory;

    return matchesSearch && matchesPrice && matchesRating && matchesCategory;
  });

  const clearAllFilters = () => {
    setSearchQuery("");
    setPriceRange([0, maxPrice]);
    setSelectedRating("");
    setSelectedCategory("");
  };

  const hasActiveFilters = searchQuery || priceRange[1] < maxPrice || selectedRating || selectedCategory;

  // Format price to Indian format
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <section className="bg-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-200 px-8 py-12">
            <h1 className="text-3xl md:text-5xl font-semibold text-gray-900">Our Event Services</h1>
            <p className="mt-3 text-gray-600 max-w-2xl">
              Discover a full range of services to plan, manage, and elevate your
              events with ease and confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content with Filters and Services Grid */}
      <section className="max-w-7xl mx-auto px-6 py-8" style={{ backgroundColor: '#f3f4f6' }}>
        <div style={{ display: 'flex', gap: '32px' }}>
          
          {/* Filters Sidebar */}
          <div style={{
            width: '280px',
            flexShrink: 0,
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            height: 'fit-content',
            position: 'sticky',
            top: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e40af' }}>Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  style={{
                    fontSize: '12px',
                    color: '#a2783a',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Search Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Search
              </label>
              <div style={{ position: 'relative' }}>
                <FaSearch style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  fontSize: '14px',
                }} />
                <input
                  type="text"
                  placeholder="Service name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    fontSize: '14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    outline: 'none',
                    backgroundColor: '#f9fafb',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#a2783a';
                    e.target.style.boxShadow = '0 0 0 2px rgba(162, 120, 58, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Price Range Slider */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Price Range
              </label>
              <div style={{ marginBottom: '8px' }}>
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  step={Math.max(10000, Math.floor(maxPrice / 100) * 5000)}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: `linear-gradient(to right, #a2783a 0%, #a2783a ${(priceRange[1] / maxPrice) * 100}%, #e5e7eb ${(priceRange[1] / maxPrice) * 100}%, #e5e7eb 100%)`,
                    outline: 'none',
                    cursor: 'pointer',
                    WebkitAppearance: 'none',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                <span>₹0</span>
                <span style={{ fontWeight: '500', color: '#a2783a' }}>{formatPrice(priceRange[1])}</span>
                <span>{formatPrice(maxPrice)}</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>
                Rating
              </label>
              {[
                { value: "5", label: "5+ Stars" },
                { value: "4", label: "4+ Stars" },
                { value: "3", label: "3+ Stars" },
              ].map((rating) => (
                <label
                  key={rating.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#374151',
                  }}
                >
                  <input
                    type="radio"
                    name="rating"
                    value={rating.value}
                    checked={selectedRating === rating.value}
                    onChange={(e) => setSelectedRating(e.target.value)}
                    style={{
                      marginRight: '10px',
                      accentColor: '#a2783a',
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer',
                    }}
                  />
                  <FaStar style={{ color: '#fbbf24', marginRight: '6px', fontSize: '12px' }} />
                  {rating.label}
                </label>
              ))}
            </div>

            {/* Category Filter — derived from real DB data */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>
                Category
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(selectedCategory === cat.value ? "" : cat.value)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      borderRadius: '20px',
                      border: selectedCategory === cat.value ? '2px solid #a2783a' : '1px solid #e5e7eb',
                      backgroundColor: selectedCategory === cat.value ? '#fef3e6' : 'white',
                      color: selectedCategory === cat.value ? '#a2783a' : '#6b7280',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontWeight: selectedCategory === cat.value ? '500' : '400',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div style={{ flex: 1 }}>
            {/* Results count */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                {loading ? 'Loading events...' :
                  filteredItems.length > 0 
                    ? `Showing ${filteredItems.length} of ${services.length} events`
                    : services.length === 0 
                      ? 'No events have been created yet'
                      : 'No events found'
                }
              </p>
            </div>

            {/* Loading State */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#a2783a' }}>
                <FaSpinner style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 1s linear infinite' }} />
                <p style={{ fontSize: '16px' }}>Loading events...</p>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '24px' 
              }}>
                {filteredItems.length > 0 ? (
                  filteredItems.map((s) => {
                    const Icon = categoryIconMap[s.category] || FaGlassCheers;
                    const colorClass = categoryColorMap[s.category] || "bg-gray-50 text-gray-600";
                    const imgSrc = s.images?.[0]?.url || s.image || s.bannerImage || null;
                    const isBooked = bookedServiceId === s._id || bookedServiceId === s.id;
                    return (
                      <div key={s._id} style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column'
                      }} className="service-card">
                        <div style={{ 
                          position: 'relative', 
                          width: '100%', 
                          height: '180px',
                          overflow: 'hidden'
                        }}>
                          {imgSrc ? (
                            <img 
                              src={imgSrc} 
                              alt={s.title} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Icon style={{ fontSize: '48px', color: '#9ca3af' }} />
                            </div>
                          )}
                          <div style={{
                            position: 'absolute',
                            bottom: '12px',
                            left: '12px',
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            backgroundColor: 'white',
                          }}>
                            <Icon className={colorClass.split(' ')[1]} />
                          </div>
                          {/* Rating Badge */}
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                          }}>
                            <FaStar style={{ color: '#fbbf24' }} />
                            {s.rating > 0 ? s.rating.toFixed(1) : 'New'}
                          </div>
                          {/* Booked Badge */}
                          {isBooked && (
                            <div style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                              backgroundColor: '#10b981',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              color: 'white',
                            }}>
                              <FaCheckCircle /> Booked
                            </div>
                          )}
                        </div>
                        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <h3 style={{ 
                            fontSize: '18px', 
                            fontWeight: '600', 
                            marginBottom: '8px',
                            color: '#1f2937'
                          }}>{s.title}</h3>
                          <p style={{ 
                            fontSize: '14px', 
                            color: '#6b7280', 
                            marginBottom: '8px',
                            flex: 1
                          }}>{s.description}</p>
                          <p style={{ 
                            fontSize: '16px', 
                            fontWeight: '600', 
                            color: '#a2783a',
                            marginBottom: '12px'
                          }}>
                            Starting from {formatPrice(s.price)}
                          </p>
                          <button
                            onClick={() => handleBookClick(s)}
                            disabled={isBooked}
                            style={{
                              display: 'inline-block',
                              width: '100%',
                              padding: '10px 0',
                              backgroundColor: isBooked ? '#10b981' : '#a2783a',
                              color: 'white',
                              textAlign: 'center',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              fontWeight: '500',
                              transition: 'background-color 0.3s',
                              border: 'none',
                              cursor: isBooked ? 'default' : 'pointer',
                              marginBottom: '8px',
                            }}
                            onMouseEnter={(e) => { if (!isBooked) e.target.style.backgroundColor = '#8b6a30'; }}
                            onMouseLeave={(e) => { if (!isBooked) e.target.style.backgroundColor = '#a2783a'; }}
                          >
                            {isBooked ? 'Booked ✓' : 'Book Now'}
                          </button>
                          <button
                            onClick={() => handleViewDetailsClick(s)}
                            style={{
                              display: 'inline-block',
                              width: '100%',
                              padding: '10px 0',
                              backgroundColor: 'white',
                              color: '#a2783a',
                              textAlign: 'center',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              fontWeight: '500',
                              transition: 'all 0.3s',
                              border: '2px solid #a2783a',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#a2783a';
                              e.target.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'white';
                              e.target.style.color = '#a2783a';
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#6b7280'
                  }}>
                    <FaSadTear style={{ fontSize: '64px', color: '#a2783a', marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '24px', fontWeight: '500', marginBottom: '10px', color: '#a2783a' }}>
                      {services.length === 0 ? 'No events available yet' : 'No events found'}
                    </h3>
                    <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                      {services.length === 0
                        ? 'Events created by merchants will appear here.'
                        : 'No events match your current filters'}
                    </p>
                    {services.length > 0 && (
                      <button
                        onClick={clearAllFilters}
                        style={{
                          marginTop: '10px',
                          padding: '12px 28px',
                          backgroundColor: '#a2783a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'background-color 0.3s',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#8b6a30'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#a2783a'}
                      >
                        <FaTimes /> Clear All Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-2xl md:text-3xl font-semibold">
            Plan Your Event With Us
          </h3>
          <p className="text-white/90 max-w-2xl mx-auto mt-2">
            Partner with EventHub for seamless planning, trusted vendors, and
            memorable experiences.
          </p>
          <Link
            to="/contact"
            className="inline-block mt-4 px-6 py-3 rounded-lg bg-white text-gray-900 font-medium hover:bg-gray-100 transition"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal
        service={selectedService}
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedService(null);
        }}
        onSuccess={handleBookingSuccess}
        coupons={selectedService?.coupons || []}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedService}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedService(null);
        }}
        onBookNow={(event) => {
          setIsDetailsModalOpen(false);
          handleBookClick(event);
        }}
      />
    </>
  );
};

export default Services;
