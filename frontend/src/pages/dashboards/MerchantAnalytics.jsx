import { useState, useEffect } from "react";
import MerchantLayout from "../../components/merchant/MerchantLayout";
import { FaCalendarAlt, FaRupeeSign, FaTicketAlt, FaUsers, FaChartLine, FaCheckCircle, FaClock, FaArrowUp, FaArrowDown } from "react-icons/fa";
import axios from "axios";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { toast } from "react-hot-toast";

const MerchantAnalytics = () => {
  const { token } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState("");
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMerchantEvents();
  }, []);

  // Load merchant events
  const loadMerchantEvents = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/merchant/events`,
        { headers: authHeaders(token) }
      );
      if (response.data.success) {
        setEvents(response.data.events || []);
      }
    } catch (error) {
      console.error("Failed to load events:", error);
    }
  };

  // Load analytics when event is selected
  useEffect(() => {
    if (selectedEvent) {
      loadAnalytics(selectedEvent);
    } else {
      setAnalytics(null);
    }
  }, [selectedEvent]);

  const loadAnalytics = async (eventId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE}/analytics/event/${eventId}`,
        { headers: authHeaders(token) }
      );
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Simple bar chart component for trends
  const SimpleBarChart = ({ data, dataKey, color = "bg-blue-500" }) => {
    if (!data || data.length === 0) return null;
    
    const maxValue = Math.max(...data.map(d => d[dataKey]));
    const chartHeight = 150;
    
    return (
      <div className="h-40 flex items-end gap-1 overflow-x-auto">
        {data.map((item, index) => {
          const height = maxValue > 0 ? (item[dataKey] / maxValue) * chartHeight : 0;
          return (
            <div key={index} className="flex-1 min-w-[20px] flex flex-col items-center gap-1">
              <div 
                className={`w-full ${color} rounded-t transition-all duration-300`}
                style={{ height: `${Math.max(height, 4)}px` }}
                title={`${item.date}: ${item[dataKey]}`}
              />
              <span className="text-xs text-gray-500 transform -rotate-45 origin-top-left whitespace-nowrap">
                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Line chart visualization using SVG
  const SimpleLineChart = ({ data, dataKey, color = "#3B82F6" }) => {
    if (!data || data.length === 0) return null;
    
    const maxValue = Math.max(...data.map(d => d[dataKey]));
    const minValue = 0;
    const width = 100;
    const height = 50;
    
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((item[dataKey] - minValue) / (maxValue - minValue)) * height;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <div className="w-full h-40 overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={points}
            vectorEffect="non-scaling-stroke"
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((item[dataKey] - minValue) / (maxValue - minValue)) * height;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={color}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{data[0]?.date}</span>
          <span>{data[data.length - 1]?.date}</span>
        </div>
      </div>
    );
  };

  return (
    <MerchantLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Event Analytics</h2>
        <p className="text-gray-600 mt-1">Track your event performance and bookings</p>
      </div>

      {/* Event Selector */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Event to Analyze
        </label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        >
          <option value="">-- Choose an event --</option>
          {events.map(event => (
            <option key={event._id} value={event._id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading analytics...</p>
        </div>
      )}

      {!loading && analytics && (
        <>
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Bookings */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaCalendarAlt className="text-blue-600 text-2xl" />
                </div>
                {analytics.bookingTrends && analytics.bookingTrends.length > 1 && (
                  <div className={`flex items-center gap-1 text-sm ${
                    analytics.bookingTrends[analytics.bookingTrends.length - 1].bookings >= 
                    analytics.bookingTrends[analytics.bookingTrends.length - 2].bookings
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                    {analytics.bookingTrends[analytics.bookingTrends.length - 1].bookings >= 
                     analytics.bookingTrends[analytics.bookingTrends.length - 2].bookings ? (
                      <FaArrowUp />
                    ) : (
                      <FaArrowDown />
                    )}
                  </div>
                )}
              </div>
              <h3 className="text-gray-500 text-sm mb-1">Total Bookings</h3>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalBookings}</p>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FaRupeeSign className="text-green-600 text-2xl" />
                </div>
                {analytics.revenueTrends && analytics.revenueTrends.length > 1 && (
                  <div className={`flex items-center gap-1 text-sm ${
                    analytics.revenueTrends[analytics.revenueTrends.length - 1].revenue >= 
                    analytics.revenueTrends[analytics.revenueTrends.length - 2].revenue
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                    {analytics.revenueTrends[analytics.revenueTrends.length - 1].revenue >= 
                     analytics.revenueTrends[analytics.revenueTrends.length - 2].revenue ? (
                      <FaArrowUp />
                    ) : (
                      <FaArrowDown />
                    )}
                  </div>
                )}
              </div>
              <h3 className="text-gray-500 text-sm mb-1">Total Revenue</h3>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
            </div>

            {/* Tickets Sold */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FaTicketAlt className="text-purple-600 text-2xl" />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm mb-1">Tickets Sold</h3>
              <p className="text-3xl font-bold text-gray-900">{analytics.ticketsSold}</p>
            </div>

            {/* Available Tickets */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FaClock className="text-orange-600 text-2xl" />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm mb-1">Available Tickets</h3>
              <p className="text-3xl font-bold text-gray-900">{analytics.availableTickets}</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bookings Over Time */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FaChartLine className="text-blue-600" />
                Bookings Trend
              </h3>
              {analytics.bookingTrends && analytics.bookingTrends.length > 0 ? (
                <SimpleBarChart 
                  data={analytics.bookingTrends} 
                  dataKey="bookings" 
                  color="bg-blue-500"
                />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FaChartLine className="text-4xl mx-auto mb-2 opacity-50" />
                  <p>No booking data available</p>
                </div>
              )}
            </div>

            {/* Revenue Over Time */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FaRupeeSign className="text-green-600" />
                Revenue Trend
              </h3>
              {analytics.revenueTrends && analytics.revenueTrends.length > 0 ? (
                <SimpleLineChart 
                  data={analytics.revenueTrends} 
                  dataKey="revenue" 
                  color="#10B981"
                />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FaChartLine className="text-4xl mx-auto mb-2 opacity-50" />
                  <p>No revenue data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Breakdown & Attendee Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Ticket Type Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FaTicketAlt className="text-purple-600" />
                Ticket Type Breakdown
              </h3>
              {Object.keys(analytics.ticketTypeStats).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(analytics.ticketTypeStats).map(([typeName, stats]) => (
                    <div key={typeName} className="border-b pb-3 last:border-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{typeName}</span>
                        <span className="text-sm text-gray-500">₹{stats.price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sold: <strong className="text-green-600">{stats.sold}</strong></span>
                        <span className="text-gray-600">Available: <strong className="text-orange-600">{stats.available}</strong></span>
                        <span className="text-gray-600">Total: <strong>{stats.totalCapacity}</strong></span>
                      </div>
                      <div className="mt-2 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${stats.totalCapacity > 0 ? (stats.sold / stats.totalCapacity) * 100 : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FaTicketAlt className="text-4xl mx-auto mb-2 opacity-50" />
                  <p>No ticket type data available</p>
                </div>
              )}
            </div>

            {/* Attendee Stats */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FaUsers className="text-orange-600" />
                Attendee Statistics
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaUsers className="text-blue-600 text-2xl" />
                    <div>
                      <p className="text-sm text-gray-600">Total Attendees</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.totalAttendees}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-600 text-2xl" />
                    <div>
                      <p className="text-sm text-gray-600">Checked In</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.checkedInCount}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Booking Status</h4>
                  <div className="space-y-2">
                    {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">{status}</span>
                        <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-lg mb-4">Recent Bookings</h3>
            {analytics.recentBookings && analytics.recentBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tickets</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentBookings.map((booking) => (
                      <tr key={booking.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          <div>
                            <p className="font-medium">{booking.userName}</p>
                            <p className="text-xs text-gray-500">{booking.userEmail}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{booking.guestCount}</td>
                        <td className="py-3 px-4 text-sm font-medium">{formatCurrency(booking.totalPrice)}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FaCalendarAlt className="text-4xl mx-auto mb-2 opacity-50" />
                <p>No recent bookings</p>
              </div>
            )}
          </div>
        </>
      )}

      {!loading && !analytics && !selectedEvent && (
        <div className="text-center py-12">
          <FaChartLine className="text-6xl mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Select an Event</h3>
          <p className="text-gray-500">Choose an event from the dropdown above to view its analytics</p>
        </div>
      )}
    </MerchantLayout>
  );
};

export default MerchantAnalytics;
