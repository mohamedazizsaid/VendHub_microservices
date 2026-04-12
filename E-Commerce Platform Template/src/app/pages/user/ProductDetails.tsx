import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Star, Heart, ShoppingCart, Truck, Shield, Package, ChevronLeft, Minus, Plus } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency, formatDate } from "../../lib/utils";
import { productService, Product } from "../../api/product.service";
import { getUserFromToken } from "../../api/auth.service";
import { useTrackProductView } from "../../hooks/useProductInteraction";
import { toast } from "sonner";

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  // Track product view for recommendations
  useTrackProductView(id ? parseInt(id, 10) : undefined);

  useEffect(() => {
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      checkIfFavorite();
    }
  }, [product]);

  const loadProduct = async () => {
    try {
      if (id) {
        const productId = parseInt(id, 10);
        const data = await productService.getProductById(productId);
        setProduct(data);
      }
    } catch (err) {
      console.error("Error loading product:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    const user = getUserFromToken();
    if (!user || !product) return;
    
    try {
      const isFav = await productService.checkIfFavorite(product.id!);
      setIsFavorite(isFav);
    } catch (err) {
      console.error("Error checking favorite status:", err);
    }
  };

  const handleToggleFavorite = async () => {
    const user = getUserFromToken();
    if (!user) {
      toast.error("Please login to add to favorites");
      return;
    }

    if (!product) return;

    setIsLoadingFavorite(true);
    try {
      if (isFavorite) {
        await productService.removeFromFavorites(product.id!);
        setIsFavorite(false);
        toast.success("Product removed from favorites");
      } else {
        await productService.addToFavorites(product.id!);
        // Record favorite interaction for recommendations
        productService.recordFavoriteInteraction(product.id!).catch(() => {});
        setIsFavorite(true);
        toast.success("Product added to favorites");
      }
      // Notifier les autres composants que les favoris ont changé
      window.dispatchEvent(new Event("favorites-changed"));
    } catch (err: any) {
      toast.error(err.message || "Error updating favorites");
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#16213E] flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#16213E] flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <Link to="/" className="hover:text-[#FF6B35]">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[#FF6B35]">Products</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">{product.name}</span>
        </div>

        {/* Product Info */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div>
            <Card>
              <CardContent>
                <img
                  src={product.imageUrl || "https://via.placeholder.com/400x400"}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg mb-4"
                />
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`border-2 rounded-lg overflow-hidden ${
                        selectedImage === i ? "border-[#FF6B35]" : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <img src={product.imageUrl || "https://via.placeholder.com/100x100"} alt="" className="w-full h-20 object-cover" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details */}
          <div>
            <Card>
              <CardContent>
                <Badge variant="info" className="mb-2">{product.category}</Badge>
                <h1 className="text-3xl text-gray-900 dark:text-white mb-4">{product.name}</h1>
                
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl text-[#FF6B35]">{formatCurrency(product.price)}</span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6">{product.description}</p>

                {/* Stock Status */}
                <div className="mb-6">
                  {product.status ? (
                    <Badge variant="success">In Stock ({product.stock} available)</Badge>
                  ) : (
                    <Badge variant="danger">Out of Stock</Badge>
                  )}
                </div>

                {/* Quantity Selector */}
                {product.status && (
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-gray-700 dark:text-gray-300">Quantity:</span>
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 text-gray-900 dark:text-white">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mb-6">
                  <Button 
                    className="flex-1" 
                    size="lg" 
                    disabled={product.stock === 0 || !product.status}
                    variant={product.stock === 0 ? "secondary" : "primary"}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button 
                    variant={isFavorite ? "primary" : "outline"} 
                    size="lg"
                    onClick={handleToggleFavorite}
                    disabled={isLoadingFavorite}
                    className={isFavorite ? "bg-[#FF6B35] border-[#FF6B35]" : ""}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                  </Button>
                </div>

                {/* Shipping Info */}
                <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center gap-3 text-sm">
                    <Truck className="w-5 h-5 text-[#FF6B35]" />
                    <span className="text-gray-600 dark:text-gray-400">Free shipping on orders over TND 100</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-5 h-5 text-[#FF6B35]" />
                    <span className="text-gray-600 dark:text-gray-400">2-year warranty included</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Package className="w-5 h-5 text-[#FF6B35]" />
                    <span className="text-gray-600 dark:text-gray-400">30-day return policy</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Customer Reviews */}
        <Card className="mb-12">
          <CardContent>
            <h2 className="text-2xl text-gray-900 dark:text-white mb-6">Customer Reviews</h2>
            <div className="space-y-6">
              {[
                {
                  id: 1,
                  userName: "John Doe",
                  rating: 5,
                  date: "2024-02-10",
                  comment: "Excellent product! Very satisfied with my purchase. Fast delivery and great quality.",
                  verified: true
                },
                {
                  id: 2,
                  userName: "Sarah Smith",
                  rating: 4,
                  date: "2024-02-08",
                  comment: "Good product but took a bit longer to arrive than expected. Overall satisfied!",
                  verified: true
                },
                {
                  id: 3,
                  userName: "Mike Johnson",
                  rating: 5,
                  date: "2024-02-05",
                  comment: "Perfect! Exactly what I was looking for. Highly recommend!",
                  verified: true
                }
              ].map((review) => (
                <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-900 dark:text-white">{review.userName}</span>
                        {review.verified && (
                          <Badge variant="success" className="text-xs">Verified Purchase</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{review.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
