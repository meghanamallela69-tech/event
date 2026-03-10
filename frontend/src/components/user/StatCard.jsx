import PropTypes from "prop-types";

const StatCard = ({ icon: Icon, title, value, color = "bg-blue-50", iconColor = "text-blue-600" }) => {
  return (
    <div className="rounded-xl p-5 bg-white shadow-sm border hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <div className={`${color} ${iconColor} h-12 w-12 rounded-lg flex items-center justify-center`}>
          <Icon className="text-xl" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500">{title}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string,
  iconColor: PropTypes.string,
};

export default StatCard;
