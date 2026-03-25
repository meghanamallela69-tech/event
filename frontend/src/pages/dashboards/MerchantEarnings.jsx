import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE, authHeaders } from "../../lib/http";
import useAuth from "../../context/useAuth";
import MerchantLayout from "../../components/merchant/MerchantLayout";
import { FaDollarSign, FaWallet, FaHourglassHalf, FaChartLine, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

const MerchantEarnings = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [earnings, setEarnings] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);

  // Fetch earnings data
  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/merchant/earnings`, {
        headers: authHeaders(token)
      });
      
      if (data.success) {
        setEarnings(data.data);
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
      toast.error(error.response?.data?.message || "Failed to load earnings data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch withdrawal history
  const fetchWithdrawals = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/merchant/withdrawals`, {
        headers: authHeaders(token)
      });
      
      if (data.success) {
        setWithdrawals(data.withdrawals);
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
    }
  };

  useEffect(() => {
    fetchEarnings();
    fetchWithdrawals();
  }, []);

  // Handle withdrawal request
  const handleWithdrawalRequest = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(withdrawalAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > earnings.availableBalance) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      setWithdrawLoading(true);
      const { data } = await axios.post(`${API_BASE}/merchant/withdrawal`, 
        { amount },
        { headers: authHeaders(token) }
      );
      
      if (data.success) {
        toast.success("Withdrawal request submitted successfully!");
        setWithdrawalAmount("");
        setShowWithdrawalForm(false);
        // Refresh data
        fetchEarnings();
        fetchWithdrawals();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit withdrawal request");
    } finally {
      setWithdrawLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">₹{value?.toFixed(2) || "0.00"}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-4 rounded-full ${color}`}>
          <Icon className="text-2xl text-white" />
        </div>
      </div>
    </div>
  );

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      completed: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status] || "bg-gray-100 text-gray-800"}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FaSpinner className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading earnings data...</p>
          </div>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaDollarSign className="text-green-500" />
              Earnings & Withdrawals
            </h1>
            <p className="text-gray-600 mt-1">Track your earnings and manage withdrawals</p>
          </div>
          <button
            onClick={() => setShowWithdrawalForm(!showWithdrawalForm)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            {showWithdrawalForm ? "Cancel" : "Request Withdrawal"}
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          <StatCard
            title="Total Earnings"
            value={earnings?.totalEarnings || 0}
            icon={FaChartLine}
            color="bg-green-600"
            subtext="Lifetime earnings"
          />
          <StatCard
            title="Available Balance"
            value={earnings?.availableBalance || 0}
            icon={FaWallet}
            color="bg-blue-600"
            subtext="Ready to withdraw"
          />
          <StatCard
            title="Pending Amount"
            value={earnings?.pendingAmount || 0}
            icon={FaHourglassHalf}
            color="bg-yellow-600"
            subtext="Withdrawal requests"
          />
          <StatCard
            title="Commission Deducted"
            value={earnings?.commissionDeducted || 0}
            icon={FaDollarSign}
            color="bg-red-600"
            subtext="Platform fees"
          />
        </div>

        {/* Withdrawal Form */}
        {showWithdrawalForm && (
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Withdrawal</h2>
            <form onSubmit={handleWithdrawalRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Available balance: ₹{earnings?.availableBalance?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={withdrawLoading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {withdrawLoading && <FaSpinner className="animate-spin" />}
                  {withdrawLoading ? "Submitting..." : "Submit Request"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowWithdrawalForm(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {earnings?.transactionList?.length > 0 ? (
                  earnings.transactionList.map((transaction, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.bookingId?._id || transaction.bookingId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        ₹{transaction.amount?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        ₹{transaction.totalAmount?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        ₹{transaction.commission?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {transaction.paymentMethod || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.status === "success" 
                            ? "bg-green-100 text-green-800" 
                            : transaction.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {transaction.status?.toUpperCase() || "PENDING"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No transactions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Withdrawal Requests */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Withdrawal Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processed Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {withdrawals.length > 0 ? (
                  withdrawals.map((withdrawal) => (
                    <tr key={withdrawal._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {withdrawal._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ₹{withdrawal.amount?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(withdrawal.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {withdrawal.processedDate 
                          ? new Date(withdrawal.processedDate).toLocaleDateString() 
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No withdrawal requests yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
};

export default MerchantEarnings;
