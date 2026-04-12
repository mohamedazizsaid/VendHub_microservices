import { TrendingUp, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { mockSalesData, mockStats } from "../../data/mockData";
import { formatCurrency, formatNumber } from "../../lib/utils";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function Analytics() {
  const categoryData = [
    { name: "Electronics", value: 35 },
    { name: "Fashion", value: 25 },
    { name: "Home", value: 20 },
    { name: "Sports", value: 12 },
    { name: "Books", value: 8 },
  ];

  const COLORS = ["#FF6B35", "#00D4FF", "#2C3E50", "#4CAF50", "#FFC107"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E] p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-white mb-2">Analytics & Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">Detailed insights into your business performance</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Revenue Growth", value: `+${mockStats.revenueGrowth}%`, subtext: "vs last month" },
          { label: "Order Growth", value: `+${mockStats.ordersGrowth}%`, subtext: "vs last month" },
          { label: "User Growth", value: `+${mockStats.usersGrowth}%`, subtext: "vs last month" },
          { label: "Avg Order Value", value: formatCurrency(mockStats.totalRevenue / mockStats.totalOrders), subtext: "per order" },
        ].map((metric, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center text-green-600 mb-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">{metric.subtext}</span>
              </div>
              <p className="text-3xl text-gray-900 dark:text-white mb-1">{metric.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue & Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Orders Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={2} name="Revenue" />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#00D4FF" strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Product Performance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Wireless Headphones", sales: 1234, revenue: 369900, growth: 15 },
              { name: "Smart Watch", sales: 987, revenue: 197400, growth: 12 },
              { name: "Laptop Stand", sales: 856, revenue: 85600, growth: 8 },
              { name: "USB-C Cable", sales: 745, revenue: 22350, growth: 5 },
              { name: "Desk Lamp", sales: 623, revenue: 31150, growth: 3 },
            ].map((product, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-900 dark:text-white">{product.name}</span>
                    <span className="text-[#FF6B35]">{formatCurrency(product.revenue)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{product.sales} sales</span>
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {product.growth}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Insights */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">New Customers</span>
                  <span className="text-gray-900 dark:text-white">45%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF6B35]" style={{ width: "45%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Returning</span>
                  <span className="text-gray-900 dark:text-white">35%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00D4FF]" style={{ width: "35%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">VIP</span>
                  <span className="text-gray-900 dark:text-white">20%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4CAF50]" style={{ width: "20%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { source: "Direct", percentage: 40 },
                { source: "Search", percentage: 30 },
                { source: "Social", percentage: 20 },
                { source: "Referral", percentage: 10 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{item.source}</span>
                    <span className="text-gray-900 dark:text-white">{item.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#FF6B35] to-[#00D4FF]" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Conversion</p>
                <p className="text-3xl text-gray-900 dark:text-white">3.2%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cart Abandonment</p>
                <p className="text-3xl text-gray-900 dark:text-white">28%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Repeat Purchase</p>
                <p className="text-3xl text-gray-900 dark:text-white">42%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
