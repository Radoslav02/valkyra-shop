import React, { useEffect, useState, useMemo, useCallback } from "react";

import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import "./AdminPanel.css";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AddItemModal from "../Modals/NewItemModal";
import DeleteIcon from "@mui/icons-material/Delete";
import { ScaleLoader } from "react-spinners";
import EditItemModal from "../Modals/EditItemModal";

import { useSelector } from "react-redux";

import CheckIcon from "@mui/icons-material/Check";
import { Button, Dialog, DialogContent, DialogActions } from "@mui/material";
import type { RootState } from "../Redux/store";
import { db, storage } from "../../firebase";
import Sort from "../Sort/Sort";
import Filter from "../Filter/Filter";

type Product = {
 productId: string;
  name: string;
  category: string;
  subcategory: string;
  manufacturer: string;
  price: number;
  images: string[];
  description: string;
  discountPrice?: number;
  onDiscount?: boolean;
  dimensions?: string;
  scriptSelection?: boolean;
  titleSelection?: boolean;
  relatedProducts?: {
    productId: string;
    name: string;
    image: string;
  }[];
};

type DeleteTarget = {
  productId: string;
  images: string[];
} | null;

export default function AdminPanel() {
  // -----------------------------
  // State
  // -----------------------------
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshProducts, setRefreshProducts] = useState(false);
  const [dimensionFilter, setDimensionFilter] = useState<string[]>([]);
  const [newItemClicked, setNewItemClicked] = useState(false);
  const [editItemClicked, setEditItemClicked] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Confirmation modal for deletion
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  // For selecting which image index is "main" or "selected"
  const [selectedImageIndex, setSelectedImageIndex] = useState<number[]>([]);

  // Filter & Sort states
  
  const [sortBy, setSortBy] = useState("nameAsc");

  // Search query from Redux
  const searchQuery = useSelector((state: RootState) => state.search.query);

  // -----------------------------
  // 1) Fetch Products (on mount + refresh)
  // -----------------------------
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const productsCollection = collection(db, "products");
      const productSnapshot = await getDocs(productsCollection);
      const productList = productSnapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Product, "productId">;
        return { productId: doc.id, ...data };
      });
      setProducts(productList);
      setSelectedImageIndex(Array(productList.length).fill(0));
    } catch (error) {
      console.error("Error fetching products: ", error);
    } finally {
      setLoading(false);
      setRefreshProducts(false); // Prevent infinite loop
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Re-fetch if refreshProducts is toggled
  useEffect(() => {
    if (refreshProducts) {
      fetchProducts();
    }
  }, [refreshProducts, fetchProducts]);

  // -----------------------------
  // 2) Adding a Product
  // -----------------------------
  const handleNewItemClicked = useCallback(() => {
    setNewItemClicked(true);
    // We'll do the actual fetch AFTER product is saved
    setRefreshProducts(false);
  }, []);

  // Optionally insert new product in local state immediately:
  const handleAddProductLocally = useCallback((newProduct: Product) => {
    // Insert at the front so user sees it instantly
    setProducts((prev) => [newProduct, ...prev]);
  }, []);

  // Called when AddItemModal closes
  const handleCloseAddItemModal = useCallback(() => {
    setNewItemClicked(false);
    // Now we trigger a fresh re-fetch from Firestore to confirm
    setRefreshProducts(true);
  }, []);

  // -----------------------------
  // 3) Editing a Product
  // -----------------------------
  const handleEditItemClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setEditItemClicked(true);
    setRefreshProducts(false);
  }, []);

  const handleCloseEditItemModal = useCallback(() => {
    setEditItemClicked(false);
    setSelectedProduct(null);
    setRefreshProducts(true);
  }, []);

  // -----------------------------
  // 4) Image Selection / Reordering
  // -----------------------------
  const handleImageSelect = useCallback(
    async (productIndex: number, imageIndex: number) => {
      const product = products[productIndex];
      if (!product) return;

      // Move selected image to the front locally
      setSelectedImageIndex((prev) => {
        const updated = [...prev];
        updated[productIndex] = imageIndex;
        return updated;
      });

      const imagesCopy = [...product.images];
      const chosen = imagesCopy.splice(imageIndex, 1)[0];
      imagesCopy.unshift(chosen);

      // Update in Firestore
      try {
        const docRef = doc(db, "products", product.productId);
        await updateDoc(docRef, { images: imagesCopy });
      } catch (err) {
        console.error("Error updating images:", err);
      }
    },
    [products]
  );

  const availableDimensions = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.dimensions) {
        p.dimensions.split(",").forEach((d) => {
          set.add(d.trim());
        });
      }
    });
    return Array.from(set);
  }, [products]);

  const handleDimensionFilterChange = useCallback(
    (filters: { dimensions: string[] }) => {
      setDimensionFilter(filters.dimensions);
    },
    []
  );

  // -----------------------------
  // 5) Deleting a Product
  // -----------------------------
  const openDeleteModal = useCallback(
    (
      event: React.MouseEvent<SVGSVGElement>,
      productId: string,
      images: string[]
    ) => {
      event.stopPropagation();
      setDeleteTarget({ productId, images });
      setDeleteModalOpen(true);
      setRefreshProducts(false);
    },
    []
  );

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  }, []);

  const handleDeleteConfirmed = useCallback(async () => {
    if (!deleteTarget) return;
    const { productId, images } = deleteTarget;
    try {
      // Delete doc from Firestore
      const productDocRef = doc(db, "products", productId);
      await deleteDoc(productDocRef);

      // Remove from local state
      setProducts((prev) => prev.filter((p) => p.productId !== productId));

      // Delete from storage
      const deletePromises = images.map((img) => {
        const imageRef = ref(storage, img);
        return deleteObject(imageRef);
      });
      await Promise.all(deletePromises);
    } catch (err) {
      console.error("Error deleting product:", err);
    } finally {
      closeDeleteModal();
      setRefreshProducts(true);
    }
  }, [deleteTarget, closeDeleteModal]);

  // -----------------------------
  // 6) Format Price Utility
  // -----------------------------
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat("sr-RS", {
      style: "currency",
      currency: "RSD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }, []);

  // -----------------------------
  // 7) Derive Manufacturer List + Filter/Sort
  // -----------------------------
  // A) Compute all unique manufacturers from products

  // B) Filter
  const filteredProducts = useMemo(() => {
    let data = products;

    // Filter by dimensions
    if (dimensionFilter.length > 0) {
      data = data.filter((product) =>
        product.dimensions
          ?.split(",")
          .map((d) => d.trim())
          .some((d) => dimensionFilter.includes(d))
      );
    }
    // Search by name
    if (searchQuery.trim() !== "") {
      data = data.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Manufacturer filter
 
    

    return data;
  }, [products, searchQuery, dimensionFilter]);



  // C) Sort
  const sortedData = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case "priceAsc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "nameDesc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default: // 'nameAsc'
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return sorted;
  }, [filteredProducts, sortBy]);

  // -----------------------------
  // 8) Handlers for Sort & Filter
  // -----------------------------

  const handleSortChange = (sortOption: string) => {
    setSortBy(sortOption);
  };


  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="admin-panel-container">
      {/* Add / Edit Modals */}
      {newItemClicked && (
        <AddItemModal
          onClose={handleCloseAddItemModal}
          onProductAdded={handleAddProductLocally}
        />
      )}
      {editItemClicked && selectedProduct && (
        <EditItemModal
          product={selectedProduct}
          onClose={handleCloseEditItemModal}
        />
      )}

      {/* Confirmation Dialog for Delete */}
      <Dialog open={deleteModalOpen} onClose={closeDeleteModal}>
        <DialogContent>
          Da li ste sigurni da želite da obrišete ovaj proizvod?
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteModal} color="inherit">
            Odustani
          </Button>
          <Button onClick={handleDeleteConfirmed} color="error">
            Obriši
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sidebar (Sort + Filter) */}
      <div className="admin-sidebar">
        <div className="admin-sort-filter-wrapper">
          <Sort onSortChange={handleSortChange} />
          <Filter
            availableDimensions={availableDimensions}
            onFilterChange={handleDimensionFilterChange}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main-content">
        <div className="add-product-button" onClick={handleNewItemClicked}>
          <AddCircleIcon sx={{ fontSize: 40 }} />
          <span>Dodaj Proizvod</span>
        </div>

        {loading ? (
          <div className="loader">
            <ScaleLoader color="#e7cfb4" />
          </div>
        ) : sortedData.length === 0 ? (
          <p>Nema proizvoda za prikaz.</p>
        ) : (
          <div className="table-container">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Naziv</th>
                  <th>Kategorija</th>
                  <th>Podkategorija</th>
                  <th>Cena</th>
                  <th>Na popustu</th>
                  <th>Slike</th>
                  <th>Akcija</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((product, index) => (
                  <tr
                    key={product.productId}
                    className="product-row"
                    onClick={() => handleEditItemClick(product)}
                  >
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.subcategory}</td>
                    <td>{formatPrice(product.price)}</td>
                    <td>
                      {product.onDiscount && (
                        <CheckIcon style={{ color: "green" }} />
                      )}
                    </td>
                    <td
                      onClick={(e) => {
                        // Prevent row click from opening Edit modal
                        e.stopPropagation();
                      }}
                    >
                      <div className="images-wrapper">
                        <div className="thumbnails-row">
                          {product.images.map((img, imgIndex) => (
                            <img
                              key={imgIndex}
                              src={img}
                              alt={`image-${imgIndex}`}
                              className={`thumbnail ${
                                imgIndex === 0 ? "main-image" : ""
                              } ${
                                selectedImageIndex[index] === imgIndex
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() => handleImageSelect(index, imgIndex)}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <DeleteIcon
                        className="delete-icon"
                        onClick={(event) =>
                          openDeleteModal(
                            event,
                            product.productId,
                            product.images
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
