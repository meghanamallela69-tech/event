import { useState, useEffect } from "react";
import axios from "axios";
import MerchantLayout from "../../components/merchant/MerchantLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import toast from "react-hot-toast";
import { 
  FaWallet, 
  FaChartLine, 
  FaExchangeAlt,
  FaCalendarAlt,
  FaRupeeSign,
  FaArrowUp,
  FaArrowDown,
  FaEye
} from "react-icons/fa";

const MerchantEarnings = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/payments/merchant/earnings`, {
        headers: authHeaders(token)
      });
      
      if (response.data.success) {
        setEarnings(response.data.earnings);
      }
    } catch (error) {
      console.error("Failed to fetch earnings:", error);
      toast.error("Failed to load earnings data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Earnings & Wallet</h1>
            <p className="text-gray-600">Track your revenue and wallet balance</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="week">This Week</option>
            </select>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Wallet Balance</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(earnings.walletBalance)}
                </p>
                <p className="text-purple-200 text-sm mt-1">Available for withdrawal</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FaWallet className="text-2xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(earnings.totalEarnings)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <FaArrowUp className="text-green-500 text-sm" />
                  <span className="text-green-600 text-sm">After commission</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaChartLine className="text-2xl text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {earnings.totalTransactions || 0}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Avg: {formatCurrency(earnings.avgEarningsPerTransaction)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaExchangeAlt className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Earnings Chart */}
        {earnings.monthlyEarnings && earnings.monthlyEarnings.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Monthly Earnings Trend</h3>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {earnings.monthlyEarnings.slice(0, 6).map((month, index) => (
                <div key={index} className="text-center">
                  <div className="bg-purple-100 rounded-lg p-4 mb-2">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(month.earnings).replace('₹', '₹')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {month.transactions} transactions
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
          </div>
          
          {earnings.recentTransactions && earnings.recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Your Earnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {earnings.recentTransactions.map((transaction) => (
                    <tr key={transaction.transactionId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.transactionId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {transaction.eventTitle}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(transaction.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-red-600">
                          -{formatCurrency(transaction.commission)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <FaCalendarAlt className="text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {formatDate(transaction.date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="text-purple-600 hover:text-purple-900"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FaExchangeAlt className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-500">No transactions found</p>
            </div>
          )}
        </div>

        {/* Earnings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Earnings Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lifetime Earnings:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(earnings.lifetimeEarnings)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Balance:</span>
                <span className="font-semibold text-purple-600">
                  {formatCurrency(earnings.walletBalance)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Commission Rate:</span>
                <span className="font-semibold text-red-600">5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Your Share:</span>
                <span className="font-semibold text-green-600">95%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2">
                <FaRupeeSign />
                Request Withdrawal
              </button>
              <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
                <FaChartLine />
                View Detailed Report
              </button>
              <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
                <FaCalendarAlt />
                Download Statement
              </button>
            </div>
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
};

export default MerchantEarnings;