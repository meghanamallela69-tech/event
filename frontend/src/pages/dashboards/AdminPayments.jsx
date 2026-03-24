import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { FaRupeeSign, FaExchangeAlt } from "react-icons/fa";

const AdminPayments = () => {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = authHeaders(token);
    Promise.all([
      axios.get(`${API_BASE}/payments/admin/all`, { headers }),
      axios.get(`${API_BASE}/payments/admin/statistics`, { headers }),
    ]).then(([paymentsRes, statsRes]) => {
      setPayments(paymentsRes.data.payments || []);
      setStats(statsRes.data.statistics || statsRes.data.stats || null);
    }).catch((err) => {
      console.error("Failed to load payments:", err);
    }).finally(() => setLoading(false));
  }, [token]);

  const fmt = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount || 0);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Payments</h2>
        <p className="text-gray-600">All transactions and payouts</p>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg"><FaRupeeSign className="text-green-600 text-xl" /></div>
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">{fmt(stats.totalRevenue || stats.totalAmount)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg"><FaExchangeAlt className="text-blue-600 text-xl" /></div>
            <div>
              <p className="text-gray-500 text-sm">Total Transactions</p>
              <p className="text-2xl font-bold">{stats.totalTransactions || stats.totalPayments || payments.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg"><FaRupeeSign className="text-purple-600 text-xl" /></div>
            <div>
              <p className="text-gray-500 text-sm">Admin Commission</p>
              <p className="text-2xl font-bold">{fmt(stats.totalCommission || stats.adminCommission)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="rounded-xl bg-white border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">All Transactions</h3>
        </div>
        {payments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No payment records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Transaction ID</th>
                  <th className="px-6 py-3 text-left">User</th>
                  <th className="px-6 py-3 text-left">Merchant</th>
                  <th className="px-6 py-3 text-left">Total</th>
                  <th className="px-6 py-3 text-left">Commission</th>
                  <th className="px-6 py-3 text-left">Merchant Amt</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono text-xs">{p.transactionId}</td>
                    <td className="px-6 py-4">{p.userId?.name || "—"}</td>
                    <td className="px-6 py-4">{p.merchantId?.name || "—"}</td>
                    <td className="px-6 py-4 font-semibold">{fmt(p.totalAmount)}</td>
                    <td className="px-6 py-4 text-red-600">{fmt(p.adminCommission)}</td>
                    <td className="px-6 py-4 text-green-600">{fmt(p.merchantAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        p.paymentStatus === "success" ? "bg-green-100 text-green-700" :
                        p.paymentStatus === "refunded" ? "bg-blue-100 text-blue-700" :
                        p.paymentStatus === "failed" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;

