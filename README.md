# FixMate - Frontend Client

FixMate is an on-demand electronic device and home appliance repair services booking and tracking platform. It connects customers with certified repair technicians across 7 service categories, featuring real-time status tracking, role-based dashboards (Customer, Technician, Admin), secure authentication via Better Auth, and Stripe payment integration.

---

## 🔗 Live Application
- **Live Client URL:** `https://your-client-domain.vercel.app`
- **Backend API URL:** `https://your-server-domain.vercel.app`

---

## 🔑 Demo Credentials

All seeded accounts share the universal password: `Password123!`

| Role | Email | Password | Access / Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@fixmate.io` | `Password123!` | Executive KPIs, approve/reject services, manage user roles, global bookings & audit logs |
| **Technician** | `alex.technician@fixmate.io` | `Password123!` | Create & manage services, accept/reject booking requests, update repair status, earnings metrics |
| **Customer** | `sophia.turner@gmail.com` | `Password123!` | Browse services, instant booking, track active repairs, online Stripe checkout & history |

*Other technician accounts:* `marcus.technician@fixmate.io`, `david.technician@fixmate.io`  
*Other customer accounts:* `liam.harper@gmail.com`, `emma.watson@gmail.com`

---

## 🌟 Key Features

1. **Modern Public Experience:**
   - Responsive landing page featuring high-conversion heroes, dynamic service statistics, and 6 latest approved services.
   - Categorized service exploration (7 categories: Smartphone, Laptop & PC, AC, Refrigerator, TV, Washing Machine, Electrical).
   - Multi-parameter filtering (keyword search, category, service mode, sorting, pagination).
   - Detailed service profile with technician bio, coverage area, base pricing, and direct booking CTA.

2. **Secure Authentication & Role Routing:**
   - Powered by Better Auth with MongoDB adapter and JWT / JWKS plugin.
   - Dynamic role-based dashboard access control with server-side layout guards.
   - Seamless profile management with instant avatar uploads via ImgBB.

3. **Customer Workspace:**
   - Booking placement with preferred service mode (`Home Visit` vs `Shop Drop-off`), schedule date, problem description, and address.
   - Interactive booking lifecycle tracking (`pending` ➔ `accepted` ➔ `in_progress` ➔ `completed` / `cancelled`).
   - Integrated Stripe Checkout for completed / payable repairs with instant verification.

4. **Technician Hub:**
   - Service catalog management (create service with pending approval, toggle availability).
   - Real-time booking request queue with Accept/Decline action workflows.
   - In-flight repair status transitions (`in_progress`, `completed`).
   - Analytics overview with monthly earnings and job distributions.

5. **Admin Moderation & Control Plane:**
   - Platform-wide executive KPI cards and monthly revenue charts.
   - Technician service vetting with Approve / Reject controls.
   - User account administration and dynamic role assignment (`customer`, `technician`, `admin`).
   - Global booking register and financial audit trails.

---

## 📦 Core NPM Packages & Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack, Partial Prerendering)
- **UI & Styling:** React 19, Tailwind CSS v4, Lucide React icons, Sonner (toasts)
- **Authentication:** `better-auth` with MongoDB adapter and JWT plugin
- **Data Visualization:** `recharts`
- **Validation & Forms:** `zod`, `react-hook-form`, `@hookform/resolvers`
- **Database:** `mongodb` (MongoDB Atlas Node driver)

---

## 🛠️ Local Setup & Development

1. **Clone the repository and navigate to client:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**  
   Create a `.env.local` file with:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   BETTER_AUTH_SECRET=your_32_character_secret_key_here
   BETTER_AUTH_URL=http://localhost:3000
   MONGODB_URI=your_mongodb_connection_string
   DB_NAME=fixmate
   IMGBB_API_KEY=your_imgbb_api_key
   ```

4. **Seed the database (optional):**
   ```bash
   npm run seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Build for production:**
   ```bash
   npm run build
   ```
