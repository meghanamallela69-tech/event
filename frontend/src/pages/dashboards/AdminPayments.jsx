import AdminLayout from "../../components/admin/AdminLayout";

const AdminPayments = () => {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Payments</h2>
        <p className="text-gray-600">Transactions and payouts (placeholder)</p>
      </div>
      <div className="rounded-xl bg-white border shadow-sm p-6">
        <p>Payments overview will be implemented here.</p>
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
