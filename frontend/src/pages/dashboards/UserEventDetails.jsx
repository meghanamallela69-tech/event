import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import UserLayout from "../../components/user/UserLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { FiCalendar, FiMapPin, FiUser, FiArrowLeft } from "react-icons/fi";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import toast from "react-hot-toast";
import ImageSlider from "../../components/ImageSlider";
import BookingModal from "../../components/BookingModal";

const UserEventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [userBookingId, setUserBookingId] = useState(null);

  useEffect(() => {
    fetchEventDetails();
    checkRegistration();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE}/events`, {
        headers: authHeaders(token),
      });
      if (response.data.success) {
        const foundEvent = response.data.events.find((e) => e._id === eventId);
        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          toast.error("Event not found");
          navigate("/dashboard/user/browse");
        }
      }
    } catch (error) {
      toast.error("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const checkRegistration = async () => {
    try {
      const response = await axios.get(`${API_BASE}/events/me`, {
        headers: authHeaders(token),
      });
      if (response.data.success) {
        const userRegistrations = response.data.registrations || response.data.bookings || [];
        const userBooking = userRegistrations.find(
          (reg) => reg.event?._id === eventId || reg.eventId === eventId
        );
        setIsRegistered(!!userBooking);
        setUserBookingId(userBooking?._id || null);
      }
    } catch (error) {
      console.error("Failed to check registration");
    }
  };

  const handleBookEvent = () => {
    if (isRegistered) {
      toast.info("You are already registered for this event");
      return;
    }
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = () => {
    setBookingModalOpen(false);
    setIsRegistered(true);
    toast.success("Successfully registered for the event!");
  };

  const handleCancelBooking = async () => {
    if (!userBookingId) {
      toast.error("Booking not found");
      return;
    }
    
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setBooking(true);
    try {
      await axios.delete(`${API_BASE}/bookings/${userBookingId}`, {
        headers: authHeaders(token)
      });
      toast.success("Booking cancelled successfully");
      setIsRegistered(false);
      setUserBookingId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    } finally {
      setBooking(false);
    }
  };

  const handleSaveEvent = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Event removed from saved" : "Event saved successfully");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Time TBD";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </UserLayout>
    );
  }

  if (!event) {
    return (
      <UserLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Event not found</p>
          <button
            onClick={() => navigate("/dashboard/user/browse")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Events
          </button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard/user/browse")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <FiArrowLeft />
        Back to Events
      </button>

      {/* Event Header */}
      <section className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="relative h-64 md:h-80">
          {event.images && event.images.length > 0 ? (
            <ImageSlider images={event.images} />
          ) : event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : event.bannerImage ? (
            <img
              src={event.bannerImage}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-sm mb-3">
                  {event.category || "Event"}
                </span>
                <h1 className="text-2xl md:text-4xl font-bold text-white">
                  {event.title}
                </h1>
              </div>
              <button
                onClick={handleSaveEvent}
                className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition"
              >
                {isSaved ? (
                  <BsBookmarkFill className="text-white text-xl" />
                ) : (
                  <BsBookmark className="text-white text-xl" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Event Info */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">About This Event</h3>
                <p className="text-gray-600 leading-relaxed">
                  {event.description || "No description available for this event."}
                </p>
              </div>

              {/* Rating */}
              {event.rating > 0 && (
                <div className="flex items-center gap-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl">⭐</div>
                  <div>
                    <p className="text-sm text-gray-600">Event Rating</p>
                    <p className="font-semibold text-lg text-yellow-700">{event.rating.toFixed(1)} / 5.0</p>
                  </div>
                </div>
              )}

              {/* Features */}
              {event.features && event.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Event Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FiCalendar className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{formatDate(event.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FiCalendar className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">{formatTime(event.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FiMapPin className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{event.location || "Location TBD"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <FiUser className="text-orange-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Organizer</p>
                    <p className="font-medium">{event.organizer || "EventHub"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Card */}
            <div className="bg-gray-50 rounded-xl p-6 h-fit">
              <h3 className="text-lg font-semibold mb-4">Event Registration</h3>
              
              {event.price > 0 ? (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Ticket Price</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(event.price)}
                  </p>
                </div>
              ) : (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Ticket Price</p>
                  <p className="text-3xl font-bold text-green-600">Free</p>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Available Seats</span>
                  <span className="font-medium">{event.seats || "Unlimited"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Registration Deadline</span>
                  <span className="font-medium">{formatDate(event.registrationDeadline) || "Open"}</span>
                </div>
              </div>

              {isRegistered ? (
                <>
                  <button
                    disabled={true}
                    className="w-full py-3 rounded-lg font-medium bg-green-600 text-white cursor-default mb-3"
                  >
                    Already Registered
                  </button>
                  <button
                    onClick={handleCancelBooking}
                    disabled={booking}
                    className="w-full py-3 rounded-lg font-medium bg-red-100 text-red-600 hover:bg-red-200 transition"
                  >
                    {booking ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        Cancelling...
                      </span>
                    ) : (
                      "Cancel Booking"
                    )}
                  </button>
                  <p className="text-center text-green-600 text-sm mt-3">
                    You have successfully registered for this event!
                  </p>
                </>
              ) : (
                <button
                  onClick={handleBookEvent}
                  disabled={booking}
                  className="w-full py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Book Now
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {bookingModalOpen && event && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          service={{
            _id: event._id,
            title: event.title,
            category: event.category,
            price: event.price,
            location: event.location,
            images: event.images,
            eventType: event.eventType,
            ticketTypes: event.ticketTypes
          }}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </UserLayout>
  );
};

export default UserEventDetails;
