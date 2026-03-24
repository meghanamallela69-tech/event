import { useState } from "react";
import PropTypes from "prop-types";
import { FaTimes, FaDownload, FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaQrcode } from "react-icons/fa";

const TicketSuccessModal = ({ isOpen, onClose, ticketData, onDownloadTicket, onViewBookings }) => {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !ticketData) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await onDownloadTicket(ticketData);
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FaTicketAlt className="text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Payment Successful!</h2>
              <p className="text-sm text-gray-600">Your ticket has been generated</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {/* Ticket Preview */}
        <div className="p-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{ticketData.eventTitle}</h3>
              <div className="text-right">
                <p className="text-sm opacity-90">Ticket ID</p>
                <p className="font-mono text-sm">{ticketData.ticketId}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-white/80" />
                <div>
                  <p className="text-xs opacity-80">Date</p>
                  <p className="text-sm font-medium">{formatDate(ticketData.eventDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-white/80" />
                <div>
                  <p className="text-xs opacity-80">Location</p>
                  <p className="text-sm font-medium">{ticketData.location || "Venue TBD"}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <FaUser className="text-white/80" />
                <div>
                  <p className="text-xs opacity-80">Attendee</p>
                  <p className="text-sm font-medium">{ticketData.userName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaTicketAlt className="text-white/80" />
                <div>
                  <p className="text-xs opacity-80">Tickets</p>
                  <p className="text-sm font-medium">{ticketData.ticketCount} ticket{ticketData.ticketCount > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <div>
                <p className="text-xs opacity-80">Organized by</p>
                <p className="text-sm font-medium">{ticketData.merchantName}</p>
              </div>
              <div className="flex items-center gap-2">
                <FaQrcode className="text-2xl text-white/80" />
                <div className="text-right">
                  <p className="text-xs opacity-80">QR Code</p>
                  <p className="text-xs">Scan at venue</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Booking Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-mono">{ticketData.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-mono">{ticketData.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold text-green-600">₹{ticketData.amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="capitalize">{ticketData.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-yellow-800 mb-2">Important Instructions</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Please arrive 30 minutes before the event starts</li>
              <li>• Bring a valid ID for verification</li>
              <li>• Show this ticket (digital or printed) at the entrance</li>
              <li>• Contact the organizer for any queries</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onViewBookings}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            View My Bookings
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <FaDownload />
                Download Ticket
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

TicketSuccessModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  ticketData: PropTypes.object,
  onDownloadTicket: PropTypes.func.isRequired,
  onViewBookings: PropTypes.func.isRequired
};

export default TicketSuccessModal;