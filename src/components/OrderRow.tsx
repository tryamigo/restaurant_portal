// components/OrderRow.tsx
import React from 'react';
import { Order } from '@/components/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    EyeIcon,
    MapPin,
    Star,
    Search,
    Package,
    Clock,
    TruckIcon,
    CheckCircle
} from 'lucide-react';
interface OrderRowProps {
    order: Order;
    onView: (id: string) => void;
    isMobile?: boolean;
}

const OrderRow: React.FC<OrderRowProps> = ({ order, onView, isMobile }) => {
    const STATUS_ICONS = {
        pending: <Clock className="text-yellow-500 w-5 h-5 mr-2" />,
        preparing: <Package className="text-blue-500 w-5 h-5 mr-2" />,
        'on the way': <TruckIcon className="text-orange-500 w-5 h-5 mr-2" />,
        delivered: <CheckCircle className="text-green-500 w-5 h-5 mr-2" />
    };

    const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'pending': return 'default';
            case 'preparing': return 'secondary';
            case 'on the way': return 'outline';
            case 'delivered': return 'default';
            default: return 'default';
        }
    };

    const renderDesktopRow = () => (
        <tr className="hover:bg-gray-50 hover:dark:bg-gray-800">
            <td className="px-6 py-4">
                <div className="font-medium" data-testid="orderId">{order.id.slice(0, 8)}</div>
                <div className="text-xs text-gray-500">{format(new Date(order.orderTime), 'PPp')}</div>
            </td>
            <td className="px-6 py-4">
                <div className="font-medium">{order.userAddress?.name || 'N/A'}</div>
                <div className="text-xs text-gray-500">{order.userAddress?.mobile || 'No contact'}</div>
            </td>
            <td className="px-6 py-4">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <div className="text-sm">{order.orderItems.length} items</div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="p-2">
                                {order.orderItems.map(item => (
                                    <div key={item.id} className="text-xs">{item.quantity}x {item.name}</div>
                                ))}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <div className="text-xs text-gray-500">Total: ₹{Number(order.total).toFixed(2)}</div>
            </td>
            <td className="px-6 py-4">
                <Badge variant={getStatusColor(order.status)}>
                    {STATUS_ICONS[order.status as keyof typeof STATUS_ICONS]}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm">
                    <div>Subtotal: ₹{Number(order.total - order.deliveryCharge + order.discount).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Delivery: ₹{Number(order.deliveryCharge).toFixed(2)}</div>
                    {order.discount > 0 && (
                        <div className="text-xs text-green-500">Discount: -₹{Number(order.discount).toFixed(2)}</div>
                    )}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                    {order.takeFromStore ? (
                        <Badge variant="secondary">Pick Up</Badge>
                    ) : (
                        <div className="flex items-center gap-2">
                            
                            <Badge variant="secondary">Delivery <MapPin className="h-4 w-4 ml-2" /></Badge>
                            {/* <span className="text-xs">DELIVERY</span> */}
                        </div>
                    )}
                    {order.rating && (
                        <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
 <span className="text-xs">{order.rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>
            </td>
            <td className="px-6 py-4">
                <Button variant="ghost" size="sm" onClick={() => onView(order.id)} data-testid = "view">
                    <EyeIcon className="mr-2 h-4 w-4" />
                    View
                </Button>
            </td>
        </tr>
    );

    const renderMobileRow = () => (
        <div className="p-4 bg-white border-b hover:bg-gray-50">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <div className="font-medium">{order.id.slice(0, 8)}</div>
                    <div className="text-xs text-gray-500">{format(new Date(order.orderTime), 'PPp')}</div>
                </div>
                <Badge variant={getStatusColor(order.status)}>
                    {STATUS_ICONS[order.status as keyof typeof STATUS_ICONS]}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                    <div className="text-sm font-medium">{order.userAddress?.name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{order.userAddress?.mobile || 'No contact'}</div>
                </div>
                <div className="text-right">
                    <div className="text-sm">Total: ₹{Number(order.total).toFixed(2)}</div>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <Button variant="ghost" size="sm" onClick={() => onView(order.id)}>
                    <EyeIcon className="mr-2 h-4 w-4" />
                    View
                </Button>
                {order.rating && (
                    <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs">{order.rating.toFixed(1)}</span>
                    </div>
                )}
            </div>
        </div>
    );

    return isMobile ? renderMobileRow() : renderDesktopRow();
};

export default OrderRow;