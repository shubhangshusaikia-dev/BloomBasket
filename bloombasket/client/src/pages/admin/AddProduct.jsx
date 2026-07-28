import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiPackage,
  FiUploadCloud,
  FiX,
  FiImage,
} from "react-icons/fi";

import { supabase } from "../../lib/supabase";

function AddProduct() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    price: "",
    old_price: "",
    stock: "",
    rating: "5",
    badge: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD CATEGORIES
  // ==========================================

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setCategoriesLoading(true);

      const { data, error: fetchError } =
        await supabase
          .from("categories")
          .select("id, name")
          .order("name", {
            ascending: true,
          });

      if (fetchError) {
        throw fetchError;
      }

      setCategories(data || []);
    } catch (err) {
      console.error(
        "Category loading error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load categories."
      );
    } finally {
      setCategoriesLoading(false);
    }
  }

  // ==========================================
  // FORM CHANGE
  // ==========================================

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  // ==========================================
  // IMAGE SELECT
  // ==========================================

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, PNG and WEBP images are allowed."
      );

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Product image must be smaller than 5 MB."
      );

      e.target.value = "";
      return;
    }

    if (
      imagePreview &&
      imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(imagePreview);
    }

    const preview =
      URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(preview);
  }

  // ==========================================
  // REMOVE IMAGE
  // ==========================================

  function removeImage() {
    if (
      imagePreview &&
      imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview("");
  }

  // ==========================================
  // CLEAN PREVIEW URL
  // ==========================================

  useEffect(() => {
    return () => {
      if (
        imagePreview &&
        imagePreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          imagePreview
        );
      }
    };
  }, [imagePreview]);

  // ==========================================
  // VALIDATION
  // ==========================================

  function validateForm() {
    if (!formData.name.trim()) {
      return "Enter a product name.";
    }

    if (!formData.category_id) {
      return "Select a product category.";
    }

    const price =
      Number(formData.price);

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return "Enter a valid selling price.";
    }

    if (formData.old_price !== "") {
      const oldPrice =
        Number(formData.old_price);

      if (
        !Number.isFinite(oldPrice) ||
        oldPrice <= 0
      ) {
        return "Enter a valid old price.";
      }

      if (oldPrice <= price) {
        return "Old price must be greater than the selling price.";
      }
    }

    const stock =
      Number(formData.stock);

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return "Stock must be 0 or a positive whole number.";
    }

    const rating =
      Number(formData.rating);

    if (
      !Number.isFinite(rating) ||
      rating < 0 ||
      rating > 5
    ) {
      return "Rating must be between 0 and 5.";
    }

    if (!imageFile) {
      return "Select a product image.";
    }

    return "";
  }

  // ==========================================
  // UPLOAD IMAGE
  // ==========================================

  async function uploadImage() {
    if (!imageFile) {
      throw new Error(
        "No product image selected."
      );
    }

    const extension =
      imageFile.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const uniqueId =
      typeof crypto !== "undefined" &&
      crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`;

    const fileName =
      `${uniqueId}.${extension}`;

    const filePath =
      `products/${fileName}`;

    const {
      error: uploadError,
    } = await supabase.storage
      .from("product-images")
      .upload(
        filePath,
        imageFile,
        {
          cacheControl: "3600",
          upsert: false,
          contentType:
            imageFile.type,
        }
      );

    if (uploadError) {
      throw uploadError;
    }

    const { data } =
      supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error(
        "Unable to get the uploaded image URL."
      );
    }

    return {
      imageUrl: data.publicUrl,
      filePath,
    };
  }

  // ==========================================
  // ADD PRODUCT
  // ==========================================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    let uploadedFilePath = null;

    try {
      setLoading(true);

      // 1. Upload image

      const {
        imageUrl,
        filePath,
      } = await uploadImage();

      uploadedFilePath = filePath;

      // 2. Prepare product

      const productData = {
        name:
          formData.name.trim(),

        description:
          formData.description.trim() ||
          null,

        category_id:
          formData.category_id,

        price: Number(
          formData.price
        ),

        old_price:
          formData.old_price !== ""
            ? Number(
                formData.old_price
              )
            : null,

        stock: Number(
          formData.stock
        ),

        rating: Number(
          formData.rating
        ),

        badge:
          formData.badge || null,

        image_url: imageUrl,
      };

      // 3. Save to products table

      const {
        error: insertError,
      } = await supabase
        .from("products")
        .insert([productData]);

      if (insertError) {
        throw insertError;
      }

      setSuccess(
        "Product added successfully!"
      );

      // 4. Go back to products

      setTimeout(() => {
        navigate(
          "/admin/products"
        );
      }, 700);
    } catch (err) {
      console.error(
        "Add product error:",
        err
      );

      // Delete uploaded image if
      // database insert failed.

      if (uploadedFilePath) {
        const {
          error: cleanupError,
        } = await supabase.storage
          .from("product-images")
          .remove([
            uploadedFilePath,
          ]);

        if (cleanupError) {
          console.error(
            "Image cleanup error:",
            cleanupError
          );
        }
      }

      setError(
        err?.message ||
          "Unable to add product."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">

      {/* HEADER */}

      <div className="mb-8">

        <div className="flex items-center gap-3">

          <FiPackage
            size={28}
            className="text-violet-400"
          />

          <h1 className="text-3xl font-bold">
            Add Product
          </h1>

        </div>

        <p className="text-slate-400 mt-2">
          Add a new product to BloomBasket.
        </p>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="mb-6 bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-7"
      >

        {/* PRODUCT NAME */}

        <div>

          <label className="block text-sm text-slate-400 mb-2">
            Product Name *
          </label>

          <input
            type="text"
            name="name"
            placeholder="Luxury Gift Hamper"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500"
          />

        </div>

        {/* DESCRIPTION */}

        <div>

          <label className="block text-sm text-slate-400 mb-2">
            Description
          </label>

          <textarea
            name="description"
            placeholder="Describe the product..."
            value={
              formData.description
            }
            onChange={handleChange}
            rows={5}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500 resize-none"
          />

        </div>

        {/* CATEGORY */}

        <div>

          <label className="block text-sm text-slate-400 mb-2">
            Category *
          </label>

          <select
            name="category_id"
            value={
              formData.category_id
            }
            onChange={handleChange}
            disabled={
              categoriesLoading
            }
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500 disabled:opacity-50"
          >

            <option value="">
              {categoriesLoading
                ? "Loading categories..."
                : "Select Category"}
            </option>

            {categories.map(
              (category) => (
                <option
                  key={
                    category.id
                  }
                  value={
                    category.id
                  }
                >
                  {category.name}
                </option>
              )
            )}

          </select>

          {!categoriesLoading &&
            categories.length === 0 && (
              <p className="text-yellow-400 text-sm mt-2">
                No categories found. Add a
                category first.
              </p>
            )}

        </div>

        {/* PRICES */}

        <div className="grid md:grid-cols-2 gap-5">

          <div>

            <label className="block text-sm text-slate-400 mb-2">
              Selling Price (₹) *
            </label>

            <input
              type="number"
              name="price"
              placeholder="499"
              min="0"
              step="0.01"
              value={
                formData.price
              }
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500"
            />

          </div>

          <div>

            <label className="block text-sm text-slate-400 mb-2">
              Old Price (₹)
            </label>

            <input
              type="number"
              name="old_price"
              placeholder="699"
              min="0"
              step="0.01"
              value={
                formData.old_price
              }
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500"
            />

          </div>

        </div>

        {/* STOCK / RATING */}

        <div className="grid md:grid-cols-2 gap-5">

          <div>

            <label className="block text-sm text-slate-400 mb-2">
              Stock *
            </label>

            <input
              type="number"
              name="stock"
              placeholder="20"
              min="0"
              step="1"
              value={
                formData.stock
              }
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500"
            />

          </div>

          <div>

            <label className="block text-sm text-slate-400 mb-2">
              Rating
            </label>

            <input
              type="number"
              name="rating"
              min="0"
              max="5"
              step="0.1"
              value={
                formData.rating
              }
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500"
            />

          </div>

        </div>

        {/* BADGE */}

        <div>

          <label className="block text-sm text-slate-400 mb-2">
            Badge
          </label>

          <select
            name="badge"
            value={
              formData.badge
            }
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-violet-500"
          >

            <option value="">
              No Badge
            </option>

            <option value="New">
              New
            </option>

            <option value="Sale">
              Sale
            </option>

            <option value="Popular">
              Popular
            </option>

            <option value="Best Seller">
              Best Seller
            </option>

          </select>

        </div>

        {/* PRODUCT IMAGE */}

        <div>

          <label className="block text-sm text-slate-400 mb-3">
            Product Image *
          </label>

          {!imagePreview ? (

            <label className="border-2 border-dashed border-slate-700 hover:border-violet-500 bg-slate-800/50 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition">

              <FiUploadCloud
                size={45}
                className="text-violet-400"
              />

              <p className="font-semibold mt-4">
                Choose Product Image
              </p>

              <p className="text-sm text-slate-500 mt-2">
                JPG, PNG or WEBP • Max 5 MB
              </p>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleImageChange
                }
                className="hidden"
              />

            </label>

          ) : (

            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">

              <div className="relative">

                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-full max-h-96 object-contain bg-slate-950"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-4 right-4 w-10 h-10 bg-slate-950/90 hover:bg-red-500 rounded-full flex items-center justify-center transition"
                >
                  <FiX size={20} />
                </button>

              </div>

              <div className="p-4 flex items-center gap-3">

                <FiImage className="text-violet-400 flex-shrink-0" />

                <p className="text-sm text-slate-300 truncate">
                  {imageFile?.name}
                </p>

              </div>

            </div>

          )}

        </div>

        {/* BUTTONS */}

        <div className="grid sm:grid-cols-2 gap-4 pt-4">

          <button
            type="button"
            disabled={loading}
            onClick={() =>
              navigate(
                "/admin/products"
              )
            }
            className="border border-slate-700 hover:border-slate-500 disabled:opacity-50 py-3 rounded-xl font-semibold transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              loading ||
              categoriesLoading
            }
            className="bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:cursor-not-allowed py-3 rounded-xl font-semibold transition"
          >
            {loading
              ? "Uploading & Adding..."
              : "Add Product"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default AddProduct;