import { useState, useEffect } from "react";
import axios from "axios";
import MerchantLayout from "../../components/merchant/MerchantLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import toast from "react-hot-toast";
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaMapMarkerAlt, 
  FaCheck, 
  FaTimes, 
  FaClock,
  FaUser,
  FaStickyNote
} from "react-icons/fa";

const MerchantServiceRequests = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  const fetchServiceRequests = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/event-bookings/service-requests`,
        { headers: authHeaders(token) }
      );
      
      if (response.data.success) {
        setRequests(response.data.bookings);
      }
    } catch (error) {
      console.error("Failed to fetch service requests:", error);
      toast.error("Failed to load service requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    setActionLoading(prev => ({ ...prev, [bookingId]: "approving" }));
    
    try {
      const response = await axios.put(
        `${API_BASE}/event-bookings/${bookingId}/approve`,
        {},
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        toast.success("Service request approved!");
        // Update the request in the list
        setRequests(prev => prev.map(request => 
          request._id === bookingId 
            ? { ...request, status: "approved" }
            : request
        ));
      }
    } catch (error) {
      console.error("Failed to approve request:", error);
      toast.error(error.response?.data?.message || "Failed to approve request");
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: null }));
    }
  };

  const handleReject = async (bookingId) => {
    const reason = prompt("Please provide a reason for rejection (optional):");
    
    setActionLoading(prev => ({ ...prev, [bookingId]: "rejecting" }));
    
    try {
      const response = await axios.put(
        `${API_BASE}/event-bookings/${bookingId}/reject`,
        { reason },
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        toast.success("Service request rejected");
        // Update the request in the list
        setRequests(prev => prev.map(request => 
          request._id === bookingId 
            ? { ...request, status: "rejected" }
            : request
        ));
      }
    } catch (error) {
      console.error("Failed to reject request:", error);
      toast.error(error.response?.data?.message || "Failed to reject request");
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: null }));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: FaClock, label: "Pending" },
      approved: { bg: "bg-green-100", text: "text-green-800", icon: FaCheck, label: "Approved" },
      rejected: { bg: "bg-red-100", text: "text-red-800", icon: FaTimes, label: "Rejected" },
      confirmed: { bg: "bg-blue-100", text: "text-blue-800", icon: FaCheck, label: "Confirmed" }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="text-xs" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const filteredRequests = requests.filter(request => {
    if (activeTab === "all") return true;
    return request.status === activeTab;
  });

  const getTabCount = (status) => {
    if (status === "all") return requests.length;
    return requests.filter(r => r.status === status).length;
  };

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
          <p className="text-gray-600 mt-1">Manage booking requests for your full-service events</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <p className="text-gray-500 text-sm">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <p className="text-gray-500 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{getTabCount("pending")}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <p className="text-gray-500 text-sm">Approved</p>
            <p className="text-2xl font-bold text-green-600">{getTabCount("approved")}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <p className="text-gray-500 text-sm">Confirmed</p>
            <p className="text-2xl font-bold text-blue-600">{getTabCount("confirmed")}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 border border-gray-200">
          <div className="flex gap-2">
            {[
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "approved", label: "Approved" },
              { key: "confirmed", label: "Confirmed" },
              { key: "rejected", label: "Rejected" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label} ({getTabCount(tab.key)})
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No service requests found</h3>
            <p className="text-gray-500">
              {activeTab === "all" 
                ? "You haven't received any service requests yet" 
                : `No ${activeTab} requests found`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Request Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {request.eventTitle}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(request.status)}
                          <span className="text-sm text-gray-500">
                            Requested {formatDate(request.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Request Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaUser className="text-blue-500" />
                        <span>
                          <strong>Client:</strong> {request.user?.name || "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaCalendarAlt className="text-green-500" />
                        <span>
                          <strong>Service Date:</strong> {formatDate(request.serviceDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaUsers className="text-purple-500" />
                        <span>
                          <strong>Guests:</strong> {request.guestCount || 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaMapMarkerAlt className="text-red-500" />
                        <span>
                          <strong>Price:</strong> ₹{request.totalPrice?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>

                    {/* Notes */}
                    {request.notes && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-start gap-2">
                          <FaStickyNote className="text-yellow-500 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Special Requirements:</p>
                            <p className="text-sm text-gray-700">{request.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 lg:ml-6 min-w-[200px]">
                    {request.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(request._id)}
                          disabled={actionLoading[request._id]}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                          {actionLoading[request._id] === "approving" ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Approving...
                            </>
                          ) : (
                            <>
                              <FaCheck />
                              Approve Request
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          disabled={actionLoading[request._id]}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                        >
                          {actionLoading[request._id] === "rejecting" ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Rejecting...
                            </>
                          ) : (
                            <>
                              <FaTimes />
                              Reject Request
                            </>
                          )}
                        </button>
                      </>
                    )}
                    
                    {request.status === "approved" && (
                      <div className="text-center">
                        <p className="text-sm text-green-600 font-medium mb-1">
                          ✅ Request Approved
                        </p>
                        <p className="text-xs text-gray-500">
                          Waiting for client payment
                        </p>
                      </div>
                    )}
                    
                    {request.status === "confirmed" && (
                      <div className="text-center">
                        <p className="text-sm text-blue-600 font-medium mb-1">
                          🎉 Service Confirmed
                        </p>
                        <p className="text-xs text-gray-500">
                          Payment completed
                        </p>
                      </div>
                    )}
                    
                    {request.status === "rejected" && (
                      <div className="text-center">
                        <p className="text-sm text-red-600 font-medium mb-1">
                          ❌ Request Rejected
                        </p>
                        <p className="text-xs text-gray-500">
                          No further action needed
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MerchantLayout>
  );
};

export default MerchantServiceRequests;