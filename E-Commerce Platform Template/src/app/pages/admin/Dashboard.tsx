import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { mockStats, mockSalesData, mockOrders } from "../../data/mockData";
import { formatCurrency, formatNumber } from "../../lib/utils";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function AdminDashboard() {
  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(mockStats.totalRevenue),
      change: mockStats.revenueGrowth,
      icon: DollarSign,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Total Orders",
      value: formatNumber(mockStats.totalOrders),
      change: mockStats.ordersGrowth,
      icon: ShoppingCart,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Users",
      value: formatNumber(mockStats.totalUsers),
      change: mockStats.usersGrowth,
      icon: Users,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Total Products",
      value: formatNumber(mockStats.totalProducts),
      change: mockStats.productsGrowth,
      icon: Package,
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E] p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change > 0;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {Math.abs(stat.change)}%
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl text-gray-900 dark:text-white">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#00D4FF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1F4068] rounded-lg">
                  <div>
                    <p className="text-gray-900 dark:text-white">{order.id}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.items} items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 dark:text-white">{formatCurrency(order.total)}</p>
                    <Badge
                      variant={
                        order.status === "delivered" ? "success" :
                        order.status === "in_transit" ? "info" : "warning"
                      }
                      className="mt-1"
                    >
                      {order.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Wireless Headphones", sales: 1234, revenue: 369900 },
                { name: "Smart Watch", sales: 987, revenue: 197400 },
                { name: "Laptop Stand", sales: 856, revenue: 85600 },
                { name: "USB-C Cable", sales: 745, revenue: 22350 },
              ].map((product, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1F4068] rounded-lg">
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white mb-1">{product.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{product.sales} sales</p>
                  </div>
                  <p className="text-lg text-[#FF6B35]">{formatCurrency(product.revenue)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
