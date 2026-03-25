import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import AdminLayout from "../../components/admin/AdminLayout";
import { FaCreditCard, FaDollarSign, FaPercentage, FaStore, FaExchangeAlt, FaCheck, FaTimes, FaClock } from "react-icons/fa";
import useAuth from "../../context/useAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const AdminPayments = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("transactions");
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [commissionData, setCommissionData] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all payment data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch transactions
      const txResponse = await axios.get(`${API_BASE_URL}/api/v1/admin/payments/transactions`, { headers });
      if (txResponse.data.success) {
        setTransactions(txResponse.data.transactions || []);
        setSummary(txResponse.data.summary || null);
      }

      // Fetch commission details
      const commResponse = await axios.get(`${API_BASE_URL}/api/v1/admin/payments/commission`, { headers });
      if (commResponse.data.success) {
        setCommissionData(commResponse.data.data || null);
      }

      // Fetch payouts
      const payoutResponse = await axios.get(`${API_BASE_URL}/api/v1/admin/payments/payouts`, { headers });
      if (payoutResponse.data.success) {
        setPayouts(payoutResponse.data.payouts || []);
      }

      // Fetch refund requests
      const refundResponse = await axios.get(`${API_BASE_URL}/api/v1/admin/payments/refunds`, { headers });
      if (refundResponse.data.success) {
        setRefundRequests(refundResponse.data.refunds || []);
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
      toast.error(error.response?.data?.message || "Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  // Handle refund action
  const handleRefundAction = async (paymentId, action) => {
    try {
      const reason = action === 'approve' 
        ? 'Refund approved by admin' 
        : prompt("Enter reason for rejecting refund:");
      
      if (action === 'reject' && !reason) {
        toast.error("Reason is required to reject refund");
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/admin/payments/refund/${paymentId}`,
        { action, reason: reason || '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(`Refund ${action}d successfully`);
        fetchAllData(); // Refresh data
      }
    } catch (error) {
      console.error("Error handling refund:", error);
      toast.error(error.response?.data?.message || "Failed to process refund");
    }
  };

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
      refunded: 'bg-blue-100 text-blue-700',
      refund_requested: 'bg-purple-100 text-purple-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Payment Management</h1>
          <p className="text-gray-600 mt-1">Track transactions, commissions, and payouts</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{summary.count}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaCreditCard className="text-blue-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(summary.totalAmount)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaDollarSign className="text-green-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Commission</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(summary.totalCommission)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <FaPercentage className="text-purple-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Merchant Payouts</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(summary.totalMerchantPayout)}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <FaStore className="text-orange-600 text-xl" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4 px-4 pt-2">
              <button
                onClick={() => setActiveTab("transactions")}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === "transactions"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FaExchangeAlt className="inline mr-2" />
                Transactions
              </button>
              <button
                onClick={() => setActiveTab("commission")}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === "commission"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FaPercentage className="inline mr-2" />
                Commission
              </button>
              <button
                onClick={() => setActiveTab("payouts")}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === "payouts"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FaStore className="inline mr-2" />
                Payouts
              </button>
              <button
                onClick={() => setActiveTab("refunds")}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === "refunds"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FaClock className="inline mr-2" />
                Refunds
                {refundRequests.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {refundRequests.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Transactions Tab */}
            {activeTab === "transactions" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Merchant Gets</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs font-mono text-gray-600">
                          {tx.bookingId?.serviceTitle || tx.bookingId || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="text-gray-900">{tx.bookingId?.user?.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{tx.bookingId?.user?.email || ''}</div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatCurrency(tx.adminCommission)}
                        </td>
                        <td className="px-4 py-3 text-sm text-green-600 font-medium">
                          {formatCurrency(tx.merchantAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(tx.paymentStatus)}`}>
                            {tx.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(tx.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Commission Tab */}
            {activeTab === "commission" && commissionData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium">Total Amount Processed</p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">
                      {formatCurrency(commissionData.totalAmount)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                    <p className="text-sm text-purple-700 font-medium">Total Commission Earned</p>
                    <p className="text-3xl font-bold text-purple-900 mt-2">
                      {formatCurrency(commissionData.totalCommission)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">Average Commission Rate</p>
                    <p className="text-3xl font-bold text-green-900 mt-2">
                      {commissionData.commissionRate}%
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Commission Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Transactions:</span>
                      <span className="font-semibold text-gray-900">{commissionData.transactionCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Platform Commission:</span>
                      <span className="font-semibold text-purple-600">{formatCurrency(commissionData.totalCommission)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-3">
                      <span className="text-gray-600">Example (₹1000 @ 5%):</span>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Merchant gets: ₹950</div>
                        <div className="font-semibold text-blue-600">Commission: ₹50</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payouts Tab */}
            {activeTab === "payouts" && (
              <div className="space-y-6">
                {payouts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FaStore className="mx-auto text-6xl text-gray-300 mb-4" />
                    <p>No payouts yet</p>
                  </div>
                ) : (
                  payouts.map((payout, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {payout.merchant?.name || 'Unknown Merchant'}
                          </h3>
                          <p className="text-sm text-gray-500">{payout.merchant?.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Payout</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(payout.totalPayout)}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Bookings:</span>
                          <span className="ml-2 font-medium text-gray-900">{payout.totalBookings}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Commission Deducted:</span>
                          <span className="ml-2 font-medium text-purple-600">{formatCurrency(payout.totalCommission)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500">Net Payout:</span>
                          <span className="ml-2 font-bold text-green-600">{formatCurrency(payout.totalPayout)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Refunds Tab */}
            {activeTab === "refunds" && (
              <div className="space-y-4">
                {refundRequests.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FaCheck className="mx-auto text-6xl text-green-500 mb-4" />
                    <p>No pending refund requests</p>
                  </div>
                ) : (
                  refundRequests.map((refund) => (
                    <div key={refund._id} className="border border-purple-200 rounded-lg p-6 bg-purple-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {refund.bookingId?.serviceTitle || 'Booking'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            User: {refund.bookingId?.user?.name || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Amount: {formatCurrency(refund.amount)}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Requested: {formatDate(refund.updatedAt)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRefundAction(refund._id, 'approve')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                          >
                            <FaCheck size={14} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRefundAction(refund._id, 'reject')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                          >
                            <FaTimes size={14} />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
