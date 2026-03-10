import PropTypes from "prop-types";
const SummaryCard = ({ title, value, icon: Icon, color = "bg-blue-600" }) => {
  return (
    <div className="group overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="mt-1 text-2xl font-semibold">{value !== undefined && value !== null ? value : 0}</div>
        </div>
        <div className={`h-12 w-12 ${color} text-white flex items-center justify-center rounded-lg group-hover:scale-105 transition`}>
          {Icon && <Icon className="text-xl" />}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
SummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.elementType,
  color: PropTypes.string,
};
