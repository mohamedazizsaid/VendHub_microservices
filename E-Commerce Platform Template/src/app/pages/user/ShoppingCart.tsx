import { useState } from "react";
import { Link } from "react-router";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { mockProducts } from "../../data/mockData";
import { formatCurrency } from "../../lib/utils";

export function ShoppingCart() {
  const [cartItems, setCartItems] = useState([
    { product: mockProducts[0], quantity: 2 },
    { product: mockProducts[1], quantity: 1 },
    { product: mockProducts[2], quantity: 1 },
  ]);
  const [couponCode, setCouponCode] = useState("");

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const updateQuantity = (index: number, delta: number) => {
    setCartItems((items) =>
      items.map((item, i) =>
        i === index ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeItem = (index: number) => {
    setCartItems((items) => items.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl text-gray-900 dark:text-white mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Add some products to get started!</p>
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
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <Card key={index}>
                  <CardContent className="flex gap-4 p-4">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <div>
                          <Link to={`/products/${item.product.id}`}>
                            <h3 className="text-lg text-gray-900 dark:text-white hover:text-[#FF6B35]">
                              {item.product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.product.category}</p>
                        </div>
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                          <button
                            onClick={() => updateQuantity(index, -1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 text-gray-900 dark:text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, 1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xl text-[#FF6B35]">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Link to="/products">
                <Button variant="outline">
                  Continue Shopping
                </Button>
              </Link>
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardContent>
                  <h2 className="text-xl text-gray-900 dark:text-white mb-4">Order Summary</h2>
                  
                  {/* Coupon */}
                  <div className="mb-6">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <Button variant="outline">Apply</Button>
                    </div>
                  </div>

                  {/* Pricing */}
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
                      <p className="text-sm text-green-600 dark:text-green-400">🎉 You qualify for free shipping!</p>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <div className="flex justify-between text-xl text-gray-900 dark:text-white">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Secure checkout powered by Stripe
                    </p>
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
