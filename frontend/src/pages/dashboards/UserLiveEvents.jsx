import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import UserLayout from "../../components/user/UserLayout";
import EventBookingModal from "../../components/EventBookingModal";
import PaymentModal from "../../components/PaymentModal";
import { API_BASE } from "../../lib/http";
import GridLayout from "../../components/common/GridLayout";

const UserLiveEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingEvent, setBookingEvent] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentQty, setPaymentQty] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/events/live`);
      console.log("User Live Events response:", data);
      setEvents(data?.events || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "Date TBD");

  return (
    <UserLayout>
      <section className="mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">Live Events</h2>
        <p className="text-gray-600 mt-1">Events currently marked as live</p>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border shadow-sm">
          <p className="text-gray-500 text-lg">No Live Events Available</p>
          <p className="text-gray-400 mt-2">Check back later for new live events</p>
        </div>
      ) : (
        <div className="w-full p-6">
        <GridLayout>
          {events.map((ev) => {
            const img =
              ev?.image && ev.image.trim() !== ""
                ? ev.image
                : ev?.images && ev.images.length > 0
                ? ev.images[0].url
                : "/party.jpg";
            const hasAvailable = typeof ev?.availableTickets === "number";
            const available = hasAvailable
              ? Number(ev.availableTickets)
              : (Array.isArray(ev?.ticketTypes) && ev.ticketTypes.length > 0
                  ? ev.ticketTypes.reduce(
                      (sum, t) =>
                        sum + Math.max(0, (Number(t.quantityTotal) || 0) - (Number(t.quantitySold) || 0)),
                      0
                    )
                  : (typeof ev?.tickets === "number" ? Number(ev.tickets) : Infinity));
            const soldOut = hasAvailable ? available === 0 : available <= 0;
            const completed = (ev.status || "").toLowerCase() === "completed" || (ev.status || "").toLowerCase() === "inactive";
            const price = ev.price && Number(ev.price) > 0 ? `₹${Number(ev.price).toLocaleString("en-IN")}` : "Free";
            return (
              <div key={ev._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <img src={img} alt={ev.title} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">{ev.title}</h4>
                    {ev.status ? (
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          (ev.status || "").toLowerCase() === "live" || (ev.status || "").toLowerCase() === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {ev.status}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{ev.category || "Event"}</div>
                  <div className="text-sm text-gray-600">{ev.location || "Location TBD"}</div>
                  <div className="text-sm text-gray-600">{fmtDate(ev.date)}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="font-semibold text-gray-900">{price}</div>
                    <div className="text-sm text-gray-500">{(ev.features?.length || 0)} features</div>
                  </div>
                  <button
                    onClick={
                      soldOut || completed
                        ? () => {}
                        : () => { setBookingEvent(ev); setBookingOpen(true); }
                    }
                    className={`mt-3 w-full px-4 py-2 rounded-lg ${
                      soldOut || completed ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    } text-white transition text-sm`}
                  >
                    {soldOut ? "Sold Out" : completed ? "Completed" : "Book Now"}
                  </button>
                </div>
              </div>
            );
          })}
        </GridLayout>
        {bookingOpen && bookingEvent && (
          <EventBookingModal
            event={bookingEvent}
            isOpen={bookingOpen}
            onClose={() => { setBookingOpen(false); setBookingEvent(null); }}
            onConfirm={(qty) => {
              setPaymentQty(Math.max(1, Number(qty || 1)));
              setPaymentOpen(true);
            }}
          />
        )}
        {paymentOpen && bookingEvent && (
          <PaymentModal
            isOpen={paymentOpen}
            event={bookingEvent}
            quantity={paymentQty}
            onClose={() => { setPaymentOpen(false); }}
            onSuccess={async () => {
              setPaymentOpen(false);
              setBookingOpen(false);
              setBookingEvent(null);
              await load();
            }}
          />
        )}
        </div>
      )}
    </UserLayout>
  );
};

export default UserLiveEvents;
