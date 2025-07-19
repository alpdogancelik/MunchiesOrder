import { ORDER_STATUS } from "@/lib/constants";

interface OrderStatusProps {
  status: string;
  size?: "sm" | "md" | "lg";
}

export default function OrderStatus({ status, size = "md" }: OrderStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return "fas fa-clock";
      case ORDER_STATUS.CONFIRMED:
        return "fas fa-check-circle";
      case ORDER_STATUS.PREPARING:
        return "fas fa-utensils";
      case ORDER_STATUS.READY:
        return "fas fa-box";
      case ORDER_STATUS.OUT_FOR_DELIVERY:
        return "fas fa-motorcycle";
      case ORDER_STATUS.DELIVERED:
        return "fas fa-home";
      case ORDER_STATUS.CANCELLED:
        return "fas fa-times-circle";
      default:
        return "fas fa-question-circle";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20";
      case ORDER_STATUS.CONFIRMED:
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20";
      case ORDER_STATUS.PREPARING:
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20";
      case ORDER_STATUS.READY:
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20";
      case ORDER_STATUS.OUT_FOR_DELIVERY:
        return "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20";
      case ORDER_STATUS.DELIVERED:
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20";
      case ORDER_STATUS.CANCELLED:
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-16 h-16 text-2xl",
    lg: "w-24 h-24 text-4xl",
  };

  const iconClasses = getStatusIcon();
  const colorClasses = getStatusColor();
  const sizeClass = sizeClasses[size];

  const shouldAnimate = [ORDER_STATUS.PREPARING, ORDER_STATUS.OUT_FOR_DELIVERY].includes(status);

  return (
    <div className={`${sizeClass} ${colorClasses} rounded-full flex items-center justify-center ${shouldAnimate ? 'animate-pulse' : ''}`}>
      <i className={`${iconClasses} ${shouldAnimate ? 'animate-pulse' : ''}`}></i>
    </div>
  );
}
