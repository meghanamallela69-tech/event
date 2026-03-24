import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import toast from "react-hot-toast";
import { 
  FaUsers, 
  FaStore, 
  FaCalendarAlt, 
  FaTicketAlt, 
  FaRupeeSign, 
  FaChartLine,
  FaUserPlus,
  FaCalendarPlus
} from "react-icons/fa";

const AdminReports = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/reports`, {
        headers: authHeaders(token)
      });

      if (response.data.success) {
        setReports(response.data.reports);
      } else {
        toast.error("Failed to load reports");
      }
    } catch (error) {
      console.error("Failed to load reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return `₹${(amount || 0).toLocaleString()}`;
  };

  const StatCard = ({ title, value, icon: Icon, color, bgColor, description }) => (
    <div className={`${bgColor} rounded-xl p-6 shadow-sm border`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="text-white text-xl" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Reports & Analytics</h2>
        <p className="text-gray-600">Platform statistics and performance metrics</p>
      </div>

      {reports ? (
        <div className="space-y-6">
          {/* Main Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={reports.totalUsers}
              icon={FaUsers}
              color="bg-blue-500"
              bgColor="bg-white"
              description="Registered users"
            />
            <StatCard
              title="Total Merchants"
              value={reports.totalMerchants}
              icon={FaStore}
              color="bg-green-500"
              bgColor="bg-white"
              description="Active merchants"
            />
            <StatCard
              title="Total Events"
              value={reports.totalEvents}
              icon={FaCalendarAlt}
              color="bg-purple-500"
              bgColor="bg-white"
              description="All events created"
            />
            <StatCard
              title="Total Bookings"
              value={reports.totalBookings}
              icon={FaTicketAlt}
              color="bg-orange-500"
              bgColor="bg-white"
              description="All bookings made"
            />
          </div>

          {/* Revenue Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Revenue"
              value={formatAmount(reports.totalRevenue)}
              icon={FaRupeeSign}
              color="bg-emerald-500"
              bgColor="bg-white"
              description="All-time revenue"
            />
            <StatCard
              title="Monthly Revenue"
              value={formatAmount(reports.monthlyRevenue)}
              icon={FaChartLine}
              color="bg-indigo-500"
              bgColor="bg-white"
              description="Last 30 days"
            />
            <StatCard
              title="Paid Bookings"
              value={reports.paidBookings}
              icon={FaTicketAlt}
              color="bg-teal-500"
              bgColor="bg-white"
              description="Completed payments"
            />
          </div>

          {/* Activity Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Active Events"
              value={reports.activeEvents}
              icon={FaCalendarAlt}
              color="bg-green-500"
              bgColor="bg-white"
              description="Currently active"
            />
            <StatCard
              title="Pending Bookings"
              value={reports.pendingBookings}
              icon={FaTicketAlt}
              color="bg-yellow-500"
              bgColor="bg-white"
              description="Awaiting payment"
            />
            <StatCard
              title="New Users (30d)"
              value={reports.recentUsers}
              icon={FaUserPlus}
              color="bg-blue-500"
              bgColor="bg-white"
              description="Last 30 days"
            />
            <StatCard
              title="New Events (30d)"
              value={reports.recentEvents}
              icon={FaCalendarPlus}
              color="bg-purple-500"
              bgColor="bg-white"
              description="Last 30 days"
            />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Platform Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">User to Merchant Ratio</span>
                  <span className="font-semibold">
                    {reports.totalMerchants > 0 
                      ? `${Math.round(reports.totalUsers / reports.totalMerchants)}:1`
                      : "N/A"
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Events per Merchant</span>
                  <span className="font-semibold">
                    {reports.totalMerchants > 0 
                      ? Math.round(reports.totalEvents / reports.totalMerchants)
                      : 0
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bookings per Event</span>
                  <span className="font-semibold">
                    {reports.totalEvents > 0 
                      ? Math.round(reports.totalBookings / reports.totalEvents)
                      : 0
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Success Rate</span>
                  <span className="font-semibold text-green-600">
                    {reports.totalBookings > 0 
                      ? `${Math.round((reports.paidBookings / reports.totalBookings) * 100)}%`
                      : "0%"
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Revenue Insights</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Booking Value</span>
                  <span className="font-semibold">
                    {formatAmount(reports.paidBookings > 0 
                      ? reports.totalRevenue / reports.paidBookings 
                      : 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Revenue per User</span>
                  <span className="font-semibold">
                    {formatAmount(reports.totalUsers > 0 
                      ? reports.totalRevenue / reports.totalUsers 
                      : 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Revenue per Merchant</span>
                  <span className="font-semibold">
                    {formatAmount(reports.totalMerchants > 0 
                      ? reports.totalRevenue / reports.totalMerchants 
                      : 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monthly Growth</span>
                  <span className="font-semibold text-blue-600">
                    {reports.totalRevenue > 0 
                      ? `${Math.round((reports.monthlyRevenue / reports.totalRevenue) * 100)}%`
                      : "0%"
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <FaChartLine className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-500">Reports will appear here once there is platform activity.</p>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminReports;