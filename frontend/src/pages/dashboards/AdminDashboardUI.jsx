import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import SummaryCard from "../../components/admin/SummaryCard";
import ActivityTable from "../../components/admin/ActivityTable";
import { BsCalendar2Event } from "react-icons/bs";
import { FaUsers, FaStore, FaListAlt } from "react-icons/fa";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";

const AdminDashboardUI = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  const load = useCallback(async () => {
    const headers = authHeaders(token);
    const [u, e, r] = await Promise.all([
      axios.get(`${API_BASE}/admin/users`, { headers }),
      axios.get(`${API_BASE}/admin/events`, { headers }),
      axios.get(`${API_BASE}/admin/registrations`, { headers }),
    ]);
    setUsers(u.data.users || []);
    setEvents(e.data.events || []);
    setRegistrations(r.data.registrations || []);
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const merchantsCount = users.filter((u) => u.role === "merchant").length;
  const stats = {
    users: users.length,
    merchants: merchantsCount,
    events: events.length,
    bookings: registrations.length,
  };

  const recentEvents = [...events]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6)
    .map((ev) => ({
      id: ev._id,
      name: ev.title,
      date: new Date(ev.date).toLocaleDateString(),
      merchant: ev.createdBy?.name || "—",
      status: new Date(ev.date) >= new Date() ? "Upcoming" : "Completed",
    }));

  const recentRegs = [...registrations]
    .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0))
    .slice(0, 6)
    .map((rg) => ({
      id: rg._id,
      user: rg.user?.name || "User",
      event: rg.event?.title || "Event",
      date: new Date(rg.createdAt || Date.now()).toLocaleString(),
    }));

  return (
    <AdminLayout>
      <section className="mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">Welcome back, Admin</h2>
        <p className="text-gray-600 mt-1">Here is an overview of your platform today</p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <SummaryCard title="Total Users" value={stats.users} icon={FaUsers} color="bg-emerald-600" />
        <SummaryCard title="Total Merchants" value={stats.merchants} icon={FaStore} color="bg-orange-600" />
        <SummaryCard title="Total Events" value={stats.events} icon={BsCalendar2Event} color="bg-indigo-600" />
        <SummaryCard title="Total Bookings" value={stats.bookings} icon={FaListAlt} color="bg-blue-600" />
      </div>

      <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 rounded-xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-medium">Recent Events</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                <tr>
                  <th className="text-left px-6 py-3">Event Name</th>
                  <th className="text-left px-6 py-3">Date</th>
                  <th className="text-left px-6 py-3">Merchant</th>
                  <th className="text-left px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">{ev.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{ev.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{ev.merchant}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${ev.status === "Upcoming" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                        {ev.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <ActivityTable
          rows={recentRegs.map((r) => ({
            id: r.id,
            user: r.user,
            event: r.event,
            date: r.date,
            status: "Confirmed",
          }))}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardUI;
