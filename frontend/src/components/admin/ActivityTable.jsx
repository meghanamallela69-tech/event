import PropTypes from "prop-types";

const statusBadge = (s) => {
  if (s === "Confirmed") return "bg-green-100 text-green-700";
  if (s === "Pending") return "bg-yellow-100 text-yellow-700";
  if (s === "Cancelled") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
};

const ActivityTable = ({ rows }) => {
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b font-semibold">Recent Activity</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Event</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3">{r.user}</td>
                <td className="px-4 py-3">{r.event}</td>
                <td className="px-4 py-3">{r.date}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${statusBadge(r.status)}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

ActivityTable.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      user: PropTypes.string.isRequired,
      event: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      status: PropTypes.string,
    })
  ).isRequired,
};

export default ActivityTable;
