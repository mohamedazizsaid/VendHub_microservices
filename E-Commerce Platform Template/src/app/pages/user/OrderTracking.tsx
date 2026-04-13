import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { Package, Truck, CheckCircle, Loader2, AlertCircle, MessageSquareWarning } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { formatCurrency, formatDate } from "../../lib/utils";
import { Commande, orderService } from "../../api/order.service";
import { Reclamation, reclamationService } from "../../api/reclamation.service";
import { authService, getUserFromToken } from "../../api/auth.service";
import { toast } from "sonner";

const STATUS_FLOW = ["processing", "in_transit", "delivered"] as const;

type OrderStatus = (typeof STATUS_FLOW)[number];

const normalizeStatus = (value?: string): OrderStatus => {
  const status = (value || "processing").toLowerCase();
  if (status === "in_transit") return "in_transit";
  if (status === "delivered") return "delivered";
  return "processing";
};

export function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState<Commande | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [resolvedUserId, setResolvedUserId] = useState<number | null>(null);
  const [myReclamation, setMyReclamation] = useState<Reclamation | null>(null);
  const [reclamationTitle, setReclamationTitle] = useState("");
  const [reclamationDescription, setReclamationDescription] = useState("");
  const [isReclamationLoading, setIsReclamationLoading] = useState(false);
  const [isReclamationSaving, setIsReclamationSaving] = useState(false);

  const currentUser = getUserFromToken();
  const currentUserId = currentUser?.sub ? String(currentUser.sub) : "";

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) {
        setErrorMessage("Invalid order reference");
        setLoading(false);
        return;
      }

      try {
        const data = await orderService.getCommandeById(Number(id));
        setOrder(data);
      } catch (error: any) {
        setErrorMessage(error.message || "Unable to load order details");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  const resolveNumericUserId = async (): Promise<number | null> => {
    if (!currentUserId) return null;

    if (/^\d+$/.test(currentUserId)) {
      return Number(currentUserId);
    }

    try {
      const user = await authService.getUser(currentUserId);
      return typeof user?.id === "number" ? user.id : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const loadMyReclamation = async () => {
      if (!order?.id) return;

      if (!currentUserId) {
        setResolvedUserId(null);
        setMyReclamation(null);
        setReclamationTitle("");
        setReclamationDescription("");
        return;
      }

      try {
        setIsReclamationLoading(true);
        const numericUserId = await resolveNumericUserId();
        setResolvedUserId(numericUserId);

        if (!numericUserId) {
          setMyReclamation(null);
          setReclamationTitle("");
          setReclamationDescription("");
          return;
        }

        const allForOrder = await reclamationService.getReclamationsByCommandeId(order.id);
        const mine = allForOrder
          .filter((entry) => Number(entry.userId) === numericUserId)
          .sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
            const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
            return dateB - dateA;
          })[0] || null;

        setMyReclamation(mine);
        setReclamationTitle(mine?.title || "");
        setReclamationDescription(mine?.description || "");
      } catch {
        setMyReclamation(null);
        setReclamationTitle("");
        setReclamationDescription("");
      } finally {
        setIsReclamationLoading(false);
      }
    };

    loadMyReclamation();
  }, [order?.id, currentUserId]);

  const saveReclamation = async () => {
    if (!order?.id) return;

    if (!currentUserId) {
      toast.error("Please login to submit a reclamation");
      return;
    }

    if (!resolvedUserId) {
      toast.error("Unable to resolve your profile for reclamation");
      return;
    }

    if (!reclamationTitle.trim() || !reclamationDescription.trim()) {
      toast.error("Please provide both title and description");
      return;
    }

    try {
      setIsReclamationSaving(true);

      if (myReclamation?.id) {
        const updated = await reclamationService.updateReclamation(myReclamation.id, {
          title: reclamationTitle.trim(),
          description: reclamationDescription.trim(),
        });
        setMyReclamation({ ...myReclamation, ...updated });
        toast.success("Reclamation updated successfully");
      } else {
        const created = await reclamationService.createReclamation({
          userId: resolvedUserId,
          commandeId: order.id,
          title: reclamationTitle.trim(),
          description: reclamationDescription.trim(),
          status: "OPEN",
        });
        setMyReclamation(created);
        toast.success("Reclamation submitted successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save reclamation");
    } finally {
      setIsReclamationSaving(false);
    }
  };

  const status = normalizeStatus(order?.status);

  const statusSteps = useMemo(() => {
    const createdAt = order?.createdAt || new Date().toISOString();
    return [
      {
        label: "Order Placed",
        icon: CheckCircle,
        status: "completed",
        date: createdAt,
      },
      {
        label: "Processing",
        icon: Package,
        status: status === "processing" ? "current" : "completed",
        date: createdAt,
      },
      {
        label: "In Transit",
        icon: Truck,
        status: status === "delivered" ? "completed" : status === "in_transit" ? "current" : "pending",
        date: status === "in_transit" || status === "delivered" ? createdAt : undefined,
      },
      {
        label: "Delivered",
        icon: CheckCircle,
        status: status === "delivered" ? "completed" : "pending",
        date: status === "delivered" ? createdAt : undefined,
      },
    ];
  }, [order?.createdAt, status]);

  const itemCount = (order?.lignesCommande || []).reduce((sum, line) => sum + (line.quantite || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#16213E] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading order tracking...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#16213E] flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-10 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl text-gray-900 dark:text-white mb-2">Order not found</h2>
            <p className="text-gray-600 dark:text-gray-400">{errorMessage || "No order was found for this reference."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 rounded-2xl p-6 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#334155] text-white">
          <h1 className="text-3xl mb-2">Order Tracking</h1>
          <p className="text-white/80">Order ID: #{order.id}</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Delivery Status</CardTitle>
              <Badge
                variant={
                  status === "delivered" ? "success" :
                  status === "in_transit" ? "info" : "warning"
                }
              >
                {status.replace("_", " ")}
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
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(step.date)}</p>
                      )}
                      {step.status === "current" && (
                        <p className="text-sm text-[#FF6B35] mt-1">In progress...</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Delivery Address</h4>
                <p className="text-gray-900 dark:text-white">{order.clientAddress || "Not provided"}</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Contact Phone</h4>
                <p className="text-gray-900 dark:text-white">{order.clientPhone || "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5 text-[#FF6B35]" />
                Reclamation Support
              </CardTitle>
              {myReclamation?.status ? (
                <Badge
                  variant={
                    ["RESOLVED", "CLOSED"].includes(myReclamation.status.toUpperCase())
                      ? "success"
                      : myReclamation.status.toUpperCase() === "IN_PROGRESS"
                        ? "info"
                        : "warning"
                  }
                >
                  {myReclamation.status.replace("_", " ")}
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            {isReclamationLoading ? (
              <div className="py-8 text-gray-600 dark:text-gray-400 inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading your reclamation...
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Need help with this order? Submit a reclamation and update it anytime until support resolves it.
                </p>

                <div className="grid gap-2">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Title</label>
                  <Input
                    value={reclamationTitle}
                    onChange={(e) => setReclamationTitle(e.target.value)}
                    placeholder="Example: Damaged package or missing item"
                    disabled={isReclamationSaving}
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Description</label>
                  <Textarea
                    rows={4}
                    value={reclamationDescription}
                    onChange={(e) => setReclamationDescription(e.target.value)}
                    placeholder="Describe your issue with clear details..."
                    disabled={isReclamationSaving}
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {myReclamation?.updatedAt
                      ? `Last updated: ${formatDate(myReclamation.updatedAt)}`
                      : myReclamation?.createdAt
                        ? `Submitted: ${formatDate(myReclamation.createdAt)}`
                        : "No reclamation submitted yet"}
                  </p>
                  <Button
                    onClick={saveReclamation}
                    disabled={isReclamationSaving || !reclamationTitle.trim() || !reclamationDescription.trim()}
                    className="bg-[#FF6B35] hover:bg-[#e85a24] text-white"
                  >
                    {isReclamationSaving
                      ? "Saving..."
                      : myReclamation?.id
                        ? "Update My Reclamation"
                        : "Submit Reclamation"}
                  </Button>
                </div>

                {myReclamation?.reply ? (
                  <div className="rounded-lg p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1F4068]">
                    <p className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">Support Reply</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{myReclamation.reply}</p>
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Items ({itemCount})</CardTitle>
          </CardHeader>
          <CardContent>
            {(order.lignesCommande || []).length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No line items found for this order.</p>
            ) : (
              <div className="space-y-4">
                {(order.lignesCommande || []).map((line) => (
                  <div key={line.id || `${line.produitId}-${line.nomProduit}`} className="flex gap-4 p-4 bg-gray-50 dark:bg-[#1F4068] rounded-lg">
                    <div className="w-20 h-20 rounded-lg bg-white dark:bg-[#243b55] flex items-center justify-center text-[#FF6B35]">
                      <Package className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-gray-900 dark:text-white mb-1">{line.nomProduit}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Qty: {line.quantite}</p>
                      <p className="text-lg text-[#FF6B35]">{formatCurrency(line.prixUnitaire * line.quantite)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-xl text-gray-900 dark:text-white">
                <span>Total</span>
                <span>{formatCurrency(order.prixTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
