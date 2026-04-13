import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Heart, ArrowRight, Trash2, Grid } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { formatCurrency } from "../../lib/utils";
import { productService, Product } from "../../api/product.service";
import { toast } from "sonner";

export function Favorites() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<number | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await productService.getFavorites();
      setFavorites(data || []);
    } catch (err) {
      console.error("Error loading favorites:", err);
      toast.error("Error loading favorites");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId: number) => {
    setIsRemoving(productId);
    try {
      await productService.removeFromFavorites(productId);
      setFavorites((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Product removed from favorites");
      // Notifier les autres composants que les favoris ont changé
      window.dispatchEvent(new Event("favorites-changed"));
    } catch (err: any) {
      toast.error(err.message || "Error deleting product");
    } finally {
      setIsRemoving(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#16213E] flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading favorites...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-[#FF6B35] fill-current" />
            <h1 className="text-3xl text-gray-900 dark:text-white">My Favorites</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {favorites.length} product{favorites.length !== 1 ? "s" : ""} in your wishlist
          </p>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl text-gray-900 dark:text-white mb-2">No Favorites</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You have no products in your wishlist. Explore our products!
              </p>
              <Link to="/products">
                <Button>
                  View Products
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {favorites.map((product) => (
                <div key={product.id} className="flex flex-col h-full">
                  <Card hover className="h-full flex flex-col">
                    {/* Product Image */}
                    <Link to={`/products/${product.id}`} className="flex-1">
                      <div className="relative">
                        <img
                          src={product.imageUrl || "https://via.placeholder.com/300x200"}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-t-xl hover:opacity-90 transition-opacity"
                        />
                        {!product.status && (
                          <div className="absolute inset-0 bg-black/50 rounded-t-xl flex items-center justify-center">
                            <span className="text-white text-lg">Out of Stock</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <CardContent className="pt-4 flex-1 flex flex-col">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.category}</p>
                      <Link to={`/products/${product.id}`}>
                        <h3 className="text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-[#FF6B35] transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      
                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Stock Status */}
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant={product.status ? "success" : "danger"}>
                          {product.status ? "In Stock" : "Out of Stock"}
                        </Badge>
                        {product.status && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({product.stock} units)
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="mb-4 mt-auto">
                        <span className="text-2xl text-[#FF6B35] font-bold">
                          {formatCurrency(product.price)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-col">
                        <Link to={`/products/${product.id}`} className="w-full">
                          <Button className="w-full" size="sm" variant="primary">
                            View Details
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleRemoveFavorite(product.id!)}
                          disabled={isRemoving === product.id}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Continue Shopping Button */}
            <div className="flex justify-center">
              <Link to="/products">
                <Button variant="outline" size="lg">
                  Continue Shopping
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
