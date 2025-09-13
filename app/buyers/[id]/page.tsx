"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { buyerCreateSchema } from "@/validations/buyer";
import toast from "react-hot-toast";

type Buyer = z.infer<typeof buyerCreateSchema> & {
  id: string;
  updatedAt: string;
};

type BuyerHistory = {
  id: string;
  changedBy: string;
  changedAt: string;
  diff: Record<string, { old: any; new: any }>;
};

export default function BuyerPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [history, setHistory] = useState<BuyerHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBuyer = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/buyers/${id}`);
      if (!res.ok) throw new Error("Failed to fetch buyer");
      const data = await res.json();
      setBuyer(data.data);
      setHistory(data.data.history || []);
    } catch (err: any) {
      toast.error(err.message || "Error fetching buyer");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyer();
  }, [id]);

  // if (loading) return <div>Loading...</div>;
  if (!buyer) return <div>Buyer not found</div>;

  const handleChange = (key: keyof Buyer, value: any) => {
    setBuyer({ ...buyer, [key]: value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const body = { ...buyer, tags: buyer.tags || [] };
      const res = await fetch(`/api/buyers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Update failed");
      }
      toast.success("Buyer updated successfully");
      fetchBuyer();
    } catch (err: any) {
      toast.error(err.message || "Error updating buyer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this buyer?")) return;
    try {
      const res = await fetch(`/api/buyers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Delete failed");
      }
      toast.success("Buyer deleted successfully");
      router.push("/buyers");
    } catch (err: any) {
      toast.error(err.message || "Error deleting buyer");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 rounded-lg mt-8 shadow-md">
      {/* Loader Overlay */}
      {(loading || saving) && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
          <svg
            className="animate-spin h-12 w-12 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>
      )}

      {/* Header & Back Button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/")}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">View & Edit Buyer</h1>
        <div></div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white p-6 rounded-lg shadow-sm">
        {/* Full Name */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            value={buyer.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={buyer.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Phone
          </label>
          <input
            type="text"
            value={buyer.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {/* City */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">City</label>
          <select
            value={buyer.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            {["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"].map(
              (c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              )
            )}
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Property Type
          </label>
          <select
            value={buyer.propertyType}
            onChange={(e) => handleChange("propertyType", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            {["Apartment", "Villa", "Plot", "Office", "Retail"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* BHK */}
        {["Apartment", "Villa"].includes(buyer.propertyType) && (
          <div>
            <label className="block font-semibold mb-1 text-gray-700">
              BHK
            </label>
            <select
              value={buyer.bhk || ""}
              onChange={(e) => handleChange("bhk", e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              {["1", "2", "3", "4", "Studio"].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Purpose */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Purpose
          </label>
          <select
            value={buyer.purpose}
            onChange={(e) => handleChange("purpose", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            {["Buy", "Rent"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Budget Min */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Budget Min
          </label>
          <input
            type="number"
            value={buyer.budgetMin || ""}
            onChange={(e) => handleChange("budgetMin", Number(e.target.value))}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {/* Budget Max */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Budget Max
          </label>
          <input
            type="number"
            value={buyer.budgetMax || ""}
            onChange={(e) => handleChange("budgetMax", Number(e.target.value))}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {/* Timeline */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Timeline
          </label>
          <select
            value={buyer.timeline}
            onChange={(e) => handleChange("timeline", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            {["0-3m", "3-6m", ">6m", "Exploring"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Source */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Source
          </label>
          <select
            value={buyer.source}
            onChange={(e) => handleChange("source", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            {["Website", "Referral", "Walk-in", "Call", "Other"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="col-span-2">
          <label className="block font-semibold mb-1 text-gray-700">
            Notes
          </label>
          <textarea
            value={buyer.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Status
          </label>
          <select
            value={buyer.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            {[
              "New",
              "Qualified",
              "Contacted",
              "Visited",
              "Negotiation",
              "Converted",
              "Dropped",
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-6 py-2 rounded-lg shadow hover:bg-red-700 transition"
        >
          Delete
        </button>
      </div>

      {/* History */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Last 5 Changes</h2>
        {history.length === 0 && (
          <p className="text-gray-600">No changes yet.</p>
        )}
        <div className="space-y-3">
          {history.map((h) => (
            <div
              key={h.id}
              className="border p-3 rounded-lg shadow-sm bg-gray-50"
            >
              <p className="text-sm text-gray-600">
                <strong>{h.changedBy}</strong> at{" "}
                {new Date(h.changedAt).toLocaleString()}
              </p>
              {Object.entries(h.diff).map(([field, val]) => (
                <p key={field} className="text-gray-700">
                  <span className="font-semibold">{field}</span>:{" "}
                  <del className="text-red-500">
                    {val.old?.toString() || "-"}
                  </del>{" "}
                  →{" "}
                  <span className="text-green-600 font-semibold">
                    {val.new?.toString() || "-"}
                  </span>
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
