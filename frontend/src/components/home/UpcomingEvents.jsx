import { Link } from "react-router-dom";

const UpcomingEvents = () => {
  const items = [
    { title: "Tech Expo", date: "Apr 12, 2026", img: "/gamenight.jpg", location: "Downtown Hub" },
    { title: "Food Carnival", date: "Apr 25, 2026", img: "/birthday.jpg", location: "City Square" },
    { title: "Design Summit", date: "May 10, 2026", img: "/restaurant.jpg", location: "Grand Hall" },
  ];
  return (
    <section className="upcoming-events">
      <div className="container">
        <h2>UPCOMING EVENTS</h2>
        <div className="banner">
          {items.map((e) => (
            <div key={e.title} className="item">
              <img src={e.img} alt={e.title} />
              <div className="content">
                <h3>{e.title}</h3>
                <p>{e.date}</p>
                <p>{e.location}</p>
                <Link to="/services">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
