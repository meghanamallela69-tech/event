import { Link } from "react-router-dom";
import { BsCalendarEvent } from "react-icons/bs";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">

      <div role="navigation" className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/home" className="flex items-center gap-3 group">
          <BsCalendarEvent className="text-3xl text-blue-600" />
          <div className="flex items-baseline">
            <span className="text-5xl font-extrabold italic tracking-tight text-blue-600 drop-shadow-sm">Event</span>
            <span className="text-5xl font-extrabold italic tracking-tight text-purple-600 drop-shadow-sm">Hub</span>
          </div>
        </Link>

        {/* Menu */}
        <div className="flex items-center flex-wrap gap-x-6 gap-y-2">

          <Link className="text-gray-700 hover:text-blue-600 font-medium" to="/home">Home</Link>

          <Link className="text-gray-700 hover:text-blue-600 font-medium" to="/services">Services</Link>

          <Link className="text-gray-700 hover:text-blue-600 font-medium" to="/about">About</Link>

          <Link className="text-gray-700 hover:text-blue-600 font-medium" to="/blogs">Blogs</Link>

          <Link className="text-gray-700 hover:text-blue-600 font-medium" to="/faqs">FAQs</Link>

          <Link className="text-gray-700 hover:text-blue-600 font-medium" to="/contact">Contact</Link>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3 ml-4">
            <Link 
              className="px-5 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition" 
              to="/login"
            >
              Login
            </Link>

            <Link 
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition" 
              to="/register"
            >
              Register
            </Link>
          </div>

        </div>

      </div>

    </header>
  );
};

export default Navbar;
