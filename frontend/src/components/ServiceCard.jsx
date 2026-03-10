import { Link } from "react-router-dom";
import { FaStar, FaArrowRight } from "react-icons/fa";

const ServiceCard = ({ service }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getCategoryColor = (category) => {
    const colors = {
      wedding: "bg-pink-100 text-pink-700",
      corporate: "bg-blue-100 text-blue-700",
      birthday: "bg-amber-100 text-amber-700",
      catering: "bg-rose-100 text-rose-700",
      photography: "bg-purple-100 text-purple-700",
      decoration: "bg-emerald-100 text-emerald-700",
      concert: "bg-indigo-100 text-indigo-700",
      camping: "bg-green-100 text-green-700",
      gaming: "bg-orange-100 text-orange-700",
      anniversary: "bg-red-100 text-red-700",
      party: "bg-cyan-100 text-cyan-700",
      other: "bg-gray-100 text-gray-700",
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={service.images[0]?.url || "/placeholder.jpg"}
          alt={service.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        {/* Category Badge */}
        <span
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(
            service.category
          )}`}
        >
          {service.category}
        </span>
        {/* Rating Badge */}
        {service.rating > 0 && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
            <FaStar className="text-yellow-400 text-sm" />
            <span className="text-sm font-semibold text-gray-700">
              {service.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {service.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
          {service.description}
        </p>

        {/* Price */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-amber-600">
            {formatPrice(service.price)}
          </span>
          <span className="text-gray-500 text-sm"> / service</span>
        </div>

        {/* View Details Button */}
        <Link
          to={`/service/${service._id}`}
          className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors duration-300"
        >
          View Details
          <FaArrowRight className="text-sm" />
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;
