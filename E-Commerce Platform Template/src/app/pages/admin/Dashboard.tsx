import { useEffect, useMemo, useState } from "react";
import { DollarSign, ShoppingCart, Users, Package, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { formatCurrency, formatNumber } from "../../lib/utils";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Commande, orderService } from "../../api/order.service";
import { authService } from "../../api/auth.service";
import { productService } from "../../api/product.service";
import { toast } from "sonner";
import { AdminDateRangeFilter } from "../../components/shared/AdminDateRangeFilter";
import { AdminDateRange, isDateInRange } from "../../lib/admin-date-range";

export function AdminDashboard() {
  const [orders, setOrders] = useState<Commande[]>([]);
  const [usersCount, setUsersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<AdminDateRange>("30d");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);

        const [ordersResult, usersResult, productsResult] = await Promise.allSettled([
          orderService.getAllCommandes(),
          authService.getUsers({ page: 0, size: 1 }),
          productService.getAllProducts(),
        ]);

        if (ordersResult.status === "fulfilled") {
          const sortedOrders = [...ordersResult.value].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });
          setOrders(sortedOrders);
        } else {
          setOrders([]);
        }

        if (usersResult.status === "fulfilled") {
          setUsersCount(usersResult.value.totalElements || 0);
        } else {
          setUsersCount(0);
        }

        if (productsResult.status === "fulfilled") {
          setProductsCount(productsResult.value.length || 0);
        } else {
          setProductsCount(0);
        }
      } catch {
        toast.error("Failed to load dashboard metrics");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const scopedOrders = useMemo(
    () => orders.filter((order) => isDateInRange(order.createdAt, dateRange)),
    [orders, dateRange]
  );

  const totalRevenue = useMemo(
    () => scopedOrders.reduce((sum, order) => sum + Number(order.prixTotal || 0), 0),
    [scopedOrders]
  );

  const deliveredCount = useMemo(
    () => scopedOrders.filter((order) => (order.status || "").toLowerCase() === "delivered").length,
    [scopedOrders]
  );

  const inTransitCount = useMemo(
    () => scopedOrders.filter((order) => (order.status || "").toLowerCase() === "in_transit").length,
    [scopedOrders]
  );

  const processingCount = useMemo(
    () => scopedOrders.filter((order) => (order.status || "").toLowerCase() === "processing").length,
    [scopedOrders]
  );

  const deliveredRate = scopedOrders.length ? Math.round((deliveredCount / scopedOrders.length) * 100) : 0;

  const ordersByMonth = useMemo(() => {
    const map = new Map<string, { month: string; revenue: number; orders: number }>();

    scopedOrders.forEach((order) => {
      const date = order.createdAt ? new Date(order.createdAt) : null;
      if (!date || Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const month = date.toLocaleString("en-US", { month: "short" });
      const current = map.get(key) || { month, revenue: 0, orders: 0 };

      current.revenue += Number(order.prixTotal || 0);
      current.orders += 1;
      map.set(key, current);
    });

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map((entry) => entry[1]);
  }, [scopedOrders]);

  const statusData = [
    { name: "Processing", value: processingCount },
    { name: "In Transit", value: inTransitCount },
    { name: "Delivered", value: deliveredCount },
  ];

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

    return Array.from(map.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 4);
  }, [scopedOrders]);

  const recentOrders = scopedOrders.slice(0, 5);

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      helper: `${formatNumber(scopedOrders.length)} orders`,
      icon: DollarSign,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Total Orders",
      value: formatNumber(scopedOrders.length),
      helper: `${deliveredRate}% delivered`,
      icon: ShoppingCart,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Users",
      value: formatNumber(usersCount),
      helper: "Registered accounts",
      icon: Users,
      color: "from-cyan-500 to-cyan-600",
    },
    {
      label: "Total Products",
      value: formatNumber(productsCount),
      helper: "Catalog size",
      icon: Package,
      color: "from-orange-500 to-orange-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#16213E] p-4 md:p-8 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading dashboard metrics...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E] p-4 md:p-8">
      <div className="mb-8 rounded-2xl p-6 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#334155] text-white shadow-lg">
        <h1 className="text-3xl mb-2">Admin Dashboard</h1>
        <p className="text-white/80">Live operational metrics from your microservices.</p>
        <div className="mt-4">
          <AdminDateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="outline">Live</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-2xl text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.helper}</p>
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
            {ordersByMonth.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">No monthly data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ordersByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#00D4FF" radius={[6, 6, 0, 0]} />
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
              {recentOrders.length === 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">No orders available yet.</p>
              )}
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1F4068] rounded-lg">
                  <div>
                    <p className="text-gray-900 dark:text-white">#{order.id}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.lignesCommande?.length || 0} items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 dark:text-white">{formatCurrency(Number(order.prixTotal || 0))}</p>
                    <Badge
                      variant={
                        (order.status || "").toLowerCase() === "delivered" ? "success" :
                        (order.status || "").toLowerCase() === "in_transit" ? "info" : "warning"
                      }
                      className="mt-1"
                    >
                      {(order.status || "processing").replace("_", " ")}
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
              {topProducts.length === 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">Top products will appear when orders are placed.</p>
              )}
              {topProducts.map((product) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1F4068] rounded-lg">
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
