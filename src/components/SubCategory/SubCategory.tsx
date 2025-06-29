import "./SubCategoryStyle.css";
import { useEffect, useState, useMemo } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { ScaleLoader } from "react-spinners";
import { useSelector } from "react-redux";

import ProductCard from "../ProductCard/ProductCard";
import type { RootState } from "../Redux/store";
import { db } from "../../firebase";
import Sort from "../Sort/Sort";
import Filter from "../Filter/Filter"; 

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
  dimensions?: string; 
};

export default function SubCategoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("nameAsc");

  const [dimensionFilter, setDimensionFilter] = useState<string[]>([]);

  const navigate = useNavigate();
  const { subCategory } = useParams<{ subCategory: string }>();

  const searchQuery = useSelector((state: RootState) => state.search.query);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!subCategory) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "products"),
          where("subcategory", "==", subCategory)
        );
        const querySnapshot = await getDocs(q);
        const fetchedProducts: Product[] = querySnapshot.docs.map((doc) => ({
          productId: doc.id,
          ...doc.data(),
        })) as Product[];

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products for subcategory", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [subCategory]);

  // Compute unique dimensions from the fetched products
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

  // Filter products by search query and selected dimensions
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesDimensions = dimensionFilter.length
        ? product.dimensions
            ?.split(",")
            .map((d) => d.trim())
            .some((d) => dimensionFilter.includes(d))
        : true;

      return matchesSearch && matchesDimensions;
    });
  }, [products, searchQuery, dimensionFilter]);

  // Sort the filtered products
  const sortedProducts = useMemo(() => {
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

  const handleProductClick = (productId: string) => {
    navigate(`/proizvod/${productId}`);
  };

  return (
    <div className="sub-category-page-container">
      <h2 className="sub-category-title">{subCategory}</h2>
      {loading ? (
        <div className="loader">
          <ScaleLoader color="#e7cfb4" />
        </div>
      ) : (
        <div className="sub-page-wrapper">
          {/* Sidebar: Sort on top, Filter for dimensions below */}
          <div className="sidebar">
            <div className="sort-filter-wrapper">
              <Sort onSortChange={setSortBy} />
              <Filter
                availableDimensions={availableDimensions}
                onFilterChange={(filters) => setDimensionFilter(filters.dimensions)}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="sub-main-content">
            {sortedProducts.length === 0 ? (
              <div className="empty-message">
                Nema proizvoda po datom kriterijumu
              </div>
            ) : (
              <Box
                className="products-container"
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 3,
                  justifyContent: "center",
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
