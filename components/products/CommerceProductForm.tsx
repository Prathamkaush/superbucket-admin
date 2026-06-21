"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import { api, API_URL } from "@/lib/api";

type Option = { name: string; value: string };
type Specification = { name: string; value: string };
type Variant = {
  name: string;
  sku: string;
  barcode: string;
  options: Option[];
  mrp: string;
  price: string;
  stock: string;
  weightKg: string;
  isDefault: boolean;
};

const emptyOption = (): Option => ({ name: "", value: "" });
const emptySpecification = (): Specification => ({ name: "", value: "" });
const emptyVariant = (): Variant => ({
  name: "",
  sku: "",
  barcode: "",
  options: [emptyOption()],
  mrp: "",
  price: "",
  stock: "0",
  weightKg: "",
  isDefault: false,
});

const uploadUrl = (fileName?: string | null) =>
  fileName ? `${API_URL}/uploads/products/${fileName}` : "";

export default function CommerceProductForm({
  mode,
  productId,
  initialProduct,
}: {
  mode: "create" | "edit";
  productId?: string;
  initialProduct?: any;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [subtypes, setSubtypes] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [brandName, setBrandName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [subtypeId, setSubtypeId] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [gstRate, setGstRate] = useState("0");
  const [shippingWeight, setShippingWeight] = useState("0.1");
  const [tags, setTags] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("India");
  const [warranty, setWarranty] = useState("");
  const [shelfLife, setShelfLife] = useState("");
  const [storageInstructions, setStorageInstructions] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [returnPolicy, setReturnPolicy] = useState("");
  const [specifications, setSpecifications] = useState<Specification[]>([
    emptySpecification(),
  ]);
  const [variants, setVariants] = useState<Variant[]>([
    { ...emptyVariant(), isDefault: true },
  ]);
  const [images, setImages] = useState<(File | null)[]>([null, null, null, null]);
  const [existingImages, setExistingImages] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [isTrending, setIsTrending] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewLaunch, setIsNewLaunch] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);

  useEffect(() => {
    api.get("/categories").then((response) => setCategories(response.data || []));
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setTypes([]);
      return;
    }
    api
      .get(`/product-types?categoryId=${categoryId}`)
      .then((response) => setTypes(response.data || []));
  }, [categoryId]);

  useEffect(() => {
    if (!typeId) {
      setSubtypes([]);
      return;
    }
    api
      .get(`/product-subtypes?typeId=${typeId}`)
      .then((response) => setSubtypes(response.data || []));
  }, [typeId]);

  useEffect(() => {
    if (!initialProduct) return;

    setTitle(initialProduct.title || "");
    setBrandName(initialProduct.brandName || "");
    setShortDescription(initialProduct.shortDescription || "");
    setDescription(initialProduct.description || "");
    setCategoryId(String(initialProduct.categoryId || initialProduct.category?.id || ""));
    setTypeId(String(initialProduct.typeId || initialProduct.type?.id || ""));
    setSubtypeId(String(initialProduct.subtypeId || initialProduct.subtype?.id || ""));
    setStatus(initialProduct.status || "ACTIVE");
    setGstRate(String(initialProduct.gstRate ?? 0));
    setShippingWeight(String(initialProduct.weight ?? 0.1));
    setTags(Array.isArray(initialProduct.tags) ? initialProduct.tags.join(", ") : "");
    setCountryOfOrigin(initialProduct.countryOfOrigin || "India");
    setWarranty(initialProduct.warranty || "");
    setShelfLife(initialProduct.shelfLife || "");
    setStorageInstructions(initialProduct.storageInstructions || "");
    setHsnCode(initialProduct.hsnCode || "");
    setReturnPolicy(initialProduct.returnPolicy || "");
    setSpecifications(
      Array.isArray(initialProduct.specifications) &&
        initialProduct.specifications.length
        ? initialProduct.specifications
        : [emptySpecification()],
    );
    setExistingImages([
      initialProduct.img1 || null,
      initialProduct.img2 || null,
      initialProduct.img3 || null,
      initialProduct.img4 || null,
    ]);
    setIsTrending(Boolean(initialProduct.isTrending));
    setIsFeatured(Boolean(initialProduct.isFeatured));
    setIsBestSeller(Boolean(initialProduct.isBestSeller));
    setIsNewLaunch(Boolean(initialProduct.isNewLaunch));
    setFreeShipping(Boolean(initialProduct.freeShipping));

    if (Array.isArray(initialProduct.variants) && initialProduct.variants.length) {
      setVariants(
        initialProduct.variants.map((variant: any) => ({
          name: variant.name || variant.weightLabel || variant.flavour || "",
          sku: variant.sku || "",
          barcode: variant.barcode || "",
          options:
            Array.isArray(variant.attributes) && variant.attributes.length
              ? variant.attributes
              : [
                  variant.flavour
                    ? { name: "Flavour", value: variant.flavour }
                    : variant.weightLabel
                      ? { name: "Pack Size", value: variant.weightLabel }
                      : emptyOption(),
                ],
          mrp: String(variant.mrp ?? variant.price ?? ""),
          price: String(variant.price ?? ""),
          stock: String(variant.stock ?? 0),
          weightKg: String(variant.weightKg ?? ""),
          isDefault: Boolean(variant.isDefault),
        })),
      );
    }
  }, [initialProduct]);

  const totalStock = useMemo(
    () => variants.reduce((total, variant) => total + Number(variant.stock || 0), 0),
    [variants],
  );
  const defaultVariant = variants.find((variant) => variant.isDefault) || variants[0];

  const updateVariant = (index: number, patch: Partial<Variant>) => {
    setVariants((current) =>
      current.map((variant, variantIndex) => {
        if (variantIndex !== index) {
          return patch.isDefault ? { ...variant, isDefault: false } : variant;
        }
        return { ...variant, ...patch };
      }),
    );
  };

  const updateOption = (
    variantIndex: number,
    optionIndex: number,
    patch: Partial<Option>,
  ) => {
    updateVariant(variantIndex, {
      options: variants[variantIndex].options.map((option, index) =>
        index === optionIndex ? { ...option, ...patch } : option,
      ),
    });
  };

  const submit = async () => {
    const cleanVariants = variants
      .map((variant, index) => {
        const attributes = variant.options.filter(
          (option) => option.name.trim() && option.value.trim(),
        );
        const name =
          variant.name.trim() ||
          attributes.map((option) => option.value.trim()).join(" / ");
        return {
          name,
          sku: variant.sku.trim() || null,
          barcode: variant.barcode.trim() || null,
          attributes,
          mrp: variant.mrp || variant.price,
          price: Number(variant.price),
          stock: Number(variant.stock || 0),
          weightKg: variant.weightKg ? Number(variant.weightKg) : null,
          isDefault: variant.isDefault || index === 0,
        };
      })
      .filter((variant) => variant.name && Number.isFinite(variant.price));

    if (!title.trim() || !categoryId) {
      alert("Product name and category are required");
      return;
    }
    if (!cleanVariants.length) {
      alert("Add at least one variant with a name or option and selling price");
      return;
    }

    const form = new FormData();
    form.append("title", title.trim());
    form.append("brandName", brandName.trim());
    form.append("shortDescription", shortDescription.trim());
    form.append("description", description.trim());
    form.append("categoryId", categoryId);
    if (typeId) form.append("typeId", typeId);
    if (subtypeId) form.append("subtypeId", subtypeId);
    form.append("status", status);
    form.append("gstRate", gstRate || "0");
    form.append("weight", shippingWeight || "0.1");
    form.append("price", String(defaultVariant?.price || cleanVariants[0].price));
    form.append("stock", String(totalStock));
    form.append("sizes", "[]");
    form.append("variants", JSON.stringify(cleanVariants));
    form.append("specifications", JSON.stringify(specifications.filter((item) => item.name.trim() && item.value.trim())));
    form.append("tags", JSON.stringify(tags.split(",").map((tag) => tag.trim()).filter(Boolean)));
    form.append("countryOfOrigin", countryOfOrigin.trim());
    form.append("warranty", warranty.trim());
    form.append("shelfLife", shelfLife.trim());
    form.append("storageInstructions", storageInstructions.trim());
    form.append("hsnCode", hsnCode.trim());
    form.append("returnPolicy", returnPolicy.trim());
    form.append("isTrending", String(isTrending));
    form.append("isFeatured", String(isFeatured));
    form.append("isBestSeller", String(isBestSeller));
    form.append("isNewLaunch", String(isNewLaunch));
    form.append("freeShipping", String(freeShipping));
    images.forEach((image, index) => image && form.append(`image${index + 1}`, image));

    try {
      setSaving(true);
      if (mode === "edit" && productId) {
        await api.patch(`/products/${productId}`, form);
      } else {
        await api.post("/products", form);
      }
      router.push("/products");
    } catch (error: any) {
      alert(error.response?.data?.message || "Unable to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 rounded-md border border-white/10 bg-zinc-950/90 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/products")} className="rounded-md bg-white/10 p-3 hover:bg-white/20">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brandRed">Superbucket Catalog</p>
            <h1 className="text-2xl font-black">{mode === "edit" ? "Edit Product" : "Create Product"}</h1>
            <p className="text-sm text-zinc-400">Groceries, electronics, fashion, footwear and more.</p>
          </div>
        </div>
        <button onClick={submit} disabled={saving} className="admin-action-red">
          <Save size={16} /> {saving ? "Saving..." : "Save Product"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <Section title="Product Information">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Product name" value={title} onChange={setTitle} className="md:col-span-2" required />
              <Field label="Brand" value={brandName} onChange={setBrandName} placeholder="Amul, Samsung, Local Brand" />
              <Field label="Search tags" value={tags} onChange={setTags} placeholder="rice, basmati, grocery" />
              <Field label="Short description" value={shortDescription} onChange={setShortDescription} className="md:col-span-2" />
              <TextArea label="Full description" value={description} onChange={setDescription} className="md:col-span-2" />
            </div>
          </Section>

          <Section title="Variants">
            <p className="mb-4 text-sm text-zinc-400">
              Examples: Pack Size = 1 kg; Size = XL and Color = Red; Shoe Size = 9.
            </p>
            <div className="space-y-4">
              {variants.map((variant, variantIndex) => (
                <div key={variantIndex} className="rounded-md border border-white/10 bg-white/5 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                      <input type="radio" checked={variant.isDefault} onChange={() => updateVariant(variantIndex, { isDefault: true })} />
                      Default variant
                    </label>
                    {variants.length > 1 && (
                      <button onClick={() => setVariants((items) => items.filter((_, index) => index !== variantIndex))} className="text-red-400">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Field label="Variant name" value={variant.name} onChange={(value) => updateVariant(variantIndex, { name: value })} placeholder="1 kg / Red XL" />
                    <Field label="SKU" value={variant.sku} onChange={(value) => updateVariant(variantIndex, { sku: value })} />
                    <Field label="Barcode" value={variant.barcode} onChange={(value) => updateVariant(variantIndex, { barcode: value })} />
                  </div>
                  <div className="my-4 space-y-2">
                    {variant.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                        <input className="admin-field" placeholder="Option: Pack Size, Color, Size" value={option.name} onChange={(event) => updateOption(variantIndex, optionIndex, { name: event.target.value })} />
                        <input className="admin-field" placeholder="Value: 1 kg, Red, XL" value={option.value} onChange={(event) => updateOption(variantIndex, optionIndex, { value: event.target.value })} />
                        <button className="rounded-md bg-white/5 px-3 text-zinc-400" onClick={() => updateVariant(variantIndex, { options: variant.options.filter((_, index) => index !== optionIndex) })}>×</button>
                      </div>
                    ))}
                    {variant.options.length < 3 && (
                      <button className="text-xs font-bold text-brandRed" onClick={() => updateVariant(variantIndex, { options: [...variant.options, emptyOption()] })}>
                        + Add option
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    <Field label="MRP" type="number" value={variant.mrp} onChange={(value) => updateVariant(variantIndex, { mrp: value })} />
                    <Field label="Selling price" type="number" value={variant.price} onChange={(value) => updateVariant(variantIndex, { price: value })} required />
                    <Field label="Stock" type="number" value={variant.stock} onChange={(value) => updateVariant(variantIndex, { stock: value })} />
                    <Field label="Shipping kg" type="number" value={variant.weightKg} onChange={(value) => updateVariant(variantIndex, { weightKg: value })} />
                  </div>
                </div>
              ))}
              <button onClick={() => setVariants((items) => [...items, emptyVariant()])} className="admin-action">
                <Plus size={16} /> Add Variant
              </button>
            </div>
          </Section>

          <Section title="Specifications">
            <div className="space-y-2">
              {specifications.map((item, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <input className="admin-field" placeholder="Specification: Material, Model" value={item.name} onChange={(event) => setSpecifications((items) => items.map((entry, itemIndex) => itemIndex === index ? { ...entry, name: event.target.value } : entry))} />
                  <input className="admin-field" placeholder="Value" value={item.value} onChange={(event) => setSpecifications((items) => items.map((entry, itemIndex) => itemIndex === index ? { ...entry, value: event.target.value } : entry))} />
                  <button className="rounded-md bg-white/5 px-3 text-zinc-400" onClick={() => setSpecifications((items) => items.filter((_, itemIndex) => itemIndex !== index))}>×</button>
                </div>
              ))}
              <button className="text-xs font-bold text-brandRed" onClick={() => setSpecifications((items) => [...items, emptySpecification()])}>+ Add specification</button>
            </div>
          </Section>

          <Section title="Policies & Product Details">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Country of origin" value={countryOfOrigin} onChange={setCountryOfOrigin} />
              <Field label="HSN code" value={hsnCode} onChange={setHsnCode} />
              <Field label="Warranty" value={warranty} onChange={setWarranty} placeholder="1 year" />
              <Field label="Shelf life" value={shelfLife} onChange={setShelfLife} placeholder="12 months" />
              <TextArea label="Storage instructions" value={storageInstructions} onChange={setStorageInstructions} />
              <TextArea label="Return policy" value={returnPolicy} onChange={setReturnPolicy} />
            </div>
          </Section>
        </div>

        <aside className="space-y-6 xl:col-span-4">
          <Section title="Catalog">
            <div className="space-y-4">
              <Select label="Category" value={categoryId} onChange={(value) => { setCategoryId(value); setTypeId(""); setSubtypeId(""); }} options={categories} required />
              <Select label="Type (optional)" value={typeId} onChange={(value) => { setTypeId(value); setSubtypeId(""); }} options={types} />
              <Select label="Subtype (optional)" value={subtypeId} onChange={setSubtypeId} options={subtypes} />
              <Select label="Status" value={status} onChange={setStatus} options={["ACTIVE", "DRAFT", "ARCHIVED"].map((value) => ({ id: value, name: value }))} />
              <Field label="GST rate %" type="number" value={gstRate} onChange={setGstRate} />
              <Field label="Base shipping weight kg" type="number" value={shippingWeight} onChange={setShippingWeight} />
            </div>
          </Section>

          <Section title="Images">
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((index) => {
                const preview = images[index]
                  ? URL.createObjectURL(images[index]!)
                  : uploadUrl(existingImages[index]);
                return (
                  <label key={index} className="relative aspect-square cursor-pointer overflow-hidden rounded-md border border-dashed border-white/20 bg-white/5">
                    {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-zinc-500"><ImagePlus /></span>}
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => setImages((items) => items.map((item, itemIndex) => itemIndex === index ? event.target.files?.[0] || null : item))} />
                  </label>
                );
              })}
            </div>
          </Section>

          <Section title="Visibility & Shipping">
            <div className="space-y-3">
              <Toggle label="Trending" value={isTrending} onChange={setIsTrending} />
              <Toggle label="Featured" value={isFeatured} onChange={setIsFeatured} />
              <Toggle label="Best seller" value={isBestSeller} onChange={setIsBestSeller} />
              <Toggle label="New launch" value={isNewLaunch} onChange={setIsNewLaunch} />
              <Toggle label="Free shipping" value={freeShipping} onChange={setFreeShipping} />
            </div>
          </Section>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="admin-surface p-5"><h2 className="mb-5 text-sm font-black uppercase tracking-widest text-white">{title}</h2>{children}</section>;
}

function Field({ label, value, onChange, type = "text", placeholder = "", className = "", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; className?: string; required?: boolean }) {
  return <label className={`space-y-2 ${className}`}><span className="admin-label">{label}{required ? " *" : ""}</span><input className="admin-field" type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

function TextArea({ label, value, onChange, className = "" }: { label: string; value: string; onChange: (value: string) => void; className?: string }) {
  return <label className={`space-y-2 ${className}`}><span className="admin-label">{label}</span><textarea className="admin-field min-h-28 resize-y" value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Select({ label, value, onChange, options, required = false }: { label: string; value: string; onChange: (value: string) => void; options: any[]; required?: boolean }) {
  return <label className="space-y-2"><span className="admin-label">{label}{required ? " *" : ""}</span><select className="admin-field" value={value} onChange={(event) => onChange(event.target.value)}><option value="">Select</option>{options.map((option) => <option key={option.id} value={String(option.id)}>{option.name}</option>)}</select></label>;
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold"><span>{label}</span><input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} /></label>;
}
