import AdminLayout from "../../components/admin/AdminLayout";

const AdminAnalytics = () => {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Analytics</h2>
        <p className="text-gray-600">Insights and metrics (coming soon)</p>
      </div>
      <div className="rounded-xl bg-white border shadow-sm p-6">
        <p>This section will include advanced charts and KPIs.</p>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
