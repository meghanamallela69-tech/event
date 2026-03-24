import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../../lib/http";

const UpcomingEvents = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/events`)
      .then((res) => {
        const events = res.data.events || [];
        const now = new Date();
        const upcoming = events
          .filter((e) => e.date && new Date(e.date) >= now)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3);
        setItems(upcoming);
      })
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="upcoming-events">
      <div className="container">
        <h2>UPCOMING EVENTS</h2>
        <div className="banner">
          {items.map((e) => (
            <div key={e._id} className="item">
              <img
                src={e.image || e.images?.[0]?.url || "/party.jpg"}
                alt={e.title}
                onError={(ev) => { ev.target.src = "/party.jpg"; }}
              />
              <div className="content">
                <h3>{e.title}</h3>
                <p>{e.date ? new Date(e.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : ""}</p>
                <p>{e.location || ""}</p>
                <Link to="/dashboard/user/browse">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;

