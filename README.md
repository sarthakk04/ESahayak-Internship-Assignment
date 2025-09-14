# 🏡 Buyer Lead Intake App

A mini full-stack app to **capture, list, and manage buyer leads** with validation, search/filter, history tracking, and CSV import/export.  

Built with **Next.js (App Router) + TypeScript + Drizzle + Postgres + Clerk Auth + Zod**.

---

## ✨ Features

- 🔑 **Authentication & Authorization**
  - Clerk login , sample login email : desairohit4216@gmail.com , password : Sarthakuser
  - Ownership enforcement (`ownerId`)
  - Users can edit/delete **only their own** leads

- 📋 **Leads Management**
  - Create new buyer lead with Zod validation
  - Edit with concurrency check (stale updates rejected)
  - Delete with audit trail

- 🔎 **List & Search**
  - Server-side rendered buyer list
  - Pagination (page size = 10)
  - Filters (city, propertyType, status, timeline)
  - Debounced search on fullName/email/phone
  - Sort by `updatedAt` (desc)

- 📝 **History Tracking**
  - `buyer_history` table logs changes
  - View last 5 edits in UI

- 📂 **CSV Import & Export**
  - Import up to 200 rows with per-row validation
  - Detailed row errors returned
  - Transactional insert (valid rows only)
  - Export filtered list as CSV

- ⚡ **Validation**
  - Shared Zod schemas for server + client
  - Budget validation (`budgetMax ≥ budgetMin`)
  - Conditional BHK validation (only for Apartment/Villa)

- 🛡️ **Safety**
  - Rate limit middleware on create/update
  - Error boundaries in UI
  - Ownership + auth enforced at API level

---

## 🗂️ Data Model

<details>
<summary><strong>buyers</strong></summary>

| Column       | Type      | Notes                                            |
| ------------ | --------- | ------------------------------------------------ |
| id           | uuid      | PK                                               |
| fullName     | string    | 2–80 chars                                       |
| email        | string    | optional                                         |
| phone        | string    | 10–15 digits                                     |
| city         | enum      | `Chandigarh, Mohali, Zirakpur, Panchkula, Other` |
| propertyType | enum      | `Apartment, Villa, Plot, Office, Retail`         |
| bhk          | enum      | `1, 2, 3, 4, Studio` (conditional)               |
| purpose      | enum      | `Buy, Rent`                                      |
| budgetMin    | int       | optional                                         |
| budgetMax    | int       | optional; must be ≥ budgetMin                    |
| timeline     | enum      | `0-3m, 3-6m, >6m, Exploring`                     |
| source       | enum      | `Website, Referral, Walk-in, Call, Other`        |
| status       | enum      | default `New`                                    |
| notes        | text      | ≤ 1,000 chars                                    |
| tags         | string[]  | optional                                         |
| ownerId      | uuid      | Clerk user id                                    |
| updatedAt    | timestamp | auto updated                                     |

</details>

<details>
<summary><strong>buyer_history</strong></summary>

| Column    | Type      | Notes                      |
| --------- | --------- | -------------------------- |
| id        | uuid      | PK                         |
| buyerId   | uuid      | FK                         |
| changedBy | uuid      | user id                    |
| changedAt | timestamp |                            |
| diff      | JSON      | changed fields (old → new) |

</details>

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, Clerk Auth  
- **Backend**: API Routes (App Router), Drizzle ORM  
- **Database**: Postgres (can use Supabase or SQLite locally)  
- **Validation**: Zod  
- **CSV**: `csv-parse` + `csv-stringify`  
- **Auth**: Clerk (demo login)  

---

## 📖 API Testing

- 📂 Postman Docs: [View Documentation](https://documenter.getpostman.com/view/47086650/2sB3HoqLH6)  

You can also import the provided Postman collection into your workspace for local testing.

---

## ⚙️ Setup

```bash
# 1. Clone repo
git clone https://github.com/yourname/buyer-lead-intake.git
cd buyer-lead-intake

# 2. Install deps
npm install

# 3. Setup .env
DATABASE_URL=postgres://user:pass@localhost:5432/dbname
CLERK_SECRET_KEY=...
CLERK_PUBLISHABLE_KEY=...

# 4. Run migrations
npm run db:push   # or drizzle-kit push

# 5. Start dev server
npm run dev


