import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { collection, addDoc, getDocs } from "firebase/firestore";

interface Product {
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
  dateSelection?: boolean;
  relatedProducts?: {
    productId: string;
    name: string;
    image: string;
  }[];
}

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./NewItemModal.css";
import type { RootState } from "../Redux/store";
import { db, storage } from "../../firebase";
import {
  Autocomplete,
  Avatar,
  Checkbox,
  FormControlLabel,
  TextField,
} from "@mui/material";

// Define the categories and their corresponding subcategories
const categoriesData = [
  {
    label: "Venčanja, krštenja, rođendani",
    subcategories: [
      "Kutije za koverte i novac",
      "Table dobrodošlice i spisak gostiju",
      "Table za obeležavanje stolova",
      "Toperi za tortu",
    ],
  },
  {
    label: "Reklamne table i pločice",
    subcategories: [
      "Reklamne table za firmu",
      "Moderni kućni brojevi",
      "Pločice za vrata i obeležavanje prostorija",
      "UV štampa reklamnog materijala",
    ],
  },
  {
    label: "Štampa",
    subcategories: [
      "Štampa i sečenje nalepnica",
      "Nalepnice za dečije sobe",
      "3D nalepnice - stikeri",
      "Nalepnice za automobile",
    ],
  },
];

const NewItemModal: React.FC<{
  onClose: () => void;
  onProductAdded: (newProduct: Product) => void;
}> = ({ onClose }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");

  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [dimensions, setDimensions] = useState("");
  const [dimensionsError, setDimensionsError] = useState("");
  const [scriptSelection, setScriptSelection] = useState(false);
  const [titleSelection, setTitleSelection] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [dateSelection, setDateSelection] = useState(false);

  //Disables scrolling on the body when the modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // State to manage subcategory dropdown options based on selected category
  const [subcategoriesOptions, setSubcategoriesOptions] = useState<string[]>(
    []
  );

  const validateDimensions = (input: string): boolean => {
    if (!input.trim()) {
      setDimensionsError("");
      return true;
    }

    const values = input.split(",").map((val) => val.trim());
    const isValid = values.every((val) => val.length > 0);

    if (!isValid) {
      setDimensionsError(
        "Dimenzije moraju biti odvojene zarezom bez praznih vrednosti."
      );
      return false;
    }

    setDimensionsError("");
    return true;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const fetched = snapshot.docs.map((doc) => ({
          productId: doc.id,
          ...(doc.data() as Omit<Product, "productId">),
        }));
        setAllProducts(fetched);
      } catch (error) {
        console.error("Greška prilikom dohvaćanja proizvoda:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const selectedCategory = categoriesData.find(
      (cat) => cat.label === category
    );
    if (selectedCategory) {
      setSubcategoriesOptions(selectedCategory.subcategories);
    } else {
      setSubcategoriesOptions([]);
      setSubcategory("");
    }
  }, [category]);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (images.length + selectedFiles.length > 5) {
        toast.error("Maksimalan broj slika je 5.");
        return;
      }
      setImages((prev) => [...prev, ...selectedFiles]);
      const previews = selectedFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    const imageUrls: string[] = [];
    for (const image of images) {
      const uniqueName = `${Date.now()}-${image.name}`;
      const imageRef = ref(storage, `images/${uniqueName}`);
      const uploadTask = uploadBytesResumable(imageRef, image);
      try {
        const downloadURL = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              reject(error);
            },
            async () => {
              try {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
              } catch (err) {
                reject(err);
              }
            }
          );
        });
        imageUrls.push(downloadURL);
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error(`Error uploading image: ${image.name}`);
      }
    }
    return imageUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !subcategory) {
      toast.error("Molimo vas izaberite kategoriju i podkategoriju.");
      return;
    }
    if (!validateDimensions(dimensions)) {
      toast.error("Proverite unos dimenzija.");
      return;
    }
    setLoading(true);
    try {
      const imageUrls = await uploadImages();
      await addDoc(collection(db, "products"), {
        name,
        category,
        subcategory,
        price: parseFloat(price),
        description,
        images: imageUrls,
        onDiscount: false,
        discountPrice: null,
        dimensions,
        scriptSelection,
        titleSelection,
        dateSelection,
        relatedProducts: relatedProducts.map((prod) => ({
          productId: prod.productId,
          name: prod.name,
          image: prod.images?.[0] ?? "",
        })),
      });
      toast.success("Proizvod je uspešno dodat!");
      setName("");
      setCategory("");
      setSubcategory("");
      setPrice("");
      setDescription("");
      setImages([]);
      setImagePreviews([]);
      onClose();
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(
        "Došlo je do greške prilikom dodavanja proizvoda. Pokušajte ponovo."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.isAdmin) {
    return <p>Nemaš dozvolu da dodaješ proizvode.</p>;
  }

  return (
    <div className="new-item-modal-container" onClick={onClose}>
      <form
        className="new-item-form"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Dodavanje proizvoda</h2>
        <div className="new-item-input-wrapper">
          <label>Naziv:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            title="Unesite naziv proizvoda"
            placeholder="Unesite naziv proizvoda"
          />
        </div>
        <div className="new-item-input-wrapper">
          <label>Kategorija:</label>
          <select
            aria-label="Izaberite kategoriju proizvoda"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Izaberite kategoriju</option>
            {categoriesData.map((cat, index) => (
              <option key={index} value={cat.label}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div className="new-item-input-wrapper">
          <label>Podkategorija:</label>
          <select
            aria-label="Izaberite podkategoriju proizvoda"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            required
            disabled={!category}
          >
            <option value="">Izaberite podkategoriju</option>
            {subcategoriesOptions.map((sub, index) => (
              <option key={index} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
        {subcategory && (
          <div className="new-item-input-wrapper">
            <label>Povezani proizvodi:</label>
            <Autocomplete
              multiple
              options={allProducts.filter(
                (prod) => prod.subcategory === subcategory && prod.name !== name
              )}
              getOptionLabel={(option) => option.name}
              value={relatedProducts}
              onChange={(_, newValue) => setRelatedProducts(newValue)}
              renderOption={(props, option, { selected }) => {
                const { key, ...rest } = props;
                return (
                  <li
                    key={option.productId}
                    {...rest}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Checkbox style={{ padding: 0 }} checked={selected} />
                    <Avatar
                      alt={option.name}
                      src={option.images?.[0]}
                      sx={{ width: 40, height: 40 }}
                    />
                    {option.name}
                  </li>
                );
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </div>
        )}

        <div className="new-item-input-wrapper">
          <FormControlLabel
            control={
              <Checkbox
                checked={scriptSelection}
                onChange={(e) => setScriptSelection(e.target.checked)}
                color="primary"
              />
            }
            label="Izbor pisma (ćirilica/latinica)"
          />
        </div>
        <div className="new-item-input-wrapper">
          <FormControlLabel
            control={
              <Checkbox
                checked={titleSelection}
                onChange={(e) => setTitleSelection(e.target.checked)}
                color="primary"
              />
            }
            label="Unos natpisa na proizvodu"
          />
        </div>
         <div className="new-item-input-wrapper">
          <FormControlLabel
            control={
              <Checkbox
                checked={dateSelection}
                onChange={(e) => setDateSelection(e.target.checked)}
                color="primary"
              />
            }
            label="Unos datuma na proizvodu"
          />
        </div>
        <div className="new-item-input-wrapper">
          <label>Dimenzije (opciono):</label>
          <input
            type="text"
            value={dimensions}
            onChange={(e) => {
              setDimensions(e.target.value);
              validateDimensions(e.target.value);
            }}
            placeholder="npr: 15x20 (odovjene zarezima)"
            title="Unesite dimenzije"
          />
          {dimensionsError && <p style={{ color: "red" }}>{dimensionsError}</p>}
        </div>
        <div className="new-item-input-wrapper">
          <label>Cena:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            title="Unesite cenu proizvoda"
            placeholder="Unesite cenu"
          />
        </div>
        <div className="new-item-input-wrapper">
          <label>Opis:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            title="Opis proizvoda"
            placeholder="Unesite opis proizvoda"
          />
        </div>
        <div className="new-item-input-wrapper">
          <label>Slike:</label>
          <input
            type="file"
            className="image-input"
            multiple
            onChange={handleImagesChange}
            required
            title="Izaberite slike za proizvod"
            placeholder="Izaberite slike za proizvod"
            aria-label="Izaberite slike za proizvod"
          />
          <div className="image-previews">
            {imagePreviews.map((preview, index) => (
              <div className="image-preview-wrapper" key={index}>
                <img
                  src={preview}
                  alt={`preview ${index}`}
                  className="image-preview"
                />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => handleRemoveImage(index)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="new-item-button-wrapper">
          <button className="add-button" type="submit" disabled={loading}>
            {loading
              ? `Dodavanje ${Math.round(uploadProgress)}%`
              : "Dodaj proizvod"}
          </button>
          <button className="close-button" type="button" onClick={onClose}>
            Odustani
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewItemModal;
