import React, { useState, useEffect } from "react";

import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./EditItemModal.css";
import {
  Autocomplete,
  Avatar,
  Checkbox,
  FormControlLabel,
  TextField,
} from "@mui/material";
import { db, storage } from "../../firebase";

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
  dateSelection?: boolean;
  relatedProducts?: {
    productId: string;
    name: string;
    image: string;
  }[];
};

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

const EditItemModal: React.FC<{ product: Product; onClose: () => void }> = ({
  product,
  onClose,
}) => {
  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState(product.category);
  const [subcategory, setSubcategory] = useState(product.subcategory);
  const [price, setPrice] = useState(String(product.price));
  const [description, setDescription] = useState(product.description);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(product.images);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [subcategoriesOptions, setSubcategoriesOptions] = useState<string[]>(
    []
  );
  const [onDiscount, setOnDiscount] = useState(product.onDiscount || false);
  const [discountPrice, setDiscountPrice] = useState(
    product.discountPrice ? String(product.discountPrice) : ""
  );
  const [dimensions, setDimensions] = useState(product.dimensions || "");
  const [dimensionsError, setDimensionsError] = useState("");
  const [scriptSelection, setScriptSelection] = useState(
    product.scriptSelection || false
  );
  const [titleSelection, setTitleSelection] = useState(
    product.titleSelection || false
  );
  const [dateSelection, setDateSelection] = useState(
    product.dateSelection || false
  );
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  //Disables scrolling on the body when the modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const data = snap.docs.map((d) => ({
          productId: d.id,
          ...(d.data() as Omit<Product, "productId">),
        }));
        setAllProducts(data);
      } catch (err) {
        console.error("Greška pri fetch-u proizvoda:", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (product.relatedProducts && allProducts.length > 0) {
      const initialRelated = allProducts.filter((p) =>
        product.relatedProducts?.some((rp) => rp.productId === p.productId)
      );
      setRelatedProducts(initialRelated);
    }
  }, [allProducts, product.relatedProducts]);

  // Update the subcategory dropdown options when category changes
  useEffect(() => {
    const selectedCategory = categoriesData.find(
      (cat) => cat.label === category
    );
    if (selectedCategory) {
      setSubcategoriesOptions(selectedCategory.subcategories);
      // Reset subcategory if it doesn't belong to the new category
      if (!selectedCategory.subcategories.includes(subcategory)) {
        setSubcategory("");
      }
    } else {
      setSubcategoriesOptions([]);
      setSubcategory("");
    }
  }, [category, subcategory]);

  const validateDimensions = (input: string): boolean => {
    if (!input.trim()) {
      setDimensionsError("");
      return true;
    }

    const values = input.split(",").map((val) => val.trim());
    const isValid = values.every((val) => val.length > 0);

    if (!isValid) {
      setDimensionsError(
        "Dimenzije moraju biti odvojene zarezima bez praznih vrednosti."
      );
      return false;
    }

    setDimensionsError("");
    return true;
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const totalImages = images.length + selectedFiles.length;
      if (totalImages > 5) {
        toast.error("Maksimalan broj slika je 5.");
        return;
      }
      setImages((prev) => [...prev, ...selectedFiles]);
      const previews = selectedFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews]);
    }
  };

  const removeImage = (index: number) => {
    const previewToRemove = imagePreviews[index];

    const isExistingImage = product.images.includes(previewToRemove);

    // Ako je to stara slika (iz baze), dodaj u removedImages
    if (isExistingImage) {
      setRemovedImages((prev) => [...prev, previewToRemove]);
    } else {
      // Ako je to nova slika (još nije u bazi), skloni iz "images"
      setImages((prev) => {
        const newImages = [...prev];
        newImages.splice(index - product.images.length, 1); // index korekcija
        return newImages;
      });
    }

    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    // Start with existing images
    const imageUrls: string[] = [...product.images];
    for (const image of images) {
      // Check if the image already exists by name (if applicable)
      const existingImageUrl = product.images.find((url) =>
        url.includes(image.name)
      );
      if (existingImageUrl) {
        imageUrls.push(existingImageUrl);
        continue;
      }
      // Upload new image
      const uniqueName = `${Date.now()}-${image.name}`;
      const imageRef = ref(storage, `images/${uniqueName}`);
      const uploadTask = uploadBytesResumable(imageRef, image);
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
            } catch (error) {
              reject(error);
            }
          }
        );
      });
      imageUrls.push(downloadURL);
    }
    return imageUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onDiscount && !discountPrice) {
      toast.error("Unesite novu cenu za proizvod na popustu.");
      return;
    }
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
      // Upload any new images
      let imageUrls: string[] = product.images;
      if (images.length > 0) {
        imageUrls = await uploadImages();
      }
      // Delete images that have been removed
      if (removedImages.length > 0) {
        await Promise.all(
          removedImages.map(async (imageUrl) => {
            const filename = decodeURIComponent(
              imageUrl.split("/").pop()?.split("?")[0] || ""
            );
            const imageRef = ref(storage, `/${filename}`);
            await deleteObject(imageRef);
          })
        );
        imageUrls = imageUrls.filter((url) => !removedImages.includes(url));
      }
      // Update product in Firestore
      await updateDoc(doc(db, "products", product.productId), {
        name,
        category,
        subcategory,
        price: parseFloat(price),
        description,
        images: imageUrls,
        onDiscount,
        discountPrice: onDiscount ? parseFloat(discountPrice) : null,
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
      toast.success("Proizvod uspešno izmenjen!");
      onClose();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Greška prilikom izmene proizvoda. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Sprečava da klik sa strane modala zatvori modal
  };

  return (
    <div className="edit-item-modal-container" onClick={onClose}>
      <form
        className="edit-item-form"
        onSubmit={handleSubmit}
        onClick={handleModalClick}
      >
        <h2>Izmena proizvoda</h2>

        <div className="edit-form-group">
          <label htmlFor="name">Naziv:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="edit-form-group">
          <label htmlFor="category">Kategorija:</label>
          <select
            id="category"
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

        <div className="edit-form-group">
          <label htmlFor="subcategory">Podkategorija:</label>
          <select
            id="subcategory"
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
          <div className="edit-form-group">
            <label>Povezani proizvodi:</label>
            <Autocomplete
              multiple
              value={relatedProducts}
              options={allProducts.filter(
                (p) =>
                  p.subcategory === subcategory &&
                  p.productId !== product.productId
              )}
              getOptionLabel={(opt) => opt.name}
              onChange={(_, val) => setRelatedProducts(val)}
              renderOption={(props, opt, { selected }) => {
                const { key, ...rest } = props;
                return (
                  <li
                    key={opt.productId}
                    {...rest}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Checkbox checked={selected} style={{ padding: 0 }} />
                    <Avatar
                      src={opt.images?.[0]}
                      alt={opt.name}
                      sx={{ width: 36, height: 36 }}
                    />
                    {opt.name}
                  </li>
                );
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </div>
        )}

        <div className="edit-form-group">
          <label htmlFor="dimensions">Dimenzije (opciono):</label>
          <input
            id="dimensions"
            type="text"
            value={dimensions}
            onChange={(e) => {
              setDimensions(e.target.value);
              validateDimensions(e.target.value);
            }}
            placeholder="npr: 10, širina, 15x20"
          />
          {dimensionsError && (
            <p style={{ color: "red", marginTop: "4px" }}>{dimensionsError}</p>
          )}
        </div>

        <div className="edit-form-group">
          <label htmlFor="price">Cena:</label>
          <input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
          />
        </div>

        <div className="edit-item-input-wrapper">
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
        <div className="edit-item-input-wrapper">
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

        <div className="edit-item-input-wrapper">
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

        <div className="edit-form-group discount-wrapper">
          <FormControlLabel
            control={
              <Checkbox
                checked={onDiscount}
                onChange={(e) => setOnDiscount(e.target.checked)}
                color="primary"
              />
            }
            label="Na popustu"
          />
        </div>

        {onDiscount && (
          <div className="edit-form-group">
            <label htmlFor="manufacturer">Nova cena:</label>
            <input
              id="newprice"
              type="number"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
              required
              title="Nova cena proizvoda"
              placeholder="Unesite novu cenu"
            />
          </div>
        )}

        <div className="edit-form-group">
          <label htmlFor="description">Opis:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div className="edit-form-group">
          <label htmlFor="images">Slike:</label>
          <input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
          />
          <div className="image-previews">
            {imagePreviews.map((preview, index) => (
              <div className="image-preview-container" key={index}>
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="image-preview"
                />
                <span
                  className="remove-image-icon"
                  onClick={() => removeImage(index)}
                >
                  X
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="edit-button-wrapper">
          <button className="add-button" type="submit" disabled={loading}>
            {loading
              ? `Izmena ${Math.round(uploadProgress)}%`
              : "Izmeni proizvod"}
          </button>
          <button className="cancel-button" type="button" onClick={onClose}>
            Otkaži
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditItemModal;
