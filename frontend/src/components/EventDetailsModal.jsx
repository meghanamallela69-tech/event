import React from "react";
import PropTypes from "prop-types";
import { FaTimes, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaCheck, FaClock } from "react-icons/fa";
import { getEventStatus } from "../lib/utils";

const EventDetailsModal = ({ isOpen, onClose, event, onBookNow }) => {
  if (!isOpen || !event) return null;

  const status = getEventStatus(event);
  const eventImages = event.images && event.images.length > 0 
    ? event.images.map(img => img.url) 
    : ["/party.jpg"]; // Fallback image

  // Default features if not provided
  const defaultFeatures = [
    "Professional Photography",
    "Catering & Refreshments", 
    "Live Entertainment",
    "Decoration & Setup",
    "Sound & Lighting",
    "Event Coordinator"
  ];

  const features = event.features && event.features.length > 0 ? event.features : defaultFeatures;

  // Check if we're in a dashboard layout (has sidebar) or regular page layout
  const isDashboardLayout = window.location.pathname.includes('/dashboard/');
  
  return (
    <>
      {/* Full screen overlay to hide page content */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 60, // Higher than sidebar (z-50) but lower than modal content
        }}
        onClick={onClose}
      />
      
      {/* Modal positioned to avoid sidebar */}
      <div
        style={{
          position: "fixed",
          top: "64px", // Start below the top navbar
          left: isDashboardLayout ? "256px" : 0, // Start after sidebar in dashboard
          right: 0,
          bottom: 0,
          backgroundColor: "white",
          zIndex: 70, // Higher than overlay and sidebar
          overflow: "hidden",
        }}
      >
      {/* Modal Content - Full Height */}
      <div style={{ height: "100%", display: "flex" }}>
        
        {/* LEFT SIDE - Image Gallery */}
        <div style={{ 
          width: "50%", // Fixed 50% width
          backgroundColor: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          position: "relative"
        }}>
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(0, 0, 0, 0.7)",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              color: "white",
              fontSize: "18px"
            }}
          >
            ✕
          </button>

          {/* Main Banner Image - 50% height */}
          <div style={{ 
            height: "50%", // Reduced from 60% to 50%
            position: "relative",
            overflow: "hidden"
          }}>
            <img 
              src={eventImages[0]} 
              alt={event.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
            {/* Overlay with Event Info */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
              padding: "40px 30px 30px",
              color: "white"
            }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                marginBottom: "12px",
                backgroundColor: status.label === 'Available' ? '#10b981' : 
                                status.label === 'Past' ? '#6b7280' : '#f59e0b',
                color: "white"
              }}>
                {status.label}
              </div>
              <h1 style={{ 
                fontSize: "32px", 
                fontWeight: "700", 
                marginBottom: "8px",
                textShadow: "0 2px 4px rgba(0,0,0,0.5)"
              }}>
                {event.title}
              </h1>
              <p style={{ 
                fontSize: "16px", 
                opacity: 0.9,
                marginBottom: "12px"
              }}>
                {event.category} • {event.location}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaCalendarAlt />
                  <span>
                    {(() => {
                      // Try multiple date sources
                      let dateToUse = event.date || event.eventDate || event.createdAt;
                      
                      if (dateToUse) {
                        try {
                          const date = new Date(dateToUse);
                          // Check if date is valid
                          if (!isNaN(date.getTime())) {
                            return date.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short", 
                              day: "numeric",
                              year: "numeric"
                            });
                          }
                        } catch (e) {
                          console.error('Date parsing error:', e);
                        }
                      }
                      
                      // Fallback to a default future date
                      const futureDate = new Date();
                      futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
                      return futureDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short", 
                        day: "numeric",
                        year: "numeric"
                      });
                    })()}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaClock />
                  <span>
                    {(() => {
                      // Try multiple time sources
                      let timeToUse = event.time || event.eventTime;
                      
                      if (timeToUse && timeToUse !== "TBD") {
                        try {
                          // Convert 24-hour format to 12-hour format if needed
                          if (timeToUse.includes(':') && !timeToUse.includes('M')) {
                            const [hours, minutes] = timeToUse.split(':');
                            const hour = parseInt(hours);
                            const ampm = hour >= 12 ? 'PM' : 'AM';
                            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                            return `${displayHour}:${minutes} ${ampm}`;
                          }
                          return timeToUse;
                        } catch (e) {
                          console.error('Time parsing error:', e);
                        }
                      }
                      
                      // Default time
                      return "6:00 PM";
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Image Gallery Thumbnails - 50% height */}
          <div style={{ 
            height: "50%", // Increased from 40% to 50%
            padding: "24px",
            backgroundColor: "white",
            borderTop: "1px solid #e5e7eb",
            overflow: "hidden"
          }}>
            <h3 style={{ 
              fontSize: "18px", 
              fontWeight: "600", 
              marginBottom: "16px",
              color: "#374151"
            }}>
              Event Gallery
            </h3>
            {eventImages.length > 0 ? (
              <div style={{ 
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: "16px",
                height: "calc(100% - 50px)",
                overflowY: "auto"
              }}>
                {eventImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${event.title} ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "140px", // Increased from 120px to 140px
                      objectFit: "cover",
                      borderRadius: "12px",
                      cursor: "pointer",
                      border: "3px solid transparent",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = "#a2783a";
                      e.target.style.transform = "scale(1.05)";
                      e.target.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = "transparent";
                      e.target.style.transform = "scale(1)";
                      e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                    }}
                  />
                ))}
              </div>
            ) : (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "calc(100% - 50px)",
                color: "#9ca3af",
                fontSize: "14px"
              }}>
                No additional images available
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE - Event Details */}
        <div style={{ 
          width: "50%", // Fixed 50% width
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid #e5e7eb"
        }}>
          {/* Header */}
          <div style={{
            padding: "24px 32px",
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#fafafa"
          }}>
            <h2 style={{ 
              fontSize: "24px", 
              fontWeight: "700", 
              color: "#1f2937",
              marginBottom: "4px"
            }}>
              Event Details
            </h2>
            <p style={{ 
              color: "#6b7280", 
              fontSize: "14px" 
            }}>
              Complete information about this event
            </p>
          </div>

          {/* Details Container */}
          <div style={{ 
            flex: "1", 
            overflowY: "auto",
            padding: "32px"
          }}>
            {/* Description */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ 
                fontSize: "18px", 
                fontWeight: "600", 
                marginBottom: "12px",
                color: "#374151"
              }}>
                About This Event
              </h3>
              <p style={{ 
                color: "#6b7280", 
                lineHeight: "1.6",
                fontSize: "14px"
              }}>
                {event.description || "Join us for an amazing event experience!"}
              </p>
            </div>

            {/* What's Included - REMOVED */}

            {/* Event Details */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ 
                fontSize: "18px", 
                fontWeight: "600", 
                marginBottom: "16px",
                color: "#374151"
              }}>
                Event Information
              </h3>
              <div style={{
                backgroundColor: "#f9fafb",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #e5e7eb"
              }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center",
                  marginBottom: "16px"
                }}>
                  <FaCalendarAlt style={{ 
                    color: "#3b82f6", 
                    marginRight: "12px",
                    fontSize: "16px"
                  }} />
                  <div>
                    <p style={{ 
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "14px",
                      marginBottom: "2px"
                    }}>
                      Date & Time
                    </p>
                    <p style={{ 
                      color: "#6b7280",
                      fontSize: "14px"
                    }}>
                      {(() => {
                        // Try multiple date sources
                        let dateToUse = event.date || event.eventDate || event.createdAt;
                        
                        if (dateToUse) {
                          try {
                            const date = new Date(dateToUse);
                            // Check if date is valid
                            if (!isNaN(date.getTime())) {
                              return date.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              });
                            }
                          } catch (e) {
                            console.error('Date parsing error:', e);
                          }
                        }
                        
                        // Fallback to a default future date
                        const futureDate = new Date();
                        futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
                        return futureDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        });
                      })()}
                    </p>
                    <p style={{ 
                      color: "#6b7280",
                      fontSize: "12px"
                    }}>
                      {(() => {
                        // Try multiple time sources
                        let timeToUse = event.time || event.eventTime;
                        
                        if (timeToUse && timeToUse !== "TBD") {
                          try {
                            // Convert 24-hour format to 12-hour format if needed
                            if (timeToUse.includes(':') && !timeToUse.includes('M')) {
                              const [hours, minutes] = timeToUse.split(':');
                              const hour = parseInt(hours);
                              const ampm = hour >= 12 ? 'PM' : 'AM';
                              const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                              return `${displayHour}:${minutes} ${ampm}`;
                            }
                            return timeToUse;
                          } catch (e) {
                            console.error('Time parsing error:', e);
                          }
                        }
                        
                        // Default time
                        return "6:00 PM";
                      })()}
                    </p>
                  </div>
                </div>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center"
                }}>
                  <FaMapMarkerAlt style={{ 
                    color: "#ef4444", 
                    marginRight: "12px",
                    fontSize: "16px"
                  }} />
                  <div>
                    <p style={{ 
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "14px",
                      marginBottom: "2px"
                    }}>
                      Location
                    </p>
                    <p style={{ 
                      color: "#6b7280",
                      fontSize: "14px"
                    }}>
                      {event.location || "Location TBD"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Organizer Section */}
            {event.createdBy?.name && (
              <div style={{ marginBottom: "32px" }}>
                <h3 style={{ 
                  fontSize: "18px", 
                  fontWeight: "600", 
                  marginBottom: "16px",
                  color: "#374151"
                }}>
                  Organizer
                </h3>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#f3f4f6",
                  padding: "20px",
                  borderRadius: "12px"
                }}>
                  <div style={{
                    backgroundColor: "#a2783a",
                    padding: "12px",
                    borderRadius: "50%",
                    marginRight: "16px"
                  }}>
                    <FaUser style={{ color: "white", fontSize: "16px" }} />
                  </div>
                  <div>
                    <p style={{ 
                      fontWeight: "600",
                      color: "#374151",
                      fontSize: "16px",
                      marginBottom: "2px"
                    }}>
                      {event.createdBy.name}
                    </p>
                    <p style={{ 
                      color: "#6b7280",
                      fontSize: "14px"
                    }}>
                      Event Organizer
                    </p>
                    {event.createdBy.email && (
                      <p style={{ 
                        color: "#9ca3af",
                        fontSize: "12px"
                      }}>
                        {event.createdBy.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Section - Price and Book Now */}
          <div style={{
            borderTop: "1px solid #e5e7eb",
            padding: "24px 32px",
            backgroundColor: "#fafafa"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "24px"
            }}>
              <div>
                <p style={{ 
                  color: "#6b7280",
                  fontSize: "14px",
                  marginBottom: "4px"
                }}>
                  Price per person
                </p>
                <p style={{ 
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#374151"
                }}>
                  {event.price > 0 ? `₹${event.price.toLocaleString()}` : "FREE"}
                </p>
              </div>
              <button
                onClick={() => onBookNow(event)}
                disabled={status.label === 'Past' || status.label === 'Sold Out'}
                style={{
                  padding: "16px 32px",
                  borderRadius: "12px",
                  fontWeight: "600",
                  fontSize: "16px",
                  border: "none",
                  cursor: status.label === 'Past' || status.label === 'Sold Out' ? "not-allowed" : "pointer",
                  backgroundColor: status.label === 'Past' || status.label === 'Sold Out' ? "#d1d5db" : "#a2783a",
                  color: status.label === 'Past' || status.label === 'Sold Out' ? "#6b7280" : "white",
                  transition: "all 0.3s ease",
                  transform: status.label === 'Past' || status.label === 'Sold Out' ? "none" : "translateY(0)",
                }}
                onMouseEnter={(e) => {
                  if (status.label !== 'Past' && status.label !== 'Sold Out') {
                    e.target.style.backgroundColor = "#92692d";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (status.label !== 'Past' && status.label !== 'Sold Out') {
                    e.target.style.backgroundColor = "#a2783a";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }
                }}
              >
                {status.label === 'Past' ? 'Event Ended' : 
                 status.label === 'Sold Out' ? 'Sold Out' : 'Book Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

EventDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  event: PropTypes.object,
  onBookNow: PropTypes.func.isRequired,
};

export default EventDetailsModal;