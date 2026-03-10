import PropTypes from "prop-types";

const statusClass = (s) => {
  if (s === "Upcoming") return "bg-green-100 text-green-700";
  if (s === "Full") return "bg-yellow-100 text-yellow-700";
  if (s === "Cancelled") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
};

const EventCard = ({ image, title, date, location, status, actionText = "View", onAction }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition">
      <div className="h-36 w-full overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">{title}</h4>
          <span className={`text-xs px-2 py-1 rounded ${statusClass(status)}`}>{status}</span>
        </div>
        <div className="text-sm text-gray-600">{date}</div>
        <div className="text-sm text-gray-600">{location}</div>
        <button
          className="mt-2 w-full px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition"
          onClick={onAction}
        >
          {actionText}
        </button>
      </div>
    </div>
  );
};

EventCard.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  status: PropTypes.string,
  actionText: PropTypes.string,
  onAction: PropTypes.func,
};

export default EventCard;
