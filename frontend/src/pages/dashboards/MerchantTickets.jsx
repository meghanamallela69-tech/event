import MerchantLayout from "../../components/merchant/MerchantLayout";
import { BsTicketPerforated } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";

const MerchantTickets = () => {
  return (
    <MerchantLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Tickets</h2>
            <p className="text-gray-600 mt-1">Create and manage ticket types for your events</p>
          </div>
          <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2">
            <FaPlus /> Create Ticket Type
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <BsTicketPerforated className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tickets Yet</h3>
          <p className="text-gray-600 mb-6">Create ticket types to start selling tickets for your events</p>
          <button className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Create Your First Ticket
          </button>
        </div>
      </div>
    </MerchantLayout>
  );
};

export default MerchantTickets;
