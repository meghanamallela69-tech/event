import { FaGlassCheers, FaBirthdayCake, FaBuilding, FaMusic, FaCamera, FaUtensils } from "react-icons/fa";

const FeaturedServices = () => {
  const items = [
    { title: "Wedding Planning", desc: "End-to-end planning and coordination.", icon: FaGlassCheers, color: "bg-pink-50 text-pink-600" },
    { title: "Birthday Parties", desc: "Themes, decor, and entertainment.", icon: FaBirthdayCake, color: "bg-amber-50 text-amber-600" },
    { title: "Corporate Events", desc: "Conferences, retreats, launches.", icon: FaBuilding, color: "bg-indigo-50 text-indigo-600" },
    { title: "Concert Management", desc: "Stages, audio, logistics.", icon: FaMusic, color: "bg-emerald-50 text-emerald-600" },
    { title: "Photography", desc: "Professional photo and video.", icon: FaCamera, color: "bg-blue-50 text-blue-600" },
    { title: "Catering", desc: "Custom menus and service.", icon: FaUtensils, color: "bg-rose-50 text-rose-600" },
  ];
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-semibold mb-8">Our Services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 items-stretch">
          {items.map((i) => (
            <div
              key={i.title}
              className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition group h-full flex flex-col items-center text-center"
            >
              <div className={`h-10 w-10 ${i.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition`}>
                <i.icon />
              </div>
              <h4 className="font-medium text-sm">{i.title}</h4>
              <p className="text-xs text-gray-600 mt-0.5 hidden md:block">{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;
