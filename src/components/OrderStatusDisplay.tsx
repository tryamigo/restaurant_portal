// components/OrderStatusDisplay.tsx
import React from 'react';
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Package,
  Truck,
  CheckCircle2
} from 'lucide-react';

const StatusIcon = {
  pending: <Clock className="text-yellow-500" />,
  preparing: <Package className="text-blue-500" />,
  'on the way': <Truck className="text-orange-500" />,
  delivered: <CheckCircle2 className="text-green-500" />
};

interface OrderStatusDisplayProps {
  status: string;
}

export const OrderStatusDisplay: React.FC<OrderStatusDisplayProps> = ({ status }) => {
  const getStatusColor = (currentStatus: string) => {
    switch (currentStatus) {
      case 'delivered': return 'text-green-600 border-green-600';
      case 'preparing': return 'text-blue-600 border-blue-600';
      case 'on the way': return 'text-orange-600 border-orange-600';
      default: return 'text-gray-600 border-gray-600';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-6 dark:bg-gray-800 dark:shadow-none">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          {StatusIcon[status as keyof typeof StatusIcon]}
          <div>
            <h2 className="text-lg md:text-xl font-semibold capitalize">{status}</h2>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Current order status</p>
          </div>
        </div>
        <div className='flex items-center'>
          <Badge
            variant="outline"
            className={`capitalize text-xs md:text-sm ${getStatusColor(status)}`}
          >
            {status}
          </Badge>
        </div>
      </div>
    </div>
  );
};