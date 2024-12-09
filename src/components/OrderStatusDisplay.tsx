// components/OrderStatusDisplay.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CookingPot,
  CalendarArrowUp,
  CircleX,
  CalendarArrowDown,
  HandPlatter,
  MapPin,
  Package,
} from "lucide-react";

const StatusIcon = {
  Pending: <Clock className="text-yellow-600 w-9 h-9" />,
  "Order Received": <CalendarArrowDown className="text-cyan-600 w-9 h-9" />,
  Preparing: <CookingPot className="text-indigo-600 w-9 h-9" />,
  "Ready for Pickup": <Package className="text-orange-600 w-9 h-9" />,
  "Order Collected": < CalendarArrowUp className="text-green-600 w-9 h-9" />,
  "Ask for Cancel": <CircleX className="text-red-600 w-9 h-9" />,
};

interface OrderStatusDisplayProps {
  status: string;
  takeFromStore: boolean;
}

export const OrderStatusDisplay: React.FC<OrderStatusDisplayProps> = ({
  status,
  takeFromStore,
}) => {
  const getStatusColor = (currentStatus: string) => {
    switch (currentStatus) {
      case "Order Received":
        return "text-cyan-600 border-cyan-600";
      case "Preparing":
        return "text-indigo-600 border-indigo-600";
      case "Ready for Pickup":
        return "text-orange-600 border-orange-600";
      case "Order Collected":
        return "text-green-600 border-green-600";
      case "Ask for Cancel":
        return "text-red-600 border-red-600";
      default:
        return "text-yellow-600 border-yellow-600";
    }
  };

  console.log("status", status);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-6 dark:bg-gray-800 dark:shadow-none">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="flex items-center space-x-5 mb-4 md:mb-0">
          {StatusIcon[status as keyof typeof StatusIcon]}
          <div>
            <h2  className={`${getStatusColor(status)} text-2xl font-semibold capitalize`}>
            {status}
            </h2>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
              Current order status
            </p>
          </div>
        </div>
        <div className="flex  items-center">
          <Badge
            variant="outline"
            className={`text-lg  ${getStatusColor(
              status
            )}  px-3 py-1 rounded-lg dark:bg-gray-100`}
          >
            {takeFromStore ? (
              <div className="flex items-center space-x-2">
                <HandPlatter className="h-6 w-6" />
                <span>PICK UP</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <MapPin className="h-6 w-6" />
                <span>Delivery</span>
              </div>
            )}
          </Badge>
        </div>
      </div>
    </div>
  );
};
