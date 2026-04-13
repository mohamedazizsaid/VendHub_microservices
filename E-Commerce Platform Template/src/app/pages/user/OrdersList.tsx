import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Package, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { formatCurrency, formatDate } from "../../lib/utils";
import { Commande, orderService } from "../../api/order.service";
import { getUserFromToken } from "../../api/auth.service";

const getBadgeVariant = (status: string): "success" | "warning" | "info" => {
  const normalized = (status || "processing").toLowerCase();
  if (normalized === "delivered") return "success";
  if (normalized === "in_transit") return "info";
  return "warning";
};

export function OrdersList() {
  const [orders, setOrders] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUserFromToken();

  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.sub) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        const data = await orderService.getCommandesByClientId(user.sub);
        setOrders(data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user?.sub]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 rounded-2xl p-6 bg-gradient-to-r from-[#111827] to-[#1f2937] text-white">
          <h1 className="text-3xl">My Orders</h1>
          <p className="text-white/80 mt-1">Track your purchases in real time.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-700 dark:text-gray-300 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading your orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-14 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl text-gray-900 dark:text-white mb-2">No orders yet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Your next luxury purchase starts here.</p>
              <Link to="/products">
                <Button>
                  Explore Products
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Order #{order.id}</CardTitle>
                  <Badge variant={getBadgeVariant(order.status)}>
                    {order.status.replace("_", " ")}
                  </Badge>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(order.createdAt || new Date().toISOString())}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.lignesCommande?.length || 0} items
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xl text-[#FF6B35]">{formatCurrency(order.prixTotal || 0)}</p>
                    <Link to={`/orders/${order.id}`}>
                      <Button variant="outline">Track</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
