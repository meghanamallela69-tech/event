import { useState, useEffect } from "react";
import axios from "axios";
import MerchantLayout from "../../components/merchant/MerchantLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { FaChartLine, FaTicketAlt, FaRupeeSign, FaCalendarAlt } from "react-icons/fa";
import { BsCalendar2Event } from "react-icons/bs";

const MerchantAnalytics = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = authHeaders(token);
    Promise.all([
      axios.get(`${API_BASE}/merchant/events`, { headers }),
      axios.get(`${API_BASE}/payments/merchant/earnings`, { headers }),
    ]).then(([evRes, earRes]) => {
      setEvents(evRes.data.events || []);
      setEarnings(earRes.data.earnings || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const now = new Date();
  const upcoming = events.filter((e) => e.date && new Date(e.date) >= now);
  const completed = events.filter((e) => e.date && new Date(e.date) < now);
  const totalBookings = events.reduce((s, e) => s + (e.bookingsCount || e.participantsCount || 0), 0);

  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n || 0);

  if (loading) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600 mt-1">Track your event performance and revenue</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg"><BsCalendar2Event className="text-indigo-600 text-xl" /></div>
            <div>
              <p className="text-gray-500 text-sm">Total Events</p>
              <p className="text-2xl font-bold">{events.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg"><FaCalendarAlt className="text-blue-600 text-xl" /></div>
            <div>
              <p className="text-gray-500 text-sm">Upcoming</p>
              <p className="text-2xl font-bold">{upcoming.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg"><FaTicketAlt className="text-green-600 text-xl" /></div>
            <div>
              <p className="text-gray-500 text-sm">Total Bookings</p>
              <p className="text-2xl font-bold">{totalBookings}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg"><FaRupeeSign className="text-purple-600 text-xl" /></div>
            <div>
              <p className="text-gray-500 text-sm">Total Earnings</p>
              <p className="text-2xl font-bold">{fmt(earnings?.totalEarnings)}</p>
            </div>
          </div>
        </div>

        {/* Event Performance Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Event Performance</h3>
          </div>
          {events.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FaChartLine className="text-4xl text-gray-300 mx-auto mb-3" />
              <p>No events yet. Create your first event to see analytics.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">Event</th>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Bookings</th>
                    <th className="px-6 py-3 text-left">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {events.map((ev) => {
                    const isUpcoming = ev.date && new Date(ev.date) >= now;
                    return (
                      <tr key={ev._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium">{ev.title}</td>
                        <td className="px-6 py-4 text-gray-500">{ev.date ? new Date(ev.date).toLocaleDateString("en-IN") : "—"}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${isUpcoming ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                            {isUpcoming ? "Upcoming" : "Completed"}
                          </span>
                        </td>
                        <td className="px-6 py-4">{ev.bookingsCount || ev.participantsCount || 0}</td>
                        <td className="px-6 py-4 text-green-600 font-medium">{fmt(ev.revenue)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Earnings Summary */}
        {earnings && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Earnings Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex justify-between items-center border-b pb-3 md:border-0 md:pb-0">
                <span className="text-gray-600">Wallet Balance</span>
                <span className="font-bold text-purple-600">{fmt(earnings.walletBalance)}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3 md:border-0 md:pb-0">
                <span className="text-gray-600">Lifetime Earnings</span>
                <span className="font-bold text-green-600">{fmt(earnings.lifetimeEarnings)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Transactions</span>
                <span className="font-bold">{earnings.totalTransactions || 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </MerchantLayout>
  );
};

export default MerchantAnalytics;

