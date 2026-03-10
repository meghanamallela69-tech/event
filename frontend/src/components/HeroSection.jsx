import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background image - events related */}
      <div className="absolute inset-0">
        <img src="/party.jpg" alt="events" className="w-full h-full object-cover" />
      </div>
      
      {/* Water/blue transparent overlay */}
      <div className="absolute inset-0 bg-cyan-500/30"></div>
      
      {/* Gradient overlay for depth - water theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/40 via-blue-500/30 to-teal-400/40"></div>
      
      {/* Additional water effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent"></div>
      
      {/* Accent gradient glow */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/10 via-purple-500/5 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-emerald-500/10 to-transparent"></div>
      
      <div className="relative container mx-auto px-6 py-24 md:py-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-white/50 text-sm text-cyan-900 mb-6 animate-[fadeInUp_0.4s_ease-out] backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            Professional Event Management Platform
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white drop-shadow-lg animate-[fadeInUp_0.6s_ease-out]">
            Plan and Manage Your Events{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-300 drop-shadow-lg">
              Effortlessly
            </span>
          </h1>
          
          <p className="mt-6 text-lg text-white/90 leading-relaxed drop-shadow-md animate-[fadeInUp_0.8s_ease-out]">
            A modern platform to discover premium services, book trusted vendors, and manage every detail—from invitations to payments.
          </p>
          
          <div className="mt-8 flex flex-wrap gap-4 animate-[fadeInUp_1s_ease-out]">
            <Link
              to="/services"
              className="px-6 py-3 rounded-lg bg-white text-cyan-700 font-semibold hover:bg-cyan-50 transition shadow-lg shadow-cyan-900/20"
            >
              Explore Services
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-lg border-2 border-white/80 text-white hover:bg-white/20 hover:border-white transition backdrop-blur-sm"
            >
              Book Event
            </Link>
          </div>
          
          {/* Stats */}
          <div className="mt-12 flex gap-8 animate-[fadeInUp_1.2s_ease-out]">
            <div>
              <p className="text-2xl font-bold text-white drop-shadow-md">500+</p>
              <p className="text-sm text-white/80">Events Hosted</p>
            </div>
            <div className="w-px bg-white/40"></div>
            <div>
              <p className="text-2xl font-bold text-white drop-shadow-md">200+</p>
              <p className="text-sm text-white/80">Trusted Vendors</p>
            </div>
            <div className="w-px bg-white/40"></div>
            <div>
              <p className="text-2xl font-bold text-white drop-shadow-md">10k+</p>
              <p className="text-sm text-white/80">Happy Customers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
