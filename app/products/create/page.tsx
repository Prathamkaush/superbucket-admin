"use client";

import AdminLayout from "@/components/AdminLayout";
import CommerceProductForm from "@/components/products/CommerceProductForm";

export default function CreateProductPage() {
  return (
    <AdminLayout>
      <CommerceProductForm mode="create" />
    </AdminLayout>
  );
}
