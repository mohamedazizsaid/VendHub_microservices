import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { formatCurrency } from "../../lib/utils";
import { cartStore, CartItem } from "../../lib/cart";
import { toast } from "sonner";
import { getUserFromToken } from "../../api/auth.service";
import { orderService } from "../../api/order.service";

export function ShoppingCart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const syncCart = () => setCartItems(cartStore.getItems());
    syncCart();
    window.addEventListener(cartStore.eventName, syncCart);
    return () => window.removeEventListener(cartStore.eventName, syncCart);
  }, []);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cartItems]
  );
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const updateQuantity = (productId: number, delta: number) => {
    const item = cartItems.find((entry) => entry.productId === productId);
    if (!item) return;
    const nextQuantity = item.quantity + delta;
    cartStore.updateQuantity(productId, nextQuantity);
  };

  const removeItem = (productId: number) => {
    cartStore.removeItem(productId);
    toast.success("Item removed from cart");
  };

  const handleCheckout = async () => {
    const user = getUserFromToken();
    if (!user?.sub) {
      toast.error("Please login to complete your checkout");
      navigate("/login");
      return;
    }

    if (!address.trim() || !phone.trim()) {
      toast.error("Please complete shipping address and phone number");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsCheckingOut(true);
    const toastId = toast.loading("Creating your order...");

    try {
      const commande = await orderService.createCommande({
        clientId: user.sub,
        clientName: user.name || user.preferred_username || "Client",
        clientAddress: address.trim(),
        clientPhone: phone.trim(),
        prixTotal: total,
        status: "processing",
        lignesCommande: cartItems.map((item) => ({
          produitId: item.productId,
          nomProduit: item.name,
          prixUnitaire: item.unitPrice,
          quantite: item.quantity,
        })),
      });

      cartStore.clear();
      toast.success("Order confirmed successfully", { id: toastId });
      if (commande.id) {
        navigate(`/orders/${commande.id}`);
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create order", { id: toastId });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 rounded-2xl p-6 bg-gradient-to-r from-[#FF6B35] via-[#ff8c42] to-[#00D4FF] text-white shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl">Your Shopping Cart</h1>
              <p className="text-white/90 mt-1">Luxury checkout experience, secure and fast.</p>
            </div>
            <Sparkles className="w-10 h-10 text-white/80" />
          </div>
        </div>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-14">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Add premium products to start your order.</p>
              <Link to="/products">
                <Button>
                  Continue Shopping
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.productId}>
                  <CardContent className="flex gap-4 p-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <div>
                          <Link to={`/products/${item.productId}`}>
                            <h3 className="text-lg text-gray-900 dark:text-white hover:text-[#FF6B35] transition-colors">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.category}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-red-600 hover:text-red-700"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 text-gray-900 dark:text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, 1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xl text-[#FF6B35]">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Link to="/products">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 space-y-3">
                    <Input
                      placeholder="Shipping address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                    <Input
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="mb-6">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        onClick={() => toast.info("Coupon validation prototype enabled")}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Tax</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    {shipping === 0 && (
                      <p className="text-sm text-green-600 dark:text-green-400">You qualify for free shipping.</p>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <div className="flex justify-between text-xl text-gray-900 dark:text-white">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isCheckingOut}>
                    {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
                    {!isCheckingOut && <ArrowRight className="ml-2 w-5 h-5" />}
                  </Button>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Secure checkout with premium support</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
