import { FaBolt, FaShieldAlt, FaCreditCard, FaHeadset } from "react-icons/fa";

const About = () => {
  return (
    <>
      {/* Hero */}
      <section className="bg-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-200 px-8 py-12">
            <h1 className="text-3xl md:text-5xl font-semibold text-gray-900">About EventHub</h1>
            <p className="mt-3 text-gray-600 max-w-2xl">
              EventHub is a modern platform that helps you plan, book, and manage
              memorable events with trusted vendors, streamlined bookings, and secure payments.
            </p>
          </div>
        </div>
      </section>

      {/* Two Column About */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col gap-8">
          {/* Full Width Image */}
          <div className="rounded-2xl overflow-hidden shadow-sm ring-1 ring-gray-200 w-full" style={{ height: '520px' }}>
            <img src="/restaurant.jpg" alt="About EventHub" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">Plan. Book. Celebrate.</h2>
            <p className="text-gray-700 leading-7">
              From weddings and corporate events to birthdays and festivals, EventHub brings
              everything together. Discover curated services, compare vendors, manage bookings,
              and keep every detail on track—all in one place.
            </p>
            <p className="text-gray-700 leading-7">
              Our mission is to simplify event management with transparent pricing, reliable
              partners, and delightful experiences for every occasion.
            </p>
          </div>
        </div>
      </section>

      {/* Features - 4 cards side by side */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-2xl md:text-3xl font-semibold mb-8">Why Choose EventHub</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {[
            { title: "Easy Event Planning", icon: FaBolt, color: "bg-emerald-50 text-emerald-600", desc: "Create and manage events with intuitive tools." },
            { title: "Trusted Vendors", icon: FaShieldAlt, color: "bg-indigo-50 text-indigo-600", desc: "Vetted partners with great reviews." },
            { title: "Secure Payments", icon: FaCreditCard, color: "bg-rose-50 text-rose-600", desc: "Protected transactions and invoices." },
            { title: "24/7 Support", icon: FaHeadset, color: "bg-amber-50 text-amber-600", desc: "We're here whenever you need us." },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 hover:shadow-md hover:-translate-y-0.5 transition group">
              <div className={`h-12 w-12 ${f.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition`}>
                <f.icon className="text-xl" />
              </div>
              <div className="font-semibold">{f.title}</div>
              <p className="text-sm text-gray-600 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Statistics - 3 cards side by side */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-2xl md:text-3xl font-semibold mb-8">EventHub in Numbers</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {[
            { label: "Events Managed", value: "500+" },
            { label: "Vendors", value: "200+" },
            { label: "Customers", value: "1000+" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-8 text-center hover:shadow-md transition">
              <div className="text-4xl font-bold text-blue-600">{s.value}</div>
              <div className="text-sm text-gray-600 mt-2 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default About;
