import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiEdit,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

import { supabase } from "../../lib/supabase";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    old_price: "",
    stock: "",
    rating: "5",
    badge: "",
    category_id: "",
    image_url: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPage();
  }, [id]);

  async function loadPage() {
    try {
      setLoading(true);
      setError("");

      const [
        { data: categoryData, error: categoryError },
        { data: productData, error: productError },
      ] = await Promise.all([
        supabase
          .from("categories")
          .select("id, name")
          .order("name"),

        supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single(),
      ]);

      if (categoryError) {
        throw categoryError;
      }

      if (productError) {
        throw productError;
      }

      setCategories(categoryData || []);

      setFormData({
        name: productData.name || "",
        description: productData.description || "",
        price: productData.price ?? "",
        old_price: productData.old_price ?? "",
        stock: productData.stock ?? "",
        rating: productData.rating ?? "5",
        badge: productData.badge || "",
        category_id: productData.category_id || "",
        image_url: productData.image_url || "",
      });

      setImagePreview(productData.image_url || "");
    } catch (err) {
      console.error("Load product error:", err);

      setError(
        err?.message || "Unable to load product."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please select a JPG, PNG, or WEBP image."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Product image must be smaller than 5 MB."
      );
      return;
    }

    setError("");

    setImageFile(file);

    const preview = URL.createObjectURL(file);

    setImagePreview(preview);
  }

  function removeNewImage() {
    if (
      imagePreview &&
      imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview(formData.image_url || "");
  }

  async function uploadImage() {
    if (!imageFile) {
      return formData.image_url;
    }

    const extension =
      imageFile.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const fileName =
      `${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const filePath = `products/${fileName}`;

    const { error: uploadError } =
      await supabase.storage
        .from("product-images")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: imageFile.type,
        });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error(
        "Unable to get the uploaded image URL."
      );
    }

    return data.publicUrl;
  }

  function validateForm() {
    if (!formData.name.trim()) {
      return "Enter a product name.";
    }

    if (!formData.category_id) {
      return "Select a category.";
    }

    const price = Number(formData.price);

    if (!Number.isFinite(price) || price <= 0) {
      return "Enter a valid selling price.";
    }

    if (formData.old_price !== "") {
      const oldPrice = Number(formData.old_price);

      if (
        !Number.isFinite(oldPrice) ||
        oldPrice <= 0
      ) {
        return "Enter a valid old price.";
      }

      if (oldPrice <= price) {
        return "Old price should be greater than the selling price.";
      }
    }

    const stock = Number(formData.stock);

    if (!Number.isInteger(stock) || stock < 0) {
      return "Stock must be 0 or a positive whole number.";
    }

    const rating = Number(formData.rating);

    if (
      !Number.isFinite(rating) ||
      rating < 0 ||
      rating > 5
    ) {
      return "Rating must be between 0 and 5.";
    }

    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const imageUrl = await uploadImage();

      const { error: updateError } =
        await supabase
          .from("products")
          .update({
            name: formData.name.trim(),

            description:
              formData.description.trim() || null,

            price: Number(formData.price),

            old_price:
              formData.old_price !== ""
                ? Number(formData.old_price)
                : null,

            stock: Number(formData.stock),

            rating: Number(formData.rating),

            badge:
              formData.badge.trim() || null,

            category_id: formData.category_id,

            image_url: imageUrl || null,
          })
          .eq("id", id);

      if (updateError) {
        throw updateError;
      }

      navigate("/admin/products");
    } catch (err) {
      console.error("Update product error:", err);

      setError(
        err?.message ||
          "Unable to update product."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin mx-auto" />

        <p className="text-slate-400 mt-4">
          Loading product...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">

      <div className="flex items-center gap-3 mb-8">
        <FiEdit
          size={27}
          className="text-violet-400"
        />

        <div>
          <h1 className="text-3xl font-bold">
            Edit Product
          </h1>

          <p className="text-slate-400 mt-1">
            Update product information.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6"
      >

        {/* NAME */}

        <div>
          <label className="block text-sm text-slate-400 mb-2">
            Product Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
          />
        </div>

        {/* DESCRIPTION */}

        <div>
          <label className="block text-sm text-slate-400 mb-2">
            Description
          </label>

          <textarea
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-violet-500 resize-none"
          />
        </div>

        {/* CATEGORY */}

        <div>
          <label className="block text-sm text-slate-400 mb-2">
            Category
          </label>

          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
          >
            <option value="">
              Select Category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* PRICE */}

        <div className="grid md:grid-cols-2 gap-5">

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Selling Price (₹)
            </label>

            <input
              type="number"
              name="price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Old Price (₹)
            </label>

            <input
              type="number"
              name="old_price"
              min="0"
              step="0.01"
              value={formData.old_price}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
            />
          </div>

        </div>

        {/* STOCK + RATING */}

        <div className="grid md:grid-cols-2 gap-5">

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Stock
            </label>

            <input
              type="number"
              name="stock"
              min="0"
              step="1"
              value={formData.stock}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
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
              value={formData.rating}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
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
            value={formData.badge}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
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

        {/* IMAGE */}

        <div>
          <label className="block text-sm text-slate-400 mb-3">
            Product Image
          </label>

          {imagePreview && (
            <div className="relative mb-4 bg-slate-950 border border-slate-700 rounded-2xl overflow-hidden">

              <img
                src={imagePreview}
                alt="Product preview"
                className="w-full max-h-96 object-contain"
              />

              {imageFile && (
                <button
                  type="button"
                  onClick={removeNewImage}
                  className="absolute top-4 right-4 w-10 h-10 bg-slate-950/90 hover:bg-red-500 rounded-full flex items-center justify-center"
                >
                  <FiX />
                </button>
              )}

            </div>
          )}

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-violet-500 rounded-2xl p-8 cursor-pointer transition">

            <FiUploadCloud
              size={38}
              className="text-violet-400"
            />

            <p className="font-semibold mt-3">
              {imageFile
                ? "Choose Different Image"
                : "Change Product Image"}
            </p>

            <p className="text-sm text-slate-500 mt-2">
              JPG, PNG or WEBP • Maximum 5 MB
            </p>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />

          </label>
        </div>

        {/* BUTTONS */}

        <div className="grid sm:grid-cols-2 gap-4 pt-4">

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              navigate("/admin/products")
            }
            className="border border-slate-700 hover:border-slate-500 py-3 rounded-xl font-semibold"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 py-3 rounded-xl font-semibold"
          >
            {saving
              ? "Saving Changes..."
              : "Save Changes"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default EditProduct;