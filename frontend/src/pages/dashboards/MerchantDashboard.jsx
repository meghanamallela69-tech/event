import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import MerchantLayout from "../../components/merchant/MerchantLayout";
import SummaryCard from "../../components/admin/SummaryCard";
import { BsCalendar2Event } from "react-icons/bs";
import { FaListAlt, FaDollarSign } from "react-icons/fa";
import { LuCalendarClock } from "react-icons/lu";

const MerchantDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const headersJson = (t) => ({ ...authHeaders(t), "Content-Type": "application/json" });

  const loadEvents = useCallback(async () => {
    const { data } = await axios.get(`${API_BASE}/merchant/events`, { headers: authHeaders(token) });
    setEvents(data.events || []);
  }, [token]);
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const createEvent = async (e) => {
    e.preventDefault();
    // Redirect to the dedicated create event page
    navigate("/dashboard/merchant/create");
  };

  const updateEvent = async (id, patch) => {
    const { data } = await axios.put(`${API_BASE}/merchant/events/${id}`, patch, { headers: headersJson(token) });
    setEvents((prev) => prev.map((ev) => (ev._id === id ? data.event : ev)));
  };

  const viewParticipants = async (id) => {
    const { data } = await axios.get(`${API_BASE}/merchant/events/${id}/participants`, { headers: authHeaders(token) });
    setParticipants(data.participants || []);
  };

  const totalEvents = events.length;
  const totalBookings = events.reduce((s, e) => s + (e.bookingsCount || e.participantsCount || 0), 0);
  const totalRevenue = events.reduce((s, e) => s + (e.revenue || 0), 0);
  const upcoming = events.filter((e) => e.date && new Date(e.date) >= new Date()).length;

  const removeEvent = async (id) => {
    await axios.delete(`${API_BASE}/merchant/events/${id}`, { headers: authHeaders(token) });
    setEvents((prev) => prev.filter((e) => e._id !== id));
  };

  return (
    <MerchantLayout>
      <section className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Welcome back, {user?.name || "Merchant"}</h2>
            <p className="text-gray-600 mt-1">Here is your business overview</p>
          </div>
          <button
            onClick={createEvent}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition"
          >
            Create Event
          </button>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <SummaryCard title="Total Events" value={totalEvents} icon={BsCalendar2Event} color="bg-indigo-600" />
        <SummaryCard title="Total Bookings" value={totalBookings} icon={FaListAlt} color="bg-emerald-600" />
        <SummaryCard title="Total Revenue" value={`$${totalRevenue}`} icon={FaDollarSign} color="bg-amber-600" />
        <SummaryCard title="Upcoming Events" value={upcoming} icon={LuCalendarClock} color="bg-blue-600" />
      </div>

      <div className="mt-8 rounded-xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-medium">My Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
              <tr>
                <th className="text-left px-6 py-3">Event Name</th>
                <th className="text-left px-6 py-3">Date</th>
                <th className="text-left px-6 py-3">Location</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((ev) => {
                const status = ev.date && new Date(ev.date) >= new Date() ? "Upcoming" : "Completed";
                return (
                  <tr key={ev._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">{ev.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{ev.date ? new Date(ev.date).toLocaleDateString() : "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{ev.location || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${status === "Upcoming" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                          onClick={() => window.location.href = `/dashboard/merchant/events/edit/${ev._id}`}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                          onClick={() => removeEvent(ev._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </MerchantLayout>
  );
};

export default MerchantDashboard;
