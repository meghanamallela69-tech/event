import AdminLayout from "../../components/admin/AdminLayout";

const AdminSettings = () => {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-gray-600">Manage admin preferences</p>
      </div>
      <div className="rounded-xl bg-white border shadow-sm p-6">
        <p>General settings will appear here.</p>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
