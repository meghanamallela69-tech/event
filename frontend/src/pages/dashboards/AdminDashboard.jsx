import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  const loadAll = useCallback(async () => {
    const headers = { ...authHeaders(token), "Content-Type": "application/json" };
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
    loadAll();
  }, [loadAll]);

  const deleteUser = async (id) => {
    const headers = authHeaders(token);
    await axios.delete(`${API_BASE}/admin/users/${id}`, { headers });
    setUsers((prev) => prev.filter((x) => x._id !== id));
  };

  const deleteEvent = async (id) => {
    const headers = authHeaders(token);
    await axios.delete(`${API_BASE}/admin/events/${id}`, { headers });
    setEvents((prev) => prev.filter((x) => x._id !== id));
    setRegistrations((prev) => prev.filter((x) => x.event?._id !== id));
  };

  return (
    <div className="container py-10">
      <h2 className="text-3xl font-light tracking-widest mb-6">ADMIN DASHBOARD</h2>
      <p className="mb-4">Welcome {user?.name || "Admin"}.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="border rounded p-4">
          <h3 className="text-xl mb-3">Users</h3>
          <ul className="space-y-2">
            {users.map((u) => (
              <li key={u._id} className="flex justify-between items-center">
                <span>{u.name} ({u.email}) — {u.role}</span>
                <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => deleteUser(u._id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="border rounded p-4">
          <h3 className="text-xl mb-3">Events</h3>
          <ul className="space-y-2">
            {events.map((ev) => (
              <li key={ev._id} className="flex justify-between items-center">
                <span>{ev.title} — {new Date(ev.date).toLocaleDateString()}</span>
                <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => deleteEvent(ev._id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="border rounded p-4">
          <h3 className="text-xl mb-3">Registrations</h3>
          <ul className="space-y-2">
            {registrations.map((rg) => (
              <li key={rg._id}>
                {rg.user?.name} → {rg.event?.title} on {new Date(rg.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
