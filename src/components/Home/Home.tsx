import { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Box } from "@mui/material";
import { ScaleLoader } from "react-spinners";
import { useSelector } from "react-redux";
import ProductCard from "../ProductCard/ProductCard";
import "./Home.css";
import { db } from "../../firebase";
import type { RootState } from "../Redux/store";
import Sort from "../Sort/Sort";
import Filter from "../Filter/Filter";
import { useNavigate } from "react-router-dom";

type Product = {
  productId: string;
  name: string;
  price: number;
  images: string[];
  gender: string;
  type: string;
  category: string;
  size: string[];
  manufacturer: string;
  dimensions: string; // Adding dimensions field
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // Sorting
  const [sortBy, setSortBy] = useState<string>("nameAsc");

  // Dimension filter
  const [dimensionFilter, setDimensionFilter] = useState<string[]>([]);

  // Global search from Redux
  const searchQuery = useSelector((state: RootState) => state.search.query);

  // Fetch all products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const q = collection(db, "products");
        const querySnapshot = await getDocs(q);
        const fetchedProducts: Product[] = querySnapshot.docs.map((doc) => ({
          productId: doc.id,
          ...doc.data(),
        })) as Product[];

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Compute unique dimensions
  const availableDimensions = useMemo(() => {
    const uniqueSet = new Set<string>();
    products.forEach((p) => {
      if (p.dimensions) {
        p.dimensions.split(",").forEach((dimension) => {
          uniqueSet.add(dimension.trim());
        });
      }
    });
    return Array.from(uniqueSet);
  }, [products]);

  // Filter products by search query and dimensions
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesDimension =
        dimensionFilter.length === 0 ||
        product.dimensions
          .split(",")
          .some((dimension) => dimensionFilter.includes(dimension.trim()));

      return matchesSearch && matchesDimension;
    });
  }, [products, searchQuery, dimensionFilter]);

  // Sort the filtered products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case "nameDesc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "priceAsc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      default: // "nameAsc"
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return sorted;
  }, [filteredProducts, sortBy]);

  // Handlers
  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handleFilterChange = (filters: { dimensions: string[] }) => {
    setDimensionFilter(filters.dimensions);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/proizvod/${productId}`);
  };

  return (
    <div className="home-page-container">
      <h2 className="home-page-title">Početna</h2>
      {loading ? (
        <div className="loader">
          <ScaleLoader color="#e7cfb4" />
        </div>
      ) : (
        <div className="home-page-wrapper">
          {/* Sidebar with Filter */}
          <div className="sidebar">
            <div className="sort-filter-wrapper">
              <Sort onSortChange={handleSortChange} />
              <Filter
                availableDimensions={availableDimensions}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="main-content">
            {sortedProducts.length === 0 ? (
              <div className="empty-message">Nema proizvoda po datom kriterijumu</div>
            ) : (
              <Box
                className="products-container"
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 3,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {sortedProducts.map((product) => (
                  <Box key={product.productId}>
                    <ProductCard
                      product={product}
                      onClick={handleProductClick}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
