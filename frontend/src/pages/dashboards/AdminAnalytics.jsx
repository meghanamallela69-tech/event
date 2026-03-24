import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { FaUsers, FaStore, FaCalendarAlt, FaTicketAlt, FaRupeeSign, FaChartLine } from "react-icons/fa";

const AdminAnalytics = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/admin/reports`, { headers: authHeaders(token) })
      .then((res) => { if (res.data.success) setReports(res.data.reports); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const fmt = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;

  const Card = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="text-white text-xl" />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Analytics</h2>
        <p className="text-gray-600">Platform insights and metrics</p>
      </div>
      {reports ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="Total Users" value={reports.totalUsers} icon={FaUsers} color="bg-blue-500" />
            <Card title="Total Merchants" value={reports.totalMerchants} icon={FaStore} color="bg-green-500" />
            <Card title="Total Events" value={reports.totalEvents} icon={FaCalendarAlt} color="bg-purple-500" />
            <Card title="Total Bookings" value={reports.totalBookings} icon={FaTicketAlt} color="bg-orange-500" />
            <Card title="Total Revenue" value={fmt(reports.totalRevenue)} icon={FaRupeeSign} color="bg-emerald-500" />
            <Card title="Monthly Revenue" value={fmt(reports.monthlyRevenue)} icon={FaChartLine} color="bg-indigo-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Activity (Last 30 Days)</h3>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-gray-600">New Users</span><span className="font-semibold">{reports.recentUsers}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">New Events</span><span className="font-semibold">{reports.recentEvents}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Active Events</span><span className="font-semibold">{reports.activeEvents}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Confirmed Bookings</span><span className="font-semibold text-green-600">{reports.paidBookings}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Pending Bookings</span><span className="font-semibold text-yellow-600">{reports.pendingBookings}</span></div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Platform Ratios</h3>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-gray-600">Users per Merchant</span><span className="font-semibold">{reports.totalMerchants > 0 ? Math.round(reports.totalUsers / reports.totalMerchants) : "—"}:1</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Events per Merchant</span><span className="font-semibold">{reports.totalMerchants > 0 ? Math.round(reports.totalEvents / reports.totalMerchants) : 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Bookings per Event</span><span className="font-semibold">{reports.totalEvents > 0 ? Math.round(reports.totalBookings / reports.totalEvents) : 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Monthly Revenue Share</span><span className="font-semibold text-blue-600">{reports.totalRevenue > 0 ? `${Math.round((reports.monthlyRevenue / reports.totalRevenue) * 100)}%` : "0%"}</span></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-white border shadow-sm p-12 text-center">
          <FaChartLine className="text-5xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No analytics data available yet.</p>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAnalytics;

