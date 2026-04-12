import { Search, Download, Eye } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { mockOrders } from "../../data/mockData";
import { formatCurrency, formatDate } from "../../lib/utils";

export function OrderManagement() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E] p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-white mb-2">Order Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage customer orders</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1F4068] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <select className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1F4068] text-gray-900 dark:text-white">
          <option>All Status</option>
          <option>Processing</option>
          <option>In Transit</option>
          <option>Delivered</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#1F4068] border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {mockOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-[#1F4068]">
                    <td className="px-6 py-4 text-gray-900 dark:text-white">{order.id}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{formatDate(order.date)}</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">John Doe</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">{order.items}</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={order.status === "delivered" ? "success" : order.status === "in_transit" ? "info" : "warning"}>
                        {order.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
