import MerchantLayout from "../../components/merchant/MerchantLayout";
import { FaBullhorn, FaTag, FaShare } from "react-icons/fa";
import GridLayout from "../../components/common/GridLayout";

const MerchantMarketing = () => {
  return (
    <MerchantLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Marketing Tools</h2>
          <p className="text-gray-600 mt-1">Promote your events and boost ticket sales</p>
        </div>

        <GridLayout>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <FaTag className="text-4xl text-blue-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Promo Codes</h3>
            <p className="text-gray-600 text-sm mb-4">Create discount codes for your events</p>
            <button className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              Create Promo Code
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <FaShare className="text-4xl text-green-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Event</h3>
            <p className="text-gray-600 text-sm mb-4">Share event links on social media</p>
            <button className="w-full px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
              Get Share Links
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <FaBullhorn className="text-4xl text-purple-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Campaign</h3>
            <p className="text-gray-600 text-sm mb-4">Send promotional emails</p>
            <button className="w-full px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors">
              Create Campaign
            </button>
          </div>
        </GridLayout>
      </div>
    </MerchantLayout>
  );
};

export default MerchantMarketing;
