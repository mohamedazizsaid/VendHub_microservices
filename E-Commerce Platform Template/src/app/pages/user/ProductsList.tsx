import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { Grid, List, Star, Filter, Search } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { formatCurrency } from "../../lib/utils";
import { productService, Product } from "../../api/product.service";
import { useProductInteraction } from "../../hooks/useProductInteraction";

export function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const { recordClick } = useProductInteraction();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await productService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  // Filter products based on selected filters
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter(
        (product) => product.category.toUpperCase() === selectedCategory.toUpperCase()
      );
    }

    // Filter by price range
    if (priceRange !== "all") {
      result = result.filter((product) => {
        const price = product.price;
        switch (priceRange) {
          case "0-200":
            return price <= 200;
          case "200-500":
            return price > 200 && price <= 500;
          case "500-1000":
            return price > 500 && price <= 1000;
          case "1000+":
            return price > 1000;
          default:
            return true;
        }
      });
    }

    // Filter by stock status
    if (stockFilter !== "all") {
      result = result.filter((product) => {
        if (stockFilter === "in-stock") {
          return product.status === true && product.stock! > 0;
        } else if (stockFilter === "out-of-stock") {
          return product.status === false || product.stock === 0;
        }
        return true;
      });
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      default:
        break;
    }

    return result;
  }, [products, selectedCategory, priceRange, sortBy, searchQuery, stockFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, priceRange, sortBy, searchQuery, stockFilter]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 dark:text-white mb-4">All Products</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1F4068] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "primary" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "primary" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 space-y-6">
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg text-gray-900 dark:text-white">Filters</h3>
                  <Button variant="ghost" size="sm">Clear</Button>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="text-sm text-gray-700 dark:text-gray-300 mb-3">Category</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value="all"
                        checked={selectedCategory === "all"}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-4 h-4 text-[#FF6B35] focus:ring-[#FF6B35]"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">All Categories</span>
                    </label>
                    {categories.map((cat) => {
                      const count = products.filter(
                        (p) => p.category.toUpperCase() === cat.toUpperCase()
                      ).length;
                      return (
                        <label key={cat} className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            value={cat}
                            checked={selectedCategory === cat}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-4 h-4 text-[#FF6B35] focus:ring-[#FF6B35]"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {cat} ({count})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="text-sm text-gray-700 dark:text-gray-300 mb-3">Price Range</h4>
                  <div className="space-y-2">
                    {[
                      { label: "All Prices", value: "all" },
                      { label: "Under 200 DT", value: "0-200" },
                      { label: "200 - 500 DT", value: "200-500" },
                      { label: "500 - 1000 DT", value: "500-1000" },
                      { label: "Over 1000 DT", value: "1000+" },
                    ].map((range) => (
                      <label key={range.value} className="flex items-center">
                        <input
                          type="radio"
                          name="price"
                          value={range.value}
                          checked={priceRange === range.value}
                          onChange={(e) => setPriceRange(e.target.value)}
                          className="w-4 h-4 text-[#FF6B35] focus:ring-[#FF6B35]"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Stock Status Filter */}
                <div className="mb-6">
                  <h4 className="text-sm text-gray-700 dark:text-gray-300 mb-3">Stock Status</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="stock"
                        value="all"
                        checked={stockFilter === "all"}
                        onChange={(e) => setStockFilter(e.target.value)}
                        className="w-4 h-4 text-[#FF6B35] focus:ring-[#FF6B35]"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">All Products</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="stock"
                        value="in-stock"
                        checked={stockFilter === "in-stock"}
                        onChange={(e) => setStockFilter(e.target.value)}
                        className="w-4 h-4 text-[#FF6B35] focus:ring-[#FF6B35]"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">In Stock</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="stock"
                        value="out-of-stock"
                        checked={stockFilter === "out-of-stock"}
                        onChange={(e) => setStockFilter(e.target.value)}
                        className="w-4 h-4 text-[#FF6B35] focus:ring-[#FF6B35]"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Out of Stock</span>
                    </label>
                  </div>
                </div>

                {/* Rating Filter - Disabled */}
                {/* <div>
                  <h4 className="text-sm text-gray-700 dark:text-gray-300 mb-3">Rating</h4>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <label key={rating} className="flex items-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[#FF6B35] rounded focus:ring-[#FF6B35]"
                        />
                        <span className="ml-2 flex items-center text-sm text-gray-700 dark:text-gray-300">
                          {[...Array(rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="ml-1">& up</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div> */}
              </CardContent>
            </Card>
          </aside>

          {/* Products Grid/List */}
          <div className="flex-1">
            {/* Sort & Count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600 dark:text-gray-400">{filteredProducts.length} products found</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1F4068] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {/* Products */}
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {paginatedProducts.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`} onClick={() => product.id && recordClick(product.id)}>
                  {viewMode === "grid" ? (
                    <Card hover className="h-full">
                      <div className="relative">
                        <img
                          src={product.imageUrl || "https://via.placeholder.com/300x200"}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-t-xl"
                        />
                        {!product.status && (
                          <div className="absolute inset-0 bg-black/50 rounded-t-xl flex items-center justify-center">
                            <span className="text-white text-lg">Out of Stock</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="pt-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.category}</p>
                        <h3 className="text-gray-900 dark:text-white mb-2 line-clamp-2">{product.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant={product.status ? "success" : "danger"}>
                            {product.status ? "In Stock" : "Out of Stock"}
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-400">({product.stock} units)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl text-[#FF6B35] font-bold">{formatCurrency(product.price)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card hover>
                      <CardContent className="flex gap-4 p-4">
                        <img
                          src={product.imageUrl || "https://via.placeholder.com/150x150"}
                          alt={product.name}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.category}</p>
                          <h3 className="text-lg text-gray-900 dark:text-white mb-2">{product.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl text-[#FF6B35] font-bold">{formatCurrency(product.price)}</span>
                              <Badge variant={product.status ? "success" : "danger"}>
                                {product.status ? "In Stock" : "Out of Stock"}
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">({product.stock} units)</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
