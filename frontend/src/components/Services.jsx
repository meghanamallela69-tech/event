
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../lib/http";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_BASE}/services`);
      if (response.data.success) {
        setServices(response.data.services);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="services container">
        <h2>OUR SERVICES</h2>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="services container">
        <h2>OUR SERVICES</h2>
        {services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No services available at the moment.</p>
          </div>
        ) : (
          <div className="banner grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => (
              <Link
                to={`/service/${service._id}`}
                key={service._id}
                className="item bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
              >
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                  <img
                    src={service.images[0]?.url || "/placeholder.jpg"}
                    alt={service.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <FaStar className="text-yellow-400 text-sm" />
                    <span className="text-sm font-medium">{service.rating.toFixed(1)}</span>
                  </div>
                  {service.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded-lg text-xs">
                      +{service.images.length - 1} more
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                    {service.category}
                  </span>
                  <h3 className="text-base font-semibold text-gray-800 mt-1 line-clamp-1">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-xs mt-1 line-clamp-2 flex-grow">
                    {service.description.substring(0, 80)}...
                  </p>
                  <p className="text-lg font-bold text-amber-600 mt-2">
                    {formatPrice(service.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Services;
