"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { buyerCreateSchema } from "@/validations/buyer";
import toast from "react-hot-toast";

// --------------------------- Types ---------------------------
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

// --------------------------- Component ---------------------------
export default function BuyerPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [history, setHistory] = useState<BuyerHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch buyer details
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

  if (loading) return <div>Loading...</div>;
  if (!buyer) return <div>Buyer not found</div>;

  // --------------------------- Handlers ---------------------------
  const handleChange = (key: keyof Buyer, value: any) => {
    setBuyer({ ...buyer, [key]: value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Ensure tags is always an array
      const body = {
        ...buyer,
        tags: buyer.tags || [], // <-- fix for null
      };

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
      fetchBuyer(); // refresh
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

  // --------------------------- Render ---------------------------
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">View & Edit Buyer</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Full Name</label>
          <input
            type="text"
            value={buyer.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            value={buyer.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>

        <div>
          <label>Phone</label>
          <input
            type="text"
            value={buyer.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>

        <div>
          <label>City</label>
          <select
            value={buyer.city}
            onChange={(e) => handleChange("city", e.target.value)}
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

        <div>
          <label>Property Type</label>
          <select
            value={buyer.propertyType}
            onChange={(e) => handleChange("propertyType", e.target.value)}
          >
            {["Apartment", "Villa", "Plot", "Office", "Retail"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {["Apartment", "Villa"].includes(buyer.propertyType) && (
          <div>
            <label>BHK</label>
            <select
              value={buyer.bhk || ""}
              onChange={(e) => handleChange("bhk", e.target.value)}
            >
              {["1", "2", "3", "4", "Studio"].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label>Purpose</label>
          <select
            value={buyer.purpose}
            onChange={(e) => handleChange("purpose", e.target.value)}
          >
            {["Buy", "Rent"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Budget Min</label>
          <input
            type="number"
            value={buyer.budgetMin || ""}
            onChange={(e) => handleChange("budgetMin", Number(e.target.value))}
          />
        </div>

        <div>
          <label>Budget Max</label>
          <input
            type="number"
            value={buyer.budgetMax || ""}
            onChange={(e) => handleChange("budgetMax", Number(e.target.value))}
          />
        </div>

        <div>
          <label>Timeline</label>
          <select
            value={buyer.timeline}
            onChange={(e) => handleChange("timeline", e.target.value)}
          >
            {["0-3m", "3-6m", ">6m", "Exploring"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Source</label>
          <select
            value={buyer.source}
            onChange={(e) => handleChange("source", e.target.value)}
          >
            {["Website", "Referral", "Walk-in", "Call", "Other"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label>Notes</label>
          <textarea
            value={buyer.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
          />
        </div>

        <div>
          <label>Status</label>
          <select
            value={buyer.status}
            onChange={(e) => handleChange("status", e.target.value)}
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

      <div className="mt-6 flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete
        </button>
      </div>

      {/* History */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-2">Last 5 Changes</h2>
        {history.length === 0 && <p>No changes yet.</p>}
        {history.map((h) => (
          <div key={h.id} className="border p-2 mb-2 rounded">
            <p>
              <strong>{h.changedBy}</strong> at{" "}
              {new Date(h.changedAt).toLocaleString()}
            </p>
            {Object.entries(h.diff).map(([field, val]) => (
              <p key={field}>
                {field}: <del>{val.old?.toString() || "-"}</del> →{" "}
                <strong>{val.new?.toString() || "-"}</strong>
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
