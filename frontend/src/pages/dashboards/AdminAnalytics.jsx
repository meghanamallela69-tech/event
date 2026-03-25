import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { 
  FaChartLine, FaDollarSign, FaCalendarCheck, FaStore, 
  FaUsers, FaArrowUp, FaArrowDown, FaRupeeSign,
  FaChartBar, FaClock, FaStar
} from "react-icons/fa";
import toast from "react-hot-toast";

const AdminAnalytics = () => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/admin/analytics`, { 
        headers: authHeaders(token) 
      });
      
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error(error.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`;
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

  if (!analytics) {
    return (
      <AdminLayout>
        <div className="text-center py-12 text-gray-500">
          No analytics data available
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Platform Analytics</h2>
        <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">This Month's Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(analytics.revenue.currentMonth)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaDollarSign className="text-green-600 text-xl" />
            </div>
          </div>
          {analytics.revenue.growth >= 0 ? (
            <div className="mt-2 flex items-center text-green-600 text-sm">
              <FaArrowUp className="mr-1" />
              <span>{analytics.revenue.growth}% from last month</span>
            </div>
          ) : (
            <div className="mt-2 flex items-center text-red-600 text-sm">
              <FaArrowDown className="mr-1" />
              <span>{Math.abs(analytics.revenue.growth)}% from last month</span>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Last Month's Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(analytics.revenue.lastMonth)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaRupeeSign className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Admin Commission</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(analytics.revenue.commission)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FaChartLine className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {analytics.bookings.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <FaCalendarCheck className="text-orange-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.platform.totalUsers}</p>
              <p className="text-xs text-gray-500 mt-1">Active: {analytics.platform.activeUsers}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <FaUsers className="text-indigo-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Merchants</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.platform.totalMerchants}</p>
              <p className="text-xs text-gray-500 mt-1">Active: {analytics.platform.activeMerchants}</p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <FaStore className="text-teal-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Events</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.platform.totalEvents}</p>
              <p className="text-xs text-gray-500 mt-1">Active: {analytics.platform.activeEvents}</p>
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
              <FaStar className="text-pink-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bookings by Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaChartBar /> Bookings by Status
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {Object.entries(analytics.bookings.byStatus).map(([status, count]) => {
                const percentage = ((count / analytics.bookings.total) * 100).toFixed(1);
                const colors = {
                  pending: 'bg-yellow-500',
                  accepted: 'bg-green-500',
                  confirmed: 'bg-blue-500',
                  paid: 'bg-purple-500',
                  cancelled: 'bg-red-500',
                  completed: 'bg-gray-500'
                };
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize font-medium">{status}</span>
                      <span className="text-gray-600">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${colors[status] || 'bg-gray-500'} h-2 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bookings by Event Type */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaChartBar /> Bookings by Event Type
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {Object.entries(analytics.bookings.byEventType).map(([type, count]) => {
                const percentage = ((count / analytics.bookings.total) * 100).toFixed(1);
                const colors = {
                  'full-service': 'bg-blue-500',
                  'ticketed': 'bg-purple-500'
                };
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize font-medium">{type.replace('-', ' ')}</span>
                      <span className="text-gray-600">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${colors[type] || 'bg-gray-500'} h-2 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Top Merchants */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaStore /> Top Performing Merchants (Last 30 Days)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Merchant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.merchants.top.map((merchant, index) => (
                <tr key={merchant.merchantId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      #{index + 1}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{merchant.name}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {merchant.email}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(merchant.revenue)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {merchant.transactions}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {formatCurrency(merchant.commission)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Status Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaChartLine /> Payment Status Distribution
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analytics.payments.statusDistribution.map((item) => (
              <div key={item._id} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 capitalize mb-1">{item._id || 'Unknown'}</p>
                <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                <p className="text-xs text-gray-500 mt-1">{formatCurrency(item.totalAmount)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaChartLine /> Category Performance (Last 30 Days)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg per Booking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.categories.performance.map((cat) => (
                <tr key={cat._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 capitalize">{cat._id || 'Uncategorized'}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{cat.count}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(cat.revenue)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {formatCurrency(cat.revenue / cat.count)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaClock /> Recent Users
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {analytics.recentActivity.users.slice(0, 5).map((user) => (
              <div key={user._id} className="px-6 py-3 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaStar /> Recent Events
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {analytics.recentActivity.events.slice(0, 5).map((event) => (
              <div key={event._id} className="px-6 py-3 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500 capitalize">{event.eventType}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    event.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {event.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
