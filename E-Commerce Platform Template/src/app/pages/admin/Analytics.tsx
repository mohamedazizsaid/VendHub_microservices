import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { formatCurrency, formatNumber } from "../../lib/utils";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Commande, orderService } from "../../api/order.service";
import { authService } from "../../api/auth.service";
import { Product, productService } from "../../api/product.service";
import { toast } from "sonner";
import { AdminDateRangeFilter } from "../../components/shared/AdminDateRangeFilter";
import { AdminDateRange, isDateInRange } from "../../lib/admin-date-range";

const COLORS = ["#FF6B35", "#00D4FF", "#2C3E50", "#4CAF50", "#FFC107", "#EC4899"];

export function Analytics() {
  const [orders, setOrders] = useState<Commande[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [usersCount, setUsersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<AdminDateRange>("30d");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        const [ordersResult, usersResult, productsResult] = await Promise.allSettled([
          orderService.getAllCommandes(),
          authService.getUsers({ page: 0, size: 1 }),
          productService.getAllProducts(),
        ]);

        setOrders(ordersResult.status === "fulfilled" ? ordersResult.value : []);
        setUsersCount(usersResult.status === "fulfilled" ? usersResult.value.totalElements || 0 : 0);
        setProducts(productsResult.status === "fulfilled" ? productsResult.value : []);
      } catch {
        toast.error("Failed to load analytics data");
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const scopedOrders = useMemo(
    () => orders.filter((order) => isDateInRange(order.createdAt, dateRange)),
    [orders, dateRange]
  );

  const totalRevenue = useMemo(
    () => scopedOrders.reduce((sum, order) => sum + Number(order.prixTotal || 0), 0),
    [scopedOrders]
  );

  const avgOrderValue = useMemo(
    () => (scopedOrders.length ? totalRevenue / scopedOrders.length : 0),
    [scopedOrders, totalRevenue]
  );

  const monthlyData = useMemo(() => {
    const map = new Map<string, { month: string; revenue: number; orders: number }>();

    scopedOrders.forEach((order) => {
      const date = order.createdAt ? new Date(order.createdAt) : null;
      if (!date || Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const monthLabel = date.toLocaleString("en-US", { month: "short" });
      const current = map.get(key) || { month: monthLabel, revenue: 0, orders: 0 };

      current.revenue += Number(order.prixTotal || 0);
      current.orders += 1;
      map.set(key, current);
    });

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map((entry) => entry[1]);
  }, [scopedOrders]);

  const previousRevenue = monthlyData.length > 1 ? monthlyData[monthlyData.length - 2].revenue : 0;
  const currentRevenue = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].revenue : 0;
  const revenueGrowth = previousRevenue > 0
    ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
    : currentRevenue > 0
      ? 100
      : 0;

  const previousOrders = monthlyData.length > 1 ? monthlyData[monthlyData.length - 2].orders : 0;
  const currentOrders = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].orders : 0;
  const orderGrowth = previousOrders > 0
    ? Math.round(((currentOrders - previousOrders) / previousOrders) * 100)
    : currentOrders > 0
      ? 100
      : 0;

  const statusCounters = useMemo(() => {
    const processing = orders.filter((o) => (o.status || "").toLowerCase() === "processing").length;
    const inTransit = orders.filter((o) => (o.status || "").toLowerCase() === "in_transit").length;
    const delivered = orders.filter((o) => (o.status || "").toLowerCase() === "delivered").length;
    return { processing, inTransit, delivered };
  }, [scopedOrders]);

  const categoryData = useMemo(() => {
    const productNameToCategory = new Map<string, string>();
    products.forEach((product) => {
      productNameToCategory.set(product.name, product.category || "Other");
    });

    const categoryMap = new Map<string, number>();
    scopedOrders.forEach((order) => {
      (order.lignesCommande || []).forEach((line) => {
        const category = productNameToCategory.get(line.nomProduit) || "Other";
        const revenue = Number(line.prixUnitaire || 0) * Number(line.quantite || 0);
        categoryMap.set(category, (categoryMap.get(category) || 0) + revenue);
      });
    });

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [scopedOrders, products]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; sales: number; revenue: number }>();

    scopedOrders.forEach((order) => {
      (order.lignesCommande || []).forEach((line) => {
        const key = line.nomProduit || `Product #${line.produitId}`;
        const current = map.get(key) || { name: key, sales: 0, revenue: 0 };
        current.sales += Number(line.quantite || 0);
        current.revenue += Number(line.prixUnitaire || 0) * Number(line.quantite || 0);
        map.set(key, current);
      });
    });

    const bestSales = Math.max(...Array.from(map.values()).map((item) => item.sales), 0);

    return Array.from(map.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
      .map((item) => ({
        ...item,
        growth: bestSales > 0 ? Math.round((item.sales / bestSales) * 100) : 0,
      }));
  }, [scopedOrders]);

  const repeatCustomers = useMemo(() => {
    const customerOrderCount = new Map<string, number>();
    scopedOrders.forEach((order) => {
      const key = order.clientId || "unknown";
      customerOrderCount.set(key, (customerOrderCount.get(key) || 0) + 1);
    });

    const repeat = Array.from(customerOrderCount.values()).filter((count) => count > 1).length;
    const unique = customerOrderCount.size;

    return {
      unique,
      repeat,
      repeatRate: unique > 0 ? Math.round((repeat / unique) * 100) : 0,
    };
  }, [scopedOrders]);

  const newCustomerRate = Math.max(0, Math.min(100, 100 - repeatCustomers.repeatRate));
  const vipRate = Math.max(0, Math.round(repeatCustomers.repeatRate * 0.45));
  const returningRate = Math.max(0, 100 - newCustomerRate - vipRate);

  const overallConversion = usersCount > 0 ? ((scopedOrders.length / usersCount) * 100).toFixed(1) : "0.0";
  const cartAbandonment = Math.max(0, 100 - Math.round(Number(overallConversion) * 8));
  const repeatPurchase = `${repeatCustomers.repeatRate}%`;

  const exportReport = () => {
    const lines = [
      ["metric", "value"],
      ["total_revenue", totalRevenue.toFixed(2)],
      ["total_orders", String(scopedOrders.length)],
      ["total_users", String(usersCount)],
      ["average_order_value", avgOrderValue.toFixed(2)],
      ["revenue_growth_percent", String(revenueGrowth)],
      ["order_growth_percent", String(orderGrowth)],
      ["delivered_orders", String(statusCounters.delivered)],
      ["in_transit_orders", String(statusCounters.inTransit)],
      ["processing_orders", String(statusCounters.processing)],
      ["repeat_purchase_percent", String(repeatCustomers.repeatRate)],
    ];

    const csv = lines.map((line) => line.map((value) => `"${value}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#16213E] p-4 md:p-8 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E] p-4 md:p-8">
      <div className="mb-8 rounded-2xl p-6 bg-gradient-to-r from-[#1f2937] via-[#0f172a] to-[#111827] text-white">
        <h1 className="text-3xl mb-2">Analytics & Reports</h1>
        <p className="text-white/80">Detailed live insights into your business performance.</p>
        <div className="mt-4">
          <AdminDateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <Button variant="outline" onClick={exportReport}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Revenue Growth", value: `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth}%`, subtext: "vs previous month" },
          { label: "Order Growth", value: `${orderGrowth >= 0 ? "+" : ""}${orderGrowth}%`, subtext: "vs previous month" },
          { label: "Repeat Customers", value: `${repeatCustomers.repeatRate}%`, subtext: "returning customer rate" },
          { label: "Avg Order Value", value: formatCurrency(avgOrderValue), subtext: "per order" },
        ].map((metric) => (
          <Card key={metric.label}>
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
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Orders Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">No monthly trend data available yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value: number, name: string) => name === "Revenue" ? formatCurrency(value) : value} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={2.5} name="Revenue" />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#00D4FF" strokeWidth={2.5} name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">Category distribution will appear with order history.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">Top products will appear after first customer orders.</p>
            )}
            {topProducts.map((product) => (
              <div key={product.name} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-900 dark:text-white">{product.name}</span>
                    <span className="text-[#FF6B35]">{formatCurrency(product.revenue)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{formatNumber(product.sales)} sales</span>
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

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "New Customers", value: newCustomerRate, color: "#FF6B35" },
                { label: "Returning", value: returningRate, color: "#00D4FF" },
                { label: "VIP", value: vipRate, color: "#4CAF50" },
              ].map((segment) => (
                <div key={segment.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{segment.label}</span>
                    <span className="text-gray-900 dark:text-white">{segment.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full" style={{ width: `${segment.value}%`, backgroundColor: segment.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { source: "Processing", percentage: statusCounters.processing },
                { source: "In Transit", percentage: statusCounters.inTransit },
                { source: "Delivered", percentage: statusCounters.delivered },
              ].map((item) => {
                const rate = scopedOrders.length > 0 ? Math.round((item.percentage / scopedOrders.length) * 100) : 0;
                return (
                  <div key={item.source}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{item.source}</span>
                      <span className="text-gray-900 dark:text-white">{rate}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#FF6B35] to-[#00D4FF]" style={{ width: `${rate}%` }}></div>
                    </div>
                  </div>
                );
              })}
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
                <p className="text-3xl text-gray-900 dark:text-white">{overallConversion}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cart Abandonment</p>
                <p className="text-3xl text-gray-900 dark:text-white">{cartAbandonment}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Repeat Purchase</p>
                <p className="text-3xl text-gray-900 dark:text-white">{repeatPurchase}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
