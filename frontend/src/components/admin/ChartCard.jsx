import PropTypes from "prop-types";

const ChartCard = ({ title, data, labels }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">{title}</h3>
        <span className="text-xs text-gray-500">Last 6 months</span>
      </div>
      <div className="h-40 flex items-end gap-3">
        {data.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div
              className="w-8 rounded-t-md bg-gradient-to-t from-blue-600 to-indigo-400 transition hover:scale-105"
              style={{ height: `${(v / max) * 100}%` }}
              title={`${labels[i]}: ${v}`}
            />
            <span className="text-[10px] text-gray-600">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ChartCard;
