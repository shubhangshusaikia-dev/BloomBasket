import { useEffect, useState } from "react";

import {
  FiSettings,
  FiSave,
  FiRefreshCw,
  FiTruck,
  FiPercent,
  FiMail,
  FiPhone,
  FiShoppingBag,
} from "react-icons/fi";

import { supabase } from "../../lib/supabase";

function Settings() {
  const [settingsId, setSettingsId] = useState(null);

  const [formData, setFormData] = useState({
    store_name: "BloomBasket",
    support_email: "",
    support_phone: "",
    shipping_charge: "99",
    free_shipping_above: "999",
    tax_rate: "5",
    cod_enabled: true,
    store_enabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD SETTINGS
  // ==========================================

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const {
        data,
        error: fetchError,
      } = await supabase
        .from("store_settings")
        .select("*")
        .order("id", {
          ascending: true,
        })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        setSettingsId(null);

        setError(
          "No store settings found. Run the store_settings SQL first."
        );

        return;
      }

      setSettingsId(data.id);

      setFormData({
        store_name:
          data.store_name ||
          "BloomBasket",

        support_email:
          data.support_email || "",

        support_phone:
          data.support_phone || "",

        shipping_charge: String(
          data.shipping_charge ?? 99
        ),

        free_shipping_above: String(
          data.free_shipping_above ?? 999
        ),

        tax_rate: String(
          data.tax_rate ?? 5
        ),

        cod_enabled:
          data.cod_enabled ?? true,

        store_enabled:
          data.store_enabled ?? true,
      });
    } catch (err) {
      console.error(
        "Settings loading error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load store settings."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // FORM CHANGE
  // ==========================================

  function handleChange(e) {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
    setSuccess("");
  }

  // ==========================================
  // VALIDATION
  // ==========================================

  function validate() {
    if (!formData.store_name.trim()) {
      return "Enter your store name.";
    }

    if (
      formData.support_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.support_email
      )
    ) {
      return "Enter a valid support email.";
    }

    const shipping = Number(
      formData.shipping_charge
    );

    if (
      !Number.isFinite(shipping) ||
      shipping < 0
    ) {
      return "Enter a valid shipping charge.";
    }

    const freeShipping = Number(
      formData.free_shipping_above
    );

    if (
      !Number.isFinite(freeShipping) ||
      freeShipping < 0
    ) {
      return "Enter a valid free shipping amount.";
    }

    const tax = Number(
      formData.tax_rate
    );

    if (
      !Number.isFinite(tax) ||
      tax < 0 ||
      tax > 100
    ) {
      return "Tax rate must be between 0 and 100.";
    }

    return "";
  }

  // ==========================================
  // SAVE SETTINGS
  // ==========================================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!settingsId) {
      setError(
        "Store settings record was not found."
      );

      return;
    }

    try {
      setSaving(true);

      const {
        error: updateError,
      } = await supabase
        .from("store_settings")
        .update({
          store_name:
            formData.store_name.trim(),

          support_email:
            formData.support_email.trim() ||
            null,

          support_phone:
            formData.support_phone.trim() ||
            null,

          shipping_charge: Number(
            formData.shipping_charge
          ),

          free_shipping_above: Number(
            formData.free_shipping_above
          ),

          tax_rate: Number(
            formData.tax_rate
          ),

          cod_enabled:
            formData.cod_enabled,

          store_enabled:
            formData.store_enabled,

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", settingsId);

      if (updateError) {
        throw updateError;
      }

      setSuccess(
        "Store settings saved successfully."
      );
    } catch (err) {
      console.error(
        "Settings update error:",
        err
      );

      setError(
        err?.message ||
          "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="py-20 text-center">

        <div className="w-10 h-10 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin mx-auto" />

        <p className="text-slate-400 mt-4">
          Loading settings...
        </p>

      </div>
    );
  }

  return (
    <div className="max-w-5xl">

      {/* ====================================
          HEADER
          ==================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

        <div>

          <div className="flex items-center gap-3">

            <FiSettings
              size={28}
              className="text-violet-400"
            />

            <h1 className="text-3xl font-bold">
              Store Settings
            </h1>

          </div>

          <p className="text-slate-400 mt-2">
            Manage BloomBasket store configuration.
          </p>

        </div>

        <button
          type="button"
          onClick={fetchSettings}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 px-5 py-3 rounded-xl"
        >

          <FiRefreshCw />

          Reload

        </button>

      </div>

      {/* ====================================
          MESSAGES
          ==================================== */}

      {error && (
        <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-4">
          {success}
        </div>
      )}

      {/* ====================================
          FORM
          ==================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-8 mt-8"
      >

        {/* ==================================
            STORE INFORMATION
            ================================== */}

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-6">

            <FiShoppingBag className="text-violet-400" />

            <h2 className="text-xl font-bold">
              Store Information
            </h2>

          </div>

          <div className="space-y-5">

            {/* STORE NAME */}

            <div>

              <label className="block text-sm text-slate-400 mb-2">
                Store Name
              </label>

              <input
                type="text"
                name="store_name"
                value={formData.store_name}
                onChange={handleChange}
                placeholder="BloomBasket"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
              />

            </div>

            {/* CONTACT */}

            <div className="grid md:grid-cols-2 gap-5">

              <div>

                <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">

                  <FiMail />

                  Support Email

                </label>

                <input
                  type="email"
                  name="support_email"
                  placeholder="support@example.com"
                  value={formData.support_email}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
                />

              </div>

              <div>

                <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">

                  <FiPhone />

                  Support Phone

                </label>

                <input
                  type="tel"
                  name="support_phone"
                  placeholder="Phone number"
                  value={formData.support_phone}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
                />

              </div>

            </div>

          </div>

        </section>

        {/* ==================================
            CHECKOUT SETTINGS
            ================================== */}

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <h2 className="text-xl font-bold mb-6">
            Checkout Settings
          </h2>

          <div className="grid md:grid-cols-3 gap-5">

            {/* SHIPPING CHARGE */}

            <div>

              <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">

                <FiTruck />

                Shipping Charge

              </label>

              <div className="relative">

                <span className="absolute left-4 top-3 text-slate-400">
                  ₹
                </span>

                <input
                  type="number"
                  name="shipping_charge"
                  min="0"
                  step="0.01"
                  value={
                    formData.shipping_charge
                  }
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-9 pr-4 outline-none focus:border-violet-500"
                />

              </div>

            </div>

            {/* FREE SHIPPING */}

            <div>

              <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">

                <FiTruck />

                Free Shipping Above

              </label>

              <div className="relative">

                <span className="absolute left-4 top-3 text-slate-400">
                  ₹
                </span>

                <input
                  type="number"
                  name="free_shipping_above"
                  min="0"
                  step="0.01"
                  value={
                    formData.free_shipping_above
                  }
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-9 pr-4 outline-none focus:border-violet-500"
                />

              </div>

            </div>

            {/* TAX */}

            <div>

              <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">

                <FiPercent />

                Tax Rate

              </label>

              <div className="relative">

                <input
                  type="number"
                  name="tax_rate"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.tax_rate}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 pr-10 outline-none focus:border-violet-500"
                />

                <span className="absolute right-4 top-3 text-slate-400">
                  %
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* ==================================
            STORE OPTIONS
            ================================== */}

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <h2 className="text-xl font-bold">
            Store Options
          </h2>

          <div className="space-y-5 mt-6">

            <Toggle
              name="cod_enabled"
              checked={
                formData.cod_enabled
              }
              onChange={handleChange}
              title="Cash on Delivery"
              description="Allow customers to place Cash on Delivery orders."
            />

            <Toggle
              name="store_enabled"
              checked={
                formData.store_enabled
              }
              onChange={handleChange}
              title="Store Enabled"
              description="Control whether BloomBasket is accepting new orders."
            />

          </div>

        </section>

        {/* ==================================
            SAVE BUTTON
            ================================== */}

        <div className="flex justify-end">

          <button
            type="submit"
            disabled={
              saving || !settingsId
            }
            className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:cursor-not-allowed px-8 py-3 rounded-xl font-semibold"
          >

            <FiSave />

            {saving
              ? "Saving..."
              : "Save Settings"}

          </button>

        </div>

      </form>

    </div>
  );
}

// ==========================================
// TOGGLE COMPONENT
// ==========================================

function Toggle({
  name,
  checked,
  onChange,
  title,
  description,
}) {
  return (
    <label className="flex items-center justify-between gap-6 bg-slate-800/60 border border-slate-700 rounded-xl p-5 cursor-pointer">

      <div>

        <p className="font-semibold">
          {title}
        </p>

        <p className="text-sm text-slate-400 mt-1">
          {description}
        </p>

      </div>

      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 accent-violet-600"
      />

    </label>
  );
}

export default Settings;