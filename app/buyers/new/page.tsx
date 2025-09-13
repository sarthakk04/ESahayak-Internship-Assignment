"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { buyerCreateSchema } from "@/validations/buyer";

type FormData = z.infer<typeof buyerCreateSchema>;

export default function CreateBuyerPage() {
  const router = useRouter();
  const [form, setForm] = useState<Partial<FormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (key: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const parsed = buyerCreateSchema.parse(form);

      const res = await fetch("/api/buyers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create buyer");

      router.push("/buyers");
    } catch (err: any) {
      if (err.errors) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e: any) => {
          fieldErrors[e.path[0]] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        alert(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Create New Buyer
      </h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/** Full Name */}
        <div>
          <label className="block font-semibold mb-1">Full Name</label>
          <input
            type="text"
            value={form.fullName || ""}
            onChange={(e) => handleChange("fullName", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          />
          {errors.fullName && (
            <p className="text-red-500 mt-1">{errors.fullName}</p>
          )}
        </div>

        {/** Email */}
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            value={form.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          />
          {errors.email && <p className="text-red-500 mt-1">{errors.email}</p>}
        </div>

        {/** Phone */}
        <div>
          <label className="block font-semibold mb-1">Phone</label>
          <input
            type="text"
            value={form.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          />
          {errors.phone && <p className="text-red-500 mt-1">{errors.phone}</p>}
        </div>

        {/** City */}
        <div>
          <label className="block font-semibold mb-1">City</label>
          <select
            value={form.city || ""}
            onChange={(e) => handleChange("city", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          >
            <option value="">Select City</option>
            <option>Chandigarh</option>
            <option>Mohali</option>
            <option>Zirakpur</option>
            <option>Panchkula</option>
            <option>Other</option>
          </select>
          {errors.city && <p className="text-red-500 mt-1">{errors.city}</p>}
        </div>

        {/** Property Type */}
        <div>
          <label className="block font-semibold mb-1">Property Type</label>
          <select
            value={form.propertyType || ""}
            onChange={(e) => handleChange("propertyType", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          >
            <option value="">Select Property Type</option>
            <option>Apartment</option>
            <option>Villa</option>
            <option>Plot</option>
            <option>Office</option>
            <option>Retail</option>
          </select>
          {errors.propertyType && (
            <p className="text-red-500 mt-1">{errors.propertyType}</p>
          )}
        </div>

        {/** BHK */}
        <div>
          <label className="block font-semibold mb-1">
            BHK (if Apartment/Villa)
          </label>
          <select
            value={form.bhk || ""}
            onChange={(e) => handleChange("bhk", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          >
            <option value="">Select BHK</option>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>Studio</option>
          </select>
          {errors.bhk && <p className="text-red-500 mt-1">{errors.bhk}</p>}
        </div>

        {/** Purpose */}
        <div>
          <label className="block font-semibold mb-1">Purpose</label>
          <select
            value={form.purpose || ""}
            onChange={(e) => handleChange("purpose", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          >
            <option value="">Select Purpose</option>
            <option>Buy</option>
            <option>Rent</option>
          </select>
          {errors.purpose && (
            <p className="text-red-500 mt-1">{errors.purpose}</p>
          )}
        </div>

        {/** Budget Min */}
        <div>
          <label className="block font-semibold mb-1">Budget Min (INR)</label>
          <input
            type="number"
            value={form.budgetMin || ""}
            onChange={(e) => handleChange("budgetMin", Number(e.target.value))}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          />
          {errors.budgetMin && (
            <p className="text-red-500 mt-1">{errors.budgetMin}</p>
          )}
        </div>

        {/** Budget Max */}
        <div>
          <label className="block font-semibold mb-1">Budget Max (INR)</label>
          <input
            type="number"
            value={form.budgetMax || ""}
            onChange={(e) => handleChange("budgetMax", Number(e.target.value))}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          />
          {errors.budgetMax && (
            <p className="text-red-500 mt-1">{errors.budgetMax}</p>
          )}
        </div>

        {/** Timeline */}
        <div>
          <label className="block font-semibold mb-1">Timeline</label>
          <select
            value={form.timeline || ""}
            onChange={(e) => handleChange("timeline", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          >
            <option value="">Select Timeline</option>
            <option>0-3m</option>
            <option>3-6m</option>
            <option>&gt;6m</option>
            <option>Exploring</option>
          </select>
          {errors.timeline && (
            <p className="text-red-500 mt-1">{errors.timeline}</p>
          )}
        </div>

        {/** Source */}
        <div>
          <label className="block font-semibold mb-1">Source</label>
          <select
            value={form.source || ""}
            onChange={(e) => handleChange("source", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          >
            <option value="">Select Source</option>
            <option>Website</option>
            <option>Referral</option>
            <option>Walk-in</option>
            <option>Call</option>
            <option>Other</option>
          </select>
          {errors.source && (
            <p className="text-red-500 mt-1">{errors.source}</p>
          )}
        </div>

        {/** Notes */}
        <div>
          <label className="block font-semibold mb-1">Notes</label>
          <textarea
            value={form.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          />
          {errors.notes && <p className="text-red-500 mt-1">{errors.notes}</p>}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            {loading ? "Creating..." : "Create Buyer"}
          </button>
        </div>
      </form>
    </div>
  );
}
