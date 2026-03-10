import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import MerchantLayout from "../../components/merchant/MerchantLayout";
import { FaCreditCard, FaDollarSign } from "react-icons/fa";
import toast from "react-hot-toast";

const MerchantPayments = () => {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ total: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  const loadPayments = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/merchant/payments`, { headers: authHeaders(token) });
      setPayments(data.payments || []);
      setStats(data.stats || { total: 0, count: 0 });
    } catch (error) {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  return (
    <MerchantLayout>
      <section className="mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">Payments</h2>
        <p className="text-gray-600 mt-1">View your payment history and earnings</p>
      </section>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }} className="mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Earnings</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.total)}</p>
            </div>
            <div className="h-12 w-12 bg-green-600 text-white flex items-center justify-center rounded-lg">
              <FaDollarSign />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.count}</p>
            </div>
            <div className="h-12 w-12 bg-blue-600 text-white flex items-center justify-center rounded-lg">
              <FaCreditCard />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <FaCreditCard className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No payments found</p>
          <p className="text-gray-400 mt-2">Payments will appear here when customers book</p>
        </div>
      ) : (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                <tr>
                  <th className="text-left px-6 py-3">Event</th>
                  <th className="text-left px-6 py-3">Customer</th>
                  <th className="text-left px-6 py-3">Amount</th>
                  <th className="text-left px-6 py-3">Date</th>
                  <th className="text-left px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{payment.event?.title || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{payment.user?.name || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{formatCurrency(payment.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(payment.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MerchantLayout>
  );
};

export default MerchantPayments;
