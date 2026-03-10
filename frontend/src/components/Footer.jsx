import { SITE_NAME } from "../config/site";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <div role="contentinfo" className="bg-gray-900 text-gray-300 mt-20">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-3 gap-10">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/home" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/services" className="hover:text-white transition">Services</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About</Link></li>
              <li><Link to="/blogs" className="hover:text-white transition">Blogs</Link></li>
              <li><Link to="/faqs" className="hover:text-white transition">FAQs</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Event Services</h3>
            <ul className="space-y-2 text-sm">
              <li>Wedding Planning</li>
              <li>Corporate Events</li>
              <li>Birthday Parties</li>
              <li>Photography</li>
              <li>Catering</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>Email: support@eventhub.local</li>
              <li>Phone: +1 (555) 010-0200</li>
            </ul>
            <div className="flex gap-3 pt-2">
              <a href="#" aria-label="Facebook" className="h-9 w-9 flex items-center justify-center bg-gray-800 rounded-md hover:bg-gray-700">
                <FaFacebookF />
              </a>
              <a href="#" aria-label="Twitter" className="h-9 w-9 flex items-center justify-center bg-gray-800 rounded-md hover:bg-gray-700">
                <FaTwitter />
              </a>
              <a href="#" aria-label="Instagram" className="h-9 w-9 flex items-center justify-center bg-gray-800 rounded-md hover:bg-gray-700">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 text-center text-gray-400 pt-6 mt-8 text-sm">
          © 2026 {SITE_NAME}. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Footer;
