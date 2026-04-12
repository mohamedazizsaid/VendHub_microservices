import { useParams } from "react-router";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { mockOrders, mockProducts } from "../../data/mockData";
import { formatCurrency, formatDate } from "../../lib/utils";

export function OrderTracking() {
  const { id } = useParams();
  const order = mockOrders.find((o) => o.id === id) || mockOrders[0];

  const statusSteps = [
    { label: "Order Placed", icon: CheckCircle, status: "completed", date: order.date },
    { label: "Processing", icon: Package, status: order.status === "delivered" || order.status === "in_transit" ? "completed" : order.status === "processing" ? "current" : "pending", date: "2026-02-11" },
    { label: "In Transit", icon: Truck, status: order.status === "delivered" ? "completed" : order.status === "in_transit" ? "current" : "pending", date: order.status === "delivered" || order.status === "in_transit" ? "2026-02-13" : undefined },
    { label: "Delivered", icon: CheckCircle, status: order.status === "delivered" ? "completed" : "pending", date: order.status === "delivered" ? order.estimatedDelivery : undefined },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 dark:text-white mb-2">Order Tracking</h1>
          <p className="text-gray-600 dark:text-gray-400">Order ID: {order.id}</p>
        </div>

        {/* Order Status */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Delivery Status</CardTitle>
              <Badge
                variant={
                  order.status === "delivered" ? "success" :
                  order.status === "in_transit" ? "info" : "warning"
                }
              >
                {order.status.replace("_", " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === statusSteps.length - 1;
                
                return (
                  <div key={index} className="flex gap-4 pb-8 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          step.status === "completed"
                            ? "bg-green-500"
                            : step.status === "current"
                            ? "bg-[#FF6B35]"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {!isLast && (
                        <div
                          className={`w-0.5 h-16 mt-2 ${
                            step.status === "completed"
                              ? "bg-green-500"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        ></div>
                      )}
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-lg text-gray-900 dark:text-white mb-1">{step.label}</h3>
                      {step.date && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(step.date)}
                        </p>
                      )}
                      {step.status === "current" && (
                        <p className="text-sm text-[#FF6B35] mt-1">In progress...</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {order.trackingNumber && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-[#1F4068] rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tracking Number</p>
                <p className="text-lg text-gray-900 dark:text-white">{order.trackingNumber}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Delivery Address</h4>
                <p className="text-gray-900 dark:text-white">{order.shippingAddress}</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Estimated Delivery</h4>
                <p className="text-gray-900 dark:text-white">{formatDate(order.estimatedDelivery)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items ({order.items})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProducts.slice(0, order.items).map((product) => (
                <div key={product.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-[#1F4068] rounded-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-gray-900 dark:text-white mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{product.category}</p>
                    <p className="text-lg text-[#FF6B35]">{formatCurrency(product.price)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-xl text-gray-900 dark:text-white">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
