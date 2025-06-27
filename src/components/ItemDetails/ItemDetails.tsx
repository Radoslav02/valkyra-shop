import { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { addToCart } from "../Redux/cartSlice";
import { toast } from "react-toastify";
import "./ItemDetails.css";
import { db } from "../../firebase";

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

export default function ItemDetails() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedDimension, setSelectedDimension] = useState<string>("");
  const [selectedScript, setSelectedScript] = useState<string>("");
  const [customTitle, setCustomTitle] = useState<string>("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        if (!productId) throw new Error("Product ID is undefined");
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({
            productId: docSnap.id,
            name: data.name,
            price: data.price,
            images: data.images || [],
            description: data.description || "",
            category: data.category || "",
            subcategory: data.subcategory || "",
            manufacturer: data.manufacturer || "",
            onDiscount: data.onDiscount || false,
            discountPrice: data.discountPrice || null,
            dimensions: data.dimensions || "",
            scriptSelection: data.scriptSelection || false,
            titleSelection: data.titleSelection || false,
            relatedProducts: data.relatedProducts || [],
          });
          setSelectedImage(data.images?.[0] || null);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching product details: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("sr-RS", {
      style: "currency",
      currency: "RSD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setQuantity(val > 0 ? val : 1);
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.dimensions && !selectedDimension) {
      toast.error("Molimo vas da odaberete dimenziju.");
      return;
    }

    if (product.titleSelection && !customTitle.trim()) {
      toast.error("Molimo vas da unesete natpis.");
      return;
    }

    if (product.scriptSelection && !selectedScript) {
      toast.error("Molimo vas da izaberete pismo.");
      return;
    }
    if (!product) return;
    dispatch(
      addToCart({
        productId: product.productId,
        name: product.name,
        price:
          product.onDiscount && product.discountPrice
            ? product.discountPrice
            : product.price,
        image: selectedImage || "",
        quantity,
        selectedDimension: product.dimensions ? selectedDimension : undefined,
        selectedScript: product.scriptSelection ? selectedScript : undefined,
        customTitle: product.titleSelection ? customTitle : undefined,
      })
    );

    toast.success("Proizvod je uspešno dodat u korpu!");
    setTimeout(() => {
      navigate("/početna");
    }, 1500);
  };

  return (
    <div className="item-details-container">
      {loading ? (
        <div className="loader">Loading...</div>
      ) : product ? (
        <div className="item-details-wrapper">
          {/* Left: Product Images */}
          <div className="product-images">
            <div className="main-image-container">
              <img
                src={selectedImage || "placeholder.jpg"}
                alt={product.name}
                className="main-image"
              />
            </div>
            <div className="thumbnail-strip">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  className={`thumbnail ${
                    selectedImage === img ? "active" : ""
                  }`}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="product-details">
            <h1 className="product-title">{product.name}</h1>
            {product.onDiscount && product.discountPrice ? (
              <>
                <p className="product-price">
                  {formatPrice(product.discountPrice)}
                </p>
                <p className="old-price">{formatPrice(product.price)}</p>
                <p className="discount-text">
                  Ušteda: {formatPrice(product.price - product.discountPrice)}
                </p>
              </>
            ) : (
              <p className="product-price">{formatPrice(product.price)}</p>
            )}

            {product.description && (
              <p className="product-desc">{product.description}</p>
            )}

            <div className="quantity-actions">
              <label>Količina:</label>
              <div className="quantity-input-wrapper">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  –
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  title="Količina proizvoda"
                  placeholder="Unesite količinu"
                />
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* DIMENZIJE DROPDOWN */}
            {product.dimensions && (
              <div className="details-option-group">
                <label>Odaberite dimenziju:</label>
                <select
                  value={selectedDimension}
                  onChange={(e) => setSelectedDimension(e.target.value)}
                  required
                >
                  <option value="">-- Odaberite --</option>
                  {product.dimensions.split(",").map((dim, i) => (
                    <option key={i} value={dim.trim()}>
                      {dim.trim()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* SCRIPT SELECTION */}
            {product.scriptSelection && (
              <div className="details-option-group">
                <label>Izaberite pismo:</label>
                <select
                  value={selectedScript}
                  onChange={(e) => setSelectedScript(e.target.value)}
                  required
                >
                  <option value="">-- Izaberite --</option>
                  <option value="latinica">Latinica</option>
                  <option value="ćirilica">Ćirilica</option>
                </select>
              </div>
            )}

            {/* CUSTOM TITLE INPUT */}
            {product.titleSelection && (
              <div className="details-option-group">
                <label>Unesite natpis za proizvod:</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Unesite natpis"
                />
              </div>
            )}

            {product.relatedProducts && product.relatedProducts.length > 0 && (
              <div className="related-products-section">
                <label>Boje:</label>
                <div className="related-products-list">
                  {product.relatedProducts.map((rp) => (
                    <img
                      key={rp.productId}
                      src={rp.image}
                      alt={rp.name}
                      className="related-product-thumbnail"
                      onClick={() => navigate(`/proizvod/${rp.productId}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            <button className="add-to-cart-button" onClick={handleAddToCart}>
              Dodaj u korpu
            </button>
          </div>
        </div>
      ) : (
        <p>Proizvod nije pronađen.</p>
      )}
    </div>
  );
}
