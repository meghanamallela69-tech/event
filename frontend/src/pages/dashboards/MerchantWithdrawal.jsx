import { useState } from "react";
import MerchantLayout from "../../components/merchant/MerchantLayout";
import { FaWallet, FaHistory } from "react-icons/fa";

const MerchantWithdrawal = () => {
  const [amount, setAmount] = useState("");

  return (
    <MerchantLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Withdrawal</h2>
          <p className="text-gray-600 mt-1">Request payout and view transaction history</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaWallet className="text-blue-600" />
              Request Withdrawal
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Balance</label>
                <div className="text-3xl font-bold text-green-600">$0.00</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Withdrawal Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
                Request Withdrawal
              </button>
              <p className="text-xs text-gray-500">Minimum withdrawal amount: $50</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaHistory className="text-purple-600" />
              Transaction History
            </h3>
            <div className="text-center py-12">
              <FaHistory className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No transactions yet</p>
            </div>
          </div>
        </div>
      </div>
    </MerchantLayout>
  );
};

export default MerchantWithdrawal;
