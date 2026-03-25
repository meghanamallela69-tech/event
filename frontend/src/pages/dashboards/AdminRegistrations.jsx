import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { FaBook, FaCheck, FaTimes, FaClock, FaDollarSign, FaCalendar, FaMapMarkerAlt } from "react-icons/fa";
import toast from "react-hot-toast";

const AdminRegistrations = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/admin/bookings/all`, { 
        headers: authHeaders(token) 
      });
      
      if (response.data.success) {
        setBookings(response.data.bookings || []);
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast.error(error.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
      refunded: 'bg-blue-100 text-blue-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const getBookingStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-100 text-green-700',
      confirmed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-purple-100 text-purple-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">All Bookings</h2>
        <p className="text-gray-600 mt-1">Complete list of all bookings and registrations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{bookings.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaBook className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaDollarSign className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Paid Bookings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {bookings.filter(b => b.paymentStatus === 'paid').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FaCheck className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">All Bookings</h3>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaBook className="mx-auto text-6xl text-gray-300 mb-4" />
            <p>No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-600">
                      {booking.bookingId.toString().slice(-8)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.userName}</div>
                      <div className="text-xs text-gray-500">{booking.userEmail}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.eventName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        booking.eventType === 'ticketed' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {booking.eventType === 'ticketed' ? 'Ticketed' : 'Full Service'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FaCalendar className="text-gray-400 text-xs" />
                        {formatDate(booking.date)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FaClock className="text-gray-400 text-xs" />
                        {formatTime(booking.time)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate">
                      <div className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-gray-400 text-xs" />
                        {booking.location || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {booking.quantity || 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(booking.totalAmount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getBookingStatusBadge(booking.bookingStatus)}`}>
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(booking.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRegistrations;
