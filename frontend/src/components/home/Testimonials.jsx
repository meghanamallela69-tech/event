import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../lib/http";

const Testimonials = () => {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Fetch latest reviews across all events
    axios.get(`${API_BASE}/reviews/latest`).then((res) => {
      const reviews = res.data.reviews || [];
      if (reviews.length > 0) setItems(reviews);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 4000);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-semibold mb-8">What Our Clients Say</h2>
        <div className="relative max-w-2xl mx-auto">
          <div className="overflow-hidden rounded-xl border shadow-sm bg-white">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {items.map((t, i) => (
                <div key={i} className="min-w-full p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                      {(t.user?.name || t.userName || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold">{t.user?.name || t.userName || "User"}</div>
                      {t.event?.title && <div className="text-xs text-gray-500">{t.event.title}</div>}
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className={s <= (t.rating || 5) ? "text-amber-400" : "text-gray-300"}>★</span>
                    ))}
                  </div>
                  <p className="text-gray-700">"{t.comment || t.text || t.review}"</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-3">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2 w-2 rounded-full ${i === index ? "bg-gray-900" : "bg-gray-300"}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

