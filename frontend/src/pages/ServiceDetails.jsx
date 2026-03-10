import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaStar, FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";
import { API_BASE } from "../lib/http";
import useAuth from "../context/useAuth";
import BookingModal from "../components/BookingModal";

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    fetchServiceDetails();
    
    // Check if there's a pending booking after login redirect
    const pendingBooking = localStorage.getItem("pendingBooking");
    if (pendingBooking && token) {
      const parsed = JSON.parse(pendingBooking);
      // Only open modal if this is the same service
      if (parsed.id === id) {
        setIsBookingModalOpen(true);
        localStorage.removeItem("pendingBooking");
      }
    }
  }, [id, token]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/services/${id}`);
      setService(response.data.service);
    } catch (error) {
      toast.error("Failed to fetch service details");
      navigate("/services");
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    const storedToken = localStorage.getItem("token");
    
    if (!storedToken && !token) {
      // Save service info and redirect to login
      localStorage.setItem("pendingBooking", JSON.stringify({
        id: service._id,
        title: service.title,
        category: service.category,
        price: service.price,
        desc: service.description,
      }));
      navigate("/login", { state: { from: `/service/${id}` } });
      toast.error("Please login to book this service");
      return;
    }
    
    setIsBookingModalOpen(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      wedding: "💒",
      corporate: "🏢",
      birthday: "🎂",
      catering: "🍽️",
      photography: "📸",
      decoration: "🎨",
      concert: "🎵",
      camping: "🏕️",
      gaming: "🎮",
      anniversary: "💑",
      party: "🎉",
      other: "📋",
    };
    return icons[category] || "📋";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Service Not Found</h2>
          <button
            onClick={() => navigate("/services")}
            className="text-amber-600 hover:underline"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/services")}
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Services</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={service.images[currentImageIndex]?.url}
                alt={service.title}
                className="w-full h-full object-cover"
              />
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {service.images.length}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {service.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex
                      ? "border-amber-600 ring-2 ring-amber-600/20"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${service.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Service Details */}
          <div className="space-y-6">
            {/* Title & Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getCategoryIcon(service.category)}</span>
                <span className="text-sm font-medium text-amber-600 uppercase tracking-wide">
                  {service.category}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{service.title}</h1>
            </div>

            {/* Rating */}
            {service.rating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`text-lg ${
                        i < Math.floor(service.rating)
                          ? "text-yellow-400"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-700">
                  {service.rating.toFixed(1)}
                </span>
                <span className="text-gray-500">out of 5</span>
              </div>
            )}

            {/* Price */}
            <div className="bg-amber-50 rounded-xl p-6">
              <p className="text-sm text-gray-600 mb-1">Starting from</p>
              <p className="text-4xl font-bold text-amber-600">
                {formatPrice(service.price)}
              </p>
              <p className="text-sm text-gray-500 mt-1">per service</p>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Service</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {service.description}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">What's Included</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Professional planning",
                  "Expert coordination",
                  "Quality service",
                  "24/7 support",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" />
                    <span className="text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Book Now Button */}
            <button
              onClick={handleBookNow}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-semibold text-lg hover:bg-amber-600 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <FaCalendarAlt />
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        service={{
          id: service._id,
          title: service.title,
          category: service.category,
          price: service.price,
          desc: service.description,
        }}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => {
          toast.success("Booking confirmed!");
          setIsBookingModalOpen(false);
        }}
      />
    </div>
  );
};

export default ServiceDetails;
