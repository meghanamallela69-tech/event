import { useEffect, useState } from "react";

const Testimonials = () => {
  const items = [
    { name: "Aisha", quote: "Flawless planning and stunning decor!", img: "/wedding.jpg" },
    { name: "Marcus", quote: "Vendors were top-notch. Highly recommend.", img: "/party.jpg" },
    { name: "Li Wei", quote: "Smooth experience from start to finish.", img: "/restaurant.jpg" },
  ];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const count = items.length;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 4000);
    return () => clearInterval(id);
  }, [items.length]);
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
              {items.map((t) => (
                <div key={t.name} className="min-w-full p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={t.img} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                    <div className="font-semibold">{t.name}</div>
                  </div>
                  <p className="text-gray-700">“{t.quote}”</p>
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
