// components/OrderStatusDisplay.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CookingPot,
  Truck,
  CircleCheckBig,
  CircleX,
  CalendarArrowDown,
} from "lucide-react";

const StatusIcon = {
  Pending: <Clock className="text-blue-500" />,
  "Order Received": <CalendarArrowDown className="text-cyan-600" />,
  Preparing: <CookingPot className="text-indigo-500" />,
  "Ready for Pickup": <Truck className="text-orange-500" />,
  Completed: <CircleCheckBig className="text-green-500" />, 
  "Ask for Cancel": <CircleX className="text-red-500" />,
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
        return "text-indigo-500 border-indigo-500";
      case "Ready for Pickup":
        return "text-orange-500 border-orange-500";
      case "Completed":
        return "text-green-600 border-green-600";
      case "Ask for Cancel":
        return "text-red-500 border-red-500";
      default:
        return "text-blue-500 border-blue-500";
    }
  };

  console.log("status", status);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-6 dark:bg-gray-800 dark:shadow-none">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          {StatusIcon[status as keyof typeof StatusIcon]}
          <div>
            <h2 className="text-lg md:text-xl font-semibold capitalize">
              {status}
            </h2>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
              Current order status
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <Badge
            variant="outline"
            className={`capitalize text-xs md:text-sm ${getStatusColor(
              status
            )}`}
          >
            {takeFromStore ? "Pick Up" : "Delivery"}
          </Badge>
        </div>
      </div>
    </div>
  );
};
