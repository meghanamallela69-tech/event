import { FaShieldAlt, FaBolt, FaCreditCard, FaHeadset } from "react-icons/fa";

const WhyChooseUs = () => {
  const items = [
    { title: "Trusted Vendors", desc: "Vetted partners with great reviews.", icon: FaShieldAlt },
    { title: "Easy Booking", desc: "Simple, fast, and transparent process.", icon: FaBolt },
    { title: "Secure Payments", desc: "Protected transactions and invoices.", icon: FaCreditCard },
    { title: "24/7 Support", desc: "We're here whenever you need us.", icon: FaHeadset },
  ];
  return (
    <section className="why-choose-us">
      <div className="container">
        <h2>WHY CHOOSE US</h2>
        <div className="banner">
          {items.map((i) => (
            <div key={i.title} className="item">
              <div className="icon">
                <i.icon />
              </div>
              <h3>{i.title}</h3>
              <p>{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
