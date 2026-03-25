import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import UserLayout from "../../components/user/UserLayout";
import { API_BASE, authHeaders } from "../../lib/http";
import { 
  FaCreditCard, 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle,
  FaEye,
  FaFilter,
  FaRupeeSign
} from "react-icons/fa";
import toast from "react-hot-toast";

const UserPayments = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusConfig = {
      success: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: FaCheckCircle,
        label: "Completed"
      },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: FaClock,
        label: "Pending"
      },
      failed: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: FaTimesCircle,
        label: "Failed"
      },
      refunded: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: FaCreditCard,
        label: "Refunded"
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="text-xs" />
        {config.label}
      </span>
    );
  };

  // Load user payments
  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const headers = authHeaders(token);
      const response = await axios.get(`${API_BASE}/payments/user/my-payments`, {
        headers,
        params: { status: statusFilter }
      });

      if (response.data.success) {
        setPayments(response.data.payments);
        setFilteredPayments(response.data.payments);
      }
    } catch (error) {
      console.error("Failed to load payments:", error);
      toast.error(error.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // Handle filter change
  const handleFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
  };

  // View receipt
  const handleViewReceipt = async (paymentId) => {
    try {
      const headers = authHeaders(token);
      const response = await axios.get(`${API_BASE}/payments/details/${paymentId}`, {
        headers
      });

      if (response.data.success) {
        setSelectedPayment(response.data.payment);
        setShowReceiptModal(true);
      }
    } catch (error) {
      console.error("Failed to load payment details:", error);
      toast.error("Failed to load payment details");
    }
  };

  // Close receipt modal
  const closeReceiptModal = () => {
    setShowReceiptModal(false);
    setSelectedPayment(null);
  };

  return (
    <UserLayout>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">My Payments</h2>
        <p className="text-gray-600 mt-1">View and track all your payment transactions</p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <FaFilter className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "all", label: "All", color: "bg-gray-100 text-gray-700" },
              { value: "success", label: "Completed", color: "bg-green-100 text-green-700" },
              { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-700" },
              { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleFilterChange(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === filter.value
                    ? `${filter.color} ring-2 ring-offset-2 ring-gray-400`
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Loading payments...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                    <FaCreditCard className="mx-auto text-4xl text-gray-300 mb-3" />
                    <p>No payments found</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr 
                    key={payment._id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 font-mono">
                        #{payment._id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {payment.eventName || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 capitalize">
                        {payment.eventType || payment.description || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(payment.totalAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-gray-500 font-mono">
                        {payment.transactionId.slice(0, 12)}...
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewReceipt(payment._id)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <FaEye className="text-xs" />
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Payment Receipt</h3>
                  <p className="text-blue-100 mt-1">Transaction Details</p>
                </div>
                <button
                  onClick={closeReceiptModal}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Payment Status */}
              <div className="text-center pb-6 border-b">
                {getStatusBadge(selectedPayment.payment.paymentStatus)}
                <p className="text-sm text-gray-600 mt-2">
                  {selectedPayment.formattedData.date}
                </p>
              </div>

              {/* Payment Details Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-gray-900">{selectedPayment.payment.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="font-semibold text-gray-900">{selectedPayment.formattedData.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="text-gray-900">{selectedPayment.payment.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Gateway:</span>
                      <span className="text-gray-900">{selectedPayment.payment.paymentGateway || "Manual"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Event Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Event Name:</span>
                      <span className="text-gray-900">{selectedPayment.event?.title || selectedPayment.payment.eventName || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Event Type:</span>
                      <span className="text-gray-900">{selectedPayment.event?.eventType || selectedPayment.payment.eventType || "N/A"}</span>
                    </div>
                    {selectedPayment.event?.date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Event Date:</span>
                        <span className="text-gray-900">{new Date(selectedPayment.event.date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Merchant Information */}
              {selectedPayment.merchant && (
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Merchant Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Merchant Name:</span>
                      <span className="text-gray-900">{selectedPayment.merchant.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Merchant Email:</span>
                      <span className="text-gray-900">{selectedPayment.merchant.email}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Information */}
              {selectedPayment.booking && (
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Booking Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-mono text-gray-900">{selectedPayment.booking._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Title:</span>
                      <span className="text-gray-900">{selectedPayment.booking.serviceTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="text-gray-900">{selectedPayment.booking.serviceCategory}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Details */}
              {(selectedPayment.payment.refundAmount > 0 || selectedPayment.payment.description) && (
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Details</h4>
                  {selectedPayment.payment.refundAmount > 0 && (
                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Refund Amount:</span>
                        <span className="text-red-600 font-semibold">
                          {formatCurrency(selectedPayment.payment.refundAmount)}
                        </span>
                      </div>
                      {selectedPayment.payment.refundReason && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Refund Reason:</span>
                          <span className="text-gray-900">{selectedPayment.payment.refundReason}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedPayment.payment.description && (
                    <div className="text-sm">
                      <span className="text-gray-600">Description:</span>
                      <p className="text-gray-900 mt-1">{selectedPayment.payment.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-6 rounded-b-2xl border-t">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Total Amount Paid</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedPayment.formattedData.amount}</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default UserPayments;
