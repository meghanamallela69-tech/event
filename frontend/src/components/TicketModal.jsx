import { useRef } from "react";
import { FaTimes, FaDownload, FaQrcode, FaCalendar, FaMapMarkerAlt, FaTicketAlt } from "react-icons/fa";
import QRCode from "react-qr-code";

const TicketModal = ({ booking, isOpen, onClose }) => {
  const ticketRef = useRef(null);

  if (!isOpen || !booking) return null;

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    // For now, we'll print the ticket
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const ticketData = {
    ticketNumber: booking.ticket?.ticketNumber || "N/A",
    eventName: booking.serviceTitle,
    eventDate: formatDate(booking.eventDate),
    eventTime: formatTime(booking.eventDate),
    location: booking.location || "TBD",
    ticketType: booking.ticket?.ticketType || "Standard",
    quantity: booking.ticket?.quantity || booking.guestCount || 1,
    bookingId: booking._id,
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          maxWidth: "450px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937", display: "flex", alignItems: "center", gap: "8px" }}>
            <FaTicketAlt style={{ color: "#a2783a" }} />
            Your Ticket
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
            }}
          >
            <FaTimes style={{ fontSize: "20px", color: "#6b7280" }} />
          </button>
        </div>

        {/* Ticket */}
        <div ref={ticketRef} style={{ padding: "24px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #a2783a 0%, #c49a5e 100%)",
              borderRadius: "16px",
              padding: "24px",
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative circles */}
            <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "120px", height: "120px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />

            {/* Ticket Header */}
            <div style={{ textAlign: "center", marginBottom: "20px", position: "relative", zIndex: 1 }}>
              <h3 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", opacity: 0.9, marginBottom: "4px" }}>
                EventHub
              </h3>
              <h2 style={{ fontSize: "22px", fontWeight: "700" }}>{ticketData.eventName}</h2>
            </div>

            {/* Ticket Details */}
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "12px", padding: "16px", marginBottom: "20px", position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <FaCalendar style={{ opacity: 0.8 }} />
                <div>
                  <p style={{ fontSize: "12px", opacity: 0.8 }}>Date & Time</p>
                  <p style={{ fontWeight: "600" }}>{ticketData.eventDate}</p>
                  {ticketData.eventTime && <p style={{ fontSize: "14px" }}>{ticketData.eventTime}</p>}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FaMapMarkerAlt style={{ opacity: 0.8 }} />
                <div>
                  <p style={{ fontSize: "12px", opacity: 0.8 }}>Location</p>
                  <p style={{ fontWeight: "600" }}>{ticketData.location}</p>
                </div>
              </div>
            </div>

            {/* Ticket Type & Quantity */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", position: "relative", zIndex: 1 }}>
              <div style={{ textAlign: "center", flex: 1 }}>
                <p style={{ fontSize: "11px", opacity: 0.8, textTransform: "uppercase" }}>Ticket Type</p>
                <p style={{ fontWeight: "700", fontSize: "16px" }}>{ticketData.ticketType}</p>
              </div>
              <div style={{ width: "1px", background: "rgba(255,255,255,0.3)" }} />
              <div style={{ textAlign: "center", flex: 1 }}>
                <p style={{ fontSize: "11px", opacity: 0.8, textTransform: "uppercase" }}>Quantity</p>
                <p style={{ fontWeight: "700", fontSize: "16px" }}>{ticketData.quantity}</p>
              </div>
            </div>

            {/* QR Code */}
            <div style={{ background: "white", borderRadius: "12px", padding: "16px", textAlign: "center", position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-block", padding: "8px", background: "white", borderRadius: "8px" }}>
                <QRCode
                  value={JSON.stringify({
                    ticketNumber: ticketData.ticketNumber,
                    bookingId: ticketData.bookingId,
                    event: ticketData.eventName,
                  })}
                  size={150}
                  level="H"
                />
              </div>
              <p style={{ color: "#1f2937", fontSize: "12px", marginTop: "8px", fontFamily: "monospace" }}>
                {ticketData.ticketNumber}
              </p>
            </div>

            {/* Footer */}
            <p style={{ textAlign: "center", fontSize: "11px", opacity: 0.7, marginTop: "16px", position: "relative", zIndex: 1 }}>
              Present this ticket at the event entrance
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: "0 24px 24px", display: "flex", gap: "12px" }}>
          <button
            onClick={handleDownload}
            style={{
              flex: 1,
              padding: "14px 24px",
              backgroundColor: "#a2783a",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <FaDownload />
            Download / Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
