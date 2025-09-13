import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Enums
export const cityEnum = pgEnum("city", [
  "Chandigarh",
  "Mohali",
  "Zirakpur",
  "Panchkula",
  "Other",
]);
export const propertyTypeEnum = pgEnum("property_type", [
  "Apartment",
  "Villa",
  "Plot",
  "Office",
  "Retail",
]);
export const bhkEnum = pgEnum("bhk", ["1", "2", "3", "4", "Studio"]);
export const purposeEnum = pgEnum("purpose", ["Buy", "Rent"]);
export const timelineEnum = pgEnum("timeline", [
  "0-3m",
  "3-6m",
  ">6m",
  "Exploring",
]);
export const sourceEnum = pgEnum("source", [
  "Website",
  "Referral",
  "Walk-in",
  "Call",
  "Other",
]);
export const statusEnum = pgEnum("status", [
  "New",
  "Qualified",
  "Contacted",
  "Visited",
  "Negotiation",
  "Converted",
  "Dropped",
]);

// Buyers Table
export const buyers = pgTable("buyers", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 80 }).notNull(),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 15 }).notNull(),
  city: cityEnum("city").notNull(),
  propertyType: propertyTypeEnum("property_type").notNull(),
  bhk: bhkEnum("bhk"),
  purpose: purposeEnum("purpose").notNull(),
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  timeline: timelineEnum("timeline").notNull(),
  source: sourceEnum("source").notNull(),
  notes: text("notes"),
  tags: text("tags").array(),
  status: statusEnum("status").default("New").notNull(),
  ownerId: text("owner_id").notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`now()`)
    .notNull(),
});

// Buyer History Table
export const buyerHistory = pgTable("buyer_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  buyerId: uuid("buyer_id").notNull(),
  changedBy: text("changed_by").notNull(),
  changedAt: timestamp("changed_at")
    .default(sql`now()`)
    .notNull(),
  diff: jsonb("diff").notNull(),
});
