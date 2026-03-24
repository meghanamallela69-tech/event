import { useState } from "react";
import PropTypes from "prop-types";
import { FaTimes, FaDownload, FaCheckCircle, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaReceipt } from "react-icons/fa";

const ServiceSuccessModal = ({ isOpen, onClose, bookingData, onDownloadInvoice, onViewBookings }) => {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !bookingData) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await onDownloadInvoice(bookingData);
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date will be confirmed by merchant";
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
              <FaCheckCircle className="text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Payment Successful!</h2>
              <p className="text-sm text-gray-600">Your service booking is confirmed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {/* Service Confirmation */}
        <div className="p-6">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{bookingData.eventTitle}</h3>
              <div className="text-right">
                <p className="text-sm opacity-90">Booking ID</p>
                <p className="font-mono text-sm">{bookingData._id}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-white/80" />
                <div>
                  <p className="text-xs opacity-80">Service Date</p>
                  <p className="text-sm font-medium">{formatDate(bookingData.serviceDate || bookingData.selectedDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-white/80" />
                <div>
                  <p className="text-xs opacity-80">Location</p>
                  <p className="text-sm font-medium">{bookingData.location || "To be confirmed"}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <FaUser className="text-white/80" />
                <div>
                  <p className="text-xs opacity-80">Customer</p>
                  <p className="text-sm font-medium">{bookingData.userName}</p>
                </div>
              </div>
              {bookingData.guestCount && (
                <div className="flex items-center gap-2">
                  <FaUser className="text-white/80" />
                  <div>
                    <p className="text-xs opacity-80">Guests</p>
                    <p className="text-sm font-medium">{bookingData.guestCount} people</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <div>
                <p className="text-xs opacity-80">Service Provider</p>
                <p className="text-sm font-medium">{bookingData.merchantName}</p>
              </div>
              <div className="flex items-center gap-2">
                <FaReceipt className="text-2xl text-white/80" />
                <div className="text-right">
                  <p className="text-xs opacity-80">Invoice</p>
                  <p className="text-xs">Ready for download</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-mono">{bookingData._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-mono">{bookingData.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold text-green-600">₹{bookingData.totalPrice?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="capitalize">{bookingData.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2">What's Next?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• The merchant will contact you within 24 hours to confirm final details</li>
              <li>• Service date and location will be finalized based on your preferences</li>
              <li>• You will receive a detailed service agreement via email</li>
              <li>• Keep your booking ID for reference</li>
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
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <FaDownload />
                Download Invoice
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

ServiceSuccessModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookingData: PropTypes.object,
  onDownloadInvoice: PropTypes.func.isRequired,
  onViewBookings: PropTypes.func.isRequired
};

export default ServiceSuccessModal;