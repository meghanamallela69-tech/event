import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

const Contact = () => {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center md:text-left">Get in Touch</h2>
          <form className="space-y-4">
            <input className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Name" />
            <input className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" type="email" placeholder="Email" />
            <input className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Subject" />
            <textarea className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" rows="5" placeholder="Message" />
            <button className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition">Submit</button>
          </form>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FaEnvelope />
              </div>
              <div>
                <div className="font-semibold">Email</div>
                <div className="text-sm text-gray-600">support@eventhub.local</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FaPhoneAlt />
              </div>
              <div>
                <div className="font-semibold">Phone</div>
                <div className="text-sm text-gray-600">+1 (555) 010-0200</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <FaMapMarkerAlt />
              </div>
              <div>
                <div className="font-semibold">Office</div>
                <div className="text-sm text-gray-600">123 Market Street, San Francisco, CA</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="h-10 w-10 flex items-center justify-center bg-gray-900 text-white rounded-lg hover:bg-black" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="#" className="h-10 w-10 flex items-center justify-center bg-gray-900 text-white rounded-lg hover:bg-black" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="#" className="h-10 w-10 flex items-center justify-center bg-gray-900 text-white rounded-lg hover:bg-black" aria-label="Instagram">
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
