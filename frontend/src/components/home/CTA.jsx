import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center gap-3">
        <h3 className="text-2xl md:text-3xl font-semibold">Start Planning Your Event Today</h3>
        <p className="text-white max-w-2xl">
          Join EventHub and connect with top vendors, manage bookings, and make your event unforgettable.
        </p>
        <Link to="/register" className="mt-2 px-6 py-3 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100 transition shadow">
          Register Now
        </Link>
      </div>
    </section>
  );
}
