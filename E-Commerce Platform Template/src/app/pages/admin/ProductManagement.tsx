import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { productService, Product } from "../../api/product.service";
import { getUserFromToken } from "../../api/auth.service";
import { formatCurrency } from "../../lib/utils";

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [categories, setCategories] = useState<string[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [stock, setStock] = useState<number>(0);
  const [tags, setTags] = useState<string[]>([]);

  // Filter products based on search and category
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
    if (filterCategory !== "all") {
      result = result.filter(
        (product) => product.category.toUpperCase() === filterCategory.toUpperCase()
      );
    }

    return result;
  }, [products, searchQuery, filterCategory]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory]);

  useEffect(() => {
    // Vérifier le rôle admin
    const user = getUserFromToken();
    if (!user) {
      window.location.href = "/login";
      return;
    }
    const roles: string[] = user.realm_access?.roles || user.roles || [];
    setIsAdmin(
      roles.some(
        (r: string) =>
          r.toUpperCase() === "ADMIN" || r.toUpperCase() === "ROLE_ADMIN"
      )
    );
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await productService.getAllCategories();
      setCategories(data);
      setCategory(data[0] || "");
    } catch (err) {
      console.error("Erreur chargement catégories:", err);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error("Erreur chargement produits:", err);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory(categories[0] || "");
    setImageFile(null);
    setStock(0);
    setTags([]);
    setEditingId(null);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id!);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setCategory(product.category);
    setStock(product.stock || 0);
    setTags(product.tags || []);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openViewModal = (product: Product) => {
    setViewingProduct(product);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Pour la création, l'image est obligatoire
    if (!editingId && !imageFile) {
      alert("Veuillez sélectionner une image");
      return;
    }

    setIsLoadingSubmit(true);
    try {
      if (editingId) {
        // ===== MODE ÉDITION =====
        // Récupérer le produit original pour garder les anciennes valeurs
        const originalProduct = products.find(p => p.id === editingId);
        
        const updatedProduct: Product = {
          id: editingId,
          name,
          description,
          price: parseFloat(price),
          category,
          stock,
          tags,
          imageUrl: originalProduct?.imageUrl || "",
          createdAt: originalProduct?.createdAt || ""
        };

        await productService.updateProduct(editingId, updatedProduct);
      } else {
        // ===== MODE CRÉATION =====
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("category", category);
        formData.append("stock", stock.toString());
        formData.append("tags", JSON.stringify(tags));
        formData.append("file", imageFile!);

        await productService.createProduct(formData);
      
      }

      setIsModalOpen(false);
      resetForm();
      await loadProducts();
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    try {
      await productService.deleteProduct(deleteConfirmId);
      setDeleteConfirmId(null);
      await loadProducts();
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E] p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-white mb-2">Product Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your product catalog</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      {/* ───────── Modal Add/Edit Product ───────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white dark:bg-[#1F4068] border-gray-200 dark:border-gray-700 max-w-2xl h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gray-900 dark:text-white">
              {editingId ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
                required
                disabled={isLoadingSubmit}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#16213E] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35] disabled:opacity-50"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description"
                required
                disabled={isLoadingSubmit}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#16213E] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35] resize-none disabled:opacity-50"
              />
            </div>

            {/* Image file */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Image {!editingId && "*"}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                required={!editingId}
                disabled={isLoadingSubmit}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#16213E] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-[#FF6B35] file:text-white file:cursor-pointer disabled:opacity-50"
              />
              {imageFile && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {imageFile.name}
                </p>
              )}
              {editingId && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  💡 Laisse vide pour garder l'image actuelle
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (DT) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  disabled={isLoadingSubmit}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#16213E] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35] disabled:opacity-50"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isLoadingSubmit}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#16213E] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35] disabled:opacity-50"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0) + cat.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tags.includes(cat)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTags([...tags, cat]);
                          } else {
                            setTags(tags.filter(t => t !== cat));
                          }
                        }}
                        disabled={isLoadingSubmit}
                        className="w-4 h-4 rounded border-gray-300 text-[#FF6B35] focus:ring-[#FF6B35]"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {cat.charAt(0) + cat.slice(1).toLowerCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm bg-[#FF6B35] text-white"
                    >
                      <span>{tag.charAt(0) + tag.slice(1).toLowerCase()}</span>
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter(t => t !== tag))}
                        className="ml-1 hover:opacity-70"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              {/* Stock */}
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => {
                  const val = e.target.value;
                  setStock(val === "" ? 0 : parseInt(val, 10));
                }}
                placeholder="0"
                min="0"
                required
                disabled={isLoadingSubmit}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#16213E] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35] disabled:opacity-50"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              💡 Le statut du produit est calculé automatiquement en fonction du stock
            </p>

            <DialogFooter className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                disabled={isLoadingSubmit}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoadingSubmit}
                className="bg-[#FF6B35] hover:bg-[#E55A24] text-white disabled:opacity-50"
              >
                {editingId ? (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    {isLoadingSubmit ? "Updating..." : "Update Product"}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    {isLoadingSubmit ? "Saving..." : "Add Product"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ───────── Confirmation Delete Dialog ───────── */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent className="bg-white dark:bg-[#1F4068] border-gray-200 dark:border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-900 dark:text-white">
              Delete Product?
            </DialogTitle>
          </DialogHeader>
          
          <div>
            <p className="text-gray-600 dark:text-gray-300">
              This action cannot be undone. Are you sure you want to delete this product?
            </p>
          </div>

          <DialogFooter className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ───────── Product Details View Modal ───────── */}
      <Dialog open={!!viewingProduct} onOpenChange={(open) => { if (!open) setViewingProduct(null); }}>
        <DialogContent className="bg-white dark:bg-[#1F4068] border-gray-200 dark:border-gray-700 w-[700px] max-h-[600px] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="text-xl text-gray-900 dark:text-white font-semibold">
              Product Details
            </DialogTitle>
          </DialogHeader>
          
          {viewingProduct && (
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {/* Image */}
                <div className="flex justify-center">
                  <div className="w-110 h-70 bg-gray-100 dark:bg-[#16213E] rounded-xl overflow-hidden">
                    <img
                      src={viewingProduct.imageUrl || "https://via.placeholder.com/300x200"}
                      alt={viewingProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Product Name */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Product Name</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{viewingProduct.name}</p>
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{viewingProduct.description}</p>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Category</p>
                    <Badge variant="default" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {viewingProduct.category.charAt(0) + viewingProduct.category.slice(1).toLowerCase()}
                    </Badge>
                  </div>

                  {/* Price */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Price</p>
                    <p className="text-lg font-bold text-[#FF6B35]">{formatCurrency(viewingProduct.price)}</p>
                  </div>
                </div>

                {/* Stock & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Stock</p>
                    <div>
                      <Badge variant={viewingProduct.stock! > 0 ? "success" : "danger"} className="text-xs">
                        {viewingProduct.stock || 0} Units
                      </Badge>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Available</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Status</p>
                    <Badge variant={viewingProduct.status ? "success" : "danger"}>
                      {viewingProduct.status ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                </div>

                {/* Created Date */}
                {viewingProduct.createdAt && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Added</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(viewingProduct.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#16213E] flex gap-3">
            <Button
              type="button"
              onClick={() => setViewingProduct(null)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium transition-colors"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ───────── Filters ───────── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1F4068] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0) + cat.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {/* ───────── Table ───────── */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#1F4068] border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase">Price</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-500 dark:text-gray-400 uppercase">Stock</th>
                  <th className="px-6 py-3 text-center text-xs text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400">No products found</p>
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-[#1F4068]">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={product.imageUrl || "https://via.placeholder.com/48"}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover mr-3"
                        />
                        <div>
                          <p className="text-gray-900 dark:text-white">{product.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default">
                        {product.category.charAt(0) + product.category.slice(1).toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={product.stock! > 0 ? "success" : "danger"}>
                        {product.stock || 0} {product.stock === 1 ? "Unit" : "Units"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={product.status ? "success" : "danger"}>
                        {product.status ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openViewModal(product)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEditModal(product)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                              <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(product.id!)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 p-6 border-t border-gray-200 dark:border-gray-700">
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
        </CardContent>
      </Card>
    </div>
  );
}
