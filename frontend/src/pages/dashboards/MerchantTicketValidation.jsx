import { useState } from "react";
import axios from "axios";
import MerchantLayout from "../../components/merchant/MerchantLayout";
import useAuth from "../../context/useAuth";
import { FaTicketAlt, FaCheckCircle, FaTimesCircle, FaSearch, FaQrcode, FaUser, FaCalendarAlt, FaHashtag } from "react-icons/fa";
import { API_BASE, authHeaders } from "../../lib/http";
import { toast } from "react-hot-toast";

const MerchantTicketValidation = () => {
  const { token } = useAuth();
  const [ticketCode, setTicketCode] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleValidateTicket = async (e) => {
    e.preventDefault();
    
    if (!ticketCode.trim()) {
      toast.error("Please enter a ticket code");
      return;
    }

    setLoading(true);
    
    try {
      // Call the actual API endpoint
      const response = await axios.get(
        `${API_BASE}/bookings/merchant/validate-ticket/${encodeURIComponent(ticketCode.trim())}`,
        { headers: authHeaders(token) }
      );

      const data = response.data;
      
      if (data.success) {
        setValidationResult({
          valid: true,
          ...data.booking,
          validatedAt: new Date()
        });
        toast.success(data.message || "Ticket is valid!");
      } else {
        // Handle already used case
        if (data.booking) {
          setValidationResult({
            valid: false,
            alreadyUsed: true,
            ...data.booking,
            usedAt: data.usedAt ? new Date(data.usedAt) : null
          });
        } else {
          setValidationResult({
            valid: false,
            error: data.message || "Ticket is invalid"
          });
        }
        toast.error(data.message || "Ticket validation failed");
      }
    } catch (error) {
      console.error("Validation error:", error);
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to validate ticket";
      
      // Check if it's an "already used" error with booking details
      if (error.response?.data?.booking) {
        const errorData = error.response.data;
        setValidationResult({
          valid: false,
          alreadyUsed: true,
          ...errorData.booking,
          usedAt: errorData.usedAt ? new Date(errorData.usedAt) : null
        });
      } else {
        setValidationResult({
          valid: false,
          error: errorMessage
        });
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTicketCode("");
    setValidationResult(null);
  };

  return (
    <MerchantLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Ticket Validation</h2>
        <p className="text-gray-600 mt-1">Verify and validate attendee tickets at the event</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Validation Form */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaTicketAlt className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Scan or Enter Ticket</h3>
              <p className="text-sm text-gray-500">Validate tickets by entering the code</p>
            </div>
          </div>

          <form onSubmit={handleValidateTicket} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ticket Number / QR Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                  placeholder="Enter ticket code (e.g., TKT-123456-ABC123)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  disabled={loading}
                />
                <FaQrcode className="absolute right-3 top-3.5 text-gray-400 text-xl" />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !ticketCode.trim()}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Validating...
                  </>
                ) : (
                  <>
                    <FaSearch />
                    Validate Ticket
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Reset
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm text-gray-700 mb-2">How to validate:</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Ask attendee for their ticket</li>
              <li>Enter the ticket number or scan QR code</li>
              <li>Click "Validate Ticket"</li>
              <li>Check the validation result</li>
            </ol>
          </div>
        </div>

        {/* Validation Result */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Validation Result</h3>
              <p className="text-sm text-gray-500">Ticket verification status</p>
            </div>
          </div>

          {!validationResult ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FaTicketAlt className="text-6xl mb-4 opacity-20" />
              <p className="text-lg">No ticket validated yet</p>
              <p className="text-sm">Enter a ticket code to validate</p>
            </div>
          ) : (
            <div className={`rounded-lg border-2 p-6 ${
              validationResult.valid 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {validationResult.valid ? (
                  <FaCheckCircle className="text-green-600 text-3xl" />
                ) : (
                  <FaTimesCircle className="text-red-600 text-3xl" />
                )}
                <div>
                  <h4 className={`font-bold text-lg ${
                    validationResult.valid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {validationResult.valid ? 'VALID TICKET' : 'INVALID TICKET'}
                  </h4>
                  <p className={`text-sm ${
                    validationResult.valid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {validationResult.error || `Status: ${validationResult.status}`}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ticket Number:</span>
                  <span className="text-sm font-mono font-medium">{validationResult.ticketNumber || validationResult.id}</span>
                </div>
                
                {validationResult.userName && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <FaUser className="text-gray-400" />
                      Attendee:
                    </span>
                    <span className="text-sm font-medium">{validationResult.userName}</span>
                  </div>
                )}
                
                {validationResult.eventTitle && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-400" />
                      Event:
                    </span>
                    <span className="text-sm font-medium">{validationResult.eventTitle}</span>
                  </div>
                )}
                
                {validationResult.ticketType && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <FaHashtag className="text-gray-400" />
                      Ticket Type:
                    </span>
                    <span className="text-sm font-medium">{validationResult.ticketType}</span>
                  </div>
                )}
                
                {validationResult.quantity && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <span className="text-sm font-medium">{validationResult.quantity}</span>
                  </div>
                )}
                
                {validationResult.totalPrice && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Price:</span>
                    <span className="text-sm font-medium">₹{validationResult.totalPrice.toLocaleString()}</span>
                  </div>
                )}
                
                {validationResult.status && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                      validationResult.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      validationResult.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {validationResult.status}
                    </span>
                  </div>
                )}
                
                {validationResult.validatedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Validated At:</span>
                    <span className="text-sm">
                      {validationResult.validatedAt.toLocaleString()}
                    </span>
                  </div>
                )}
                
                {validationResult.userPhone && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="text-sm font-medium">{validationResult.userPhone}</span>
                  </div>
                )}
                
                {validationResult.userEmail && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium truncate max-w-xs">{validationResult.userEmail}</span>
                  </div>
                )}
              </div>

              {validationResult.valid && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-sm text-green-700 flex items-center gap-2">
                    <FaCheckCircle className="text-lg" />
                    <strong>✓ Valid Entry Approved</strong> - Attendee can enter the event
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    This ticket has been marked as used and cannot be used again.
                  </p>
                </div>
              )}
              
              {validationResult.alreadyUsed && (
                <div className="mt-4 pt-4 border-t border-red-200">
                  <p className="text-sm text-red-700 flex items-center gap-2">
                    <FaTimesCircle className="text-lg" />
                    <strong>⚠ Ticket Already Used</strong>
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    This ticket was previously validated on {validationResult.usedAt?.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Validations Table */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-lg">Recent Validations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-6 py-3">Ticket Number</th>
                <th className="text-left px-6 py-3">Event</th>
                <th className="text-left px-6 py-3">Attendee</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Validated At</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No validations yet. Start validating tickets above.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </MerchantLayout>
  );
};

export default MerchantTicketValidation;
