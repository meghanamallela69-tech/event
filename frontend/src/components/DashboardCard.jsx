import PropTypes from 'prop-types';

const DashboardCard = ({ title, value, icon, color }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 p-6 flex items-center space-x-6 border border-gray-100`}>
      <div className={`rounded-full p-4 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.element.isRequired,
  color: PropTypes.string.isRequired,
};

export default DashboardCard;
