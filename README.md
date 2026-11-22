# FixMate - Frontend Client

<div align="center">

# 🔧 FixMate — Client

**On-demand device & home appliance repair booking platform.**
Book verified technicians, track every repair step live, and pay only after the job is done.

[![Live Site](https://img.shields.io/badge/Live-fixmate--client--ujyn.vercel.app-0f766e?style=for-the-badge&logo=vercel&logoColor=white)](https://fixmate-client-ujyn.vercel.app/)
[![API](https://img.shields.io/badge/API-fixmate--server--six.vercel.app-134e4a?style=for-the-badge&logo=express&logoColor=white)](https://fixmate-server-six.vercel.app/)

![Next.js](https://img.shields.io/badge/Next.js-App_Router-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![BetterAuth](https://img.shields.io/badge/BetterAuth-Auth-0f766e)
![Stripe](https://img.shields.io/badge/Stripe-Test_Mode-635BFF?logo=stripe&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)

</div>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Live Links & Demo Credentials](#-live-links--demo-credentials)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Roles & Permissions](#-roles--permissions)
- [Tech Stack](#-tech-stack)
- [NPM Packages Used](#-npm-packages-used)
- [Route Map](#-route-map)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Related Repository](#-related-repository)
- [Author](#-author)

---

## 📖 About the Project

Finding a trustworthy repair technician is hard. Customers hand over a device with no idea what's happening to it, and often pay before any work is done. Skilled technicians, meanwhile, have no structured place to showcase services and manage incoming jobs.

**FixMate solves both problems.** Every job has a clear, trackable status, and payment happens **only after the work is delivered**.

This repository contains the **Next.js frontend**. The REST API lives in a separate repo (see [Related Repository](#-related-repository)).

---

## 🌐 Live Links & Demo Credentials

| Resource | Link |
| --- | --- |
| 🚀 Live Site | https://fixmate-client-ujyn.vercel.app/ |
| ⚙️ Backend API | https://fixmate-server-six.vercel.app/ |

### Demo Accounts

> ⚠️ Replace the placeholders below with your real seeded credentials before publishing.

| Role | Email | Password |
| --- | --- | --- |
| 👑 Admin | `admin@fixmate.com` | `YourAdminPassword` |
| 🛠️ Technician | `technician@fixmate.com` | `YourTechPassword` |
| 👤 Customer | `customer@fixmate.com` | `YourCustomerPassword` |

**Stripe test card:** `4242 4242 4242 4242` — any future expiry, any CVC, any ZIP.

---

## ✨ Key Features

### 🌍 Public
- Modern landing page: hero with category search, popular categories, latest services, how-it-works flow, trust section, platform stats, and technician call-to-action
- **Browse Services** with **server-side search, category & service-mode filters, and sorting** (price low→high, high→low, newest). Filters persist in the URL, so they survive reloads and are shareable (`/services?category=AC`)
- Service details page with technician summary, pricing, duration, and area
- Custom 404 page, error boundary, and loading skeletons
- Fully responsive (mobile, tablet, desktop), sticky navbar with active-route highlighting and a mobile hamburger menu

### 👤 Customer
- Send a repair request (phone, address, preferred date, problem description)
- Duplicate active-request prevention with clear error toasts
- Track every booking with colored status & payment badges
- Cancel a request (only while `requested`) with a confirmation modal
- **Pay Now** via Stripe Checkout once the job is `completed` and `unpaid`
- Payment history with transaction IDs

### 🛠️ Technician
- Add services with image upload through **ImgBB**
- Full CRUD on own services, plus an availability on/off toggle
- Editing a service re-submits it for admin approval
- Manage incoming requests with only the valid actions per status (Accept / Reject → Start Work → Mark Completed with final amount)
- Filter requests by status

### 👑 Admin
- Approve or reject service listings
- Manage users and change roles (cannot change own role)
- Monitor every booking and every transaction
- Total revenue overview

### 🔐 Security & UX
- Authentication with **BetterAuth** (MongoDB adapter, role as an additional field)
- Role-protected dashboard routes with redirects and no logout on reload
- Password rules enforced with inline errors (min 6 chars, upper + lower case)
- Toast notifications for every action
- Friendly empty states and confirmation modals
- Dashboard with reusable stats cards, charts, and a role-aware collapsible sidebar

---

## 🔄 How It Works

```
Requested ──► Accepted ──► In Progress ──► Completed ──► Paid
    │
    ├──► Rejected   (by technician)
    └──► Cancelled  (by customer)
```

1. A user signs up as a **Customer** or **Technician**.
2. A technician lists a repair service. It stays **pending** until an admin approves it.
3. Customers browse approved services and send a **repair request**.
4. The technician moves the job through the status pipeline and sets the **final amount** on completion.
5. The customer pays through **Stripe Checkout**. The payment is recorded and the job is marked **Paid**.

---

## 🔑 Roles & Permissions

| Capability | Customer | Technician | Admin |
| --- | :---: | :---: | :---: |
| Browse services | ✅ | ✅ | ✅ |
| Send repair request | ✅ | ❌ | ❌ |
| Add / edit / delete own services | ❌ | ✅ | ❌ |
| Update job status | ❌ | ✅ (own jobs) | ❌ |
| Cancel a `requested` booking | ✅ (own) | ❌ | ❌ |
| Pay for completed job | ✅ (own) | ❌ | ❌ |
| Approve / reject services | ❌ | ❌ | ✅ |
| Manage user roles | ❌ | ❌ | ✅ |
| View all bookings & transactions | ❌ | ❌ | ✅ |

---

## 🧰 Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js (App Router) |
| UI | React, Tailwind CSS |
| Authentication | BetterAuth + MongoDB adapter |
| Payments | Stripe Checkout (test mode) |
| Image hosting | ImgBB API |
| Backend | Express.js + MongoDB (separate repo) |
| Deployment | Vercel |

---

## 📦 NPM Packages Used

> ⚠️ Open your `package.json` and make this list match exactly. Remove anything you didn't use and add anything missing.

| Package | Purpose |
| --- | --- |
| `next` | React framework (App Router) |
| `react`, `react-dom` | UI library |
| `better-auth` | Authentication & session management |
| `mongodb` | Database driver for the BetterAuth adapter |
| `tailwindcss` | Utility-first styling |
| `axios` / `fetch` | API requests |
| `sonner` / `react-hot-toast` | Toast notifications |
| `react-hook-form` | Form handling & validation |
| `lucide-react` / `react-icons` | Icons (including the X logo) |
| `recharts` | Dashboard charts |
| `@stripe/stripe-js` | Stripe client |
| `@heroui/react` / `daisyui` / `shadcn/ui` | UI component library |

---

## 🗺️ Route Map

| Route | Access |
| --- | --- |
| `/` | Public |
| `/services`, `/services/[id]` | Public |
| `/about` | Public |
| `/sign-in`, `/sign-up` | Public (logged-in users are redirected) |
| `/payment/success`, `/payment/cancel` | Customer |
| `/dashboard/customer` · `/bookings` · `/payments` | Customer |
| `/dashboard/technician` · `/add-service` · `/my-services` · `/requests` | Technician |
| `/dashboard/admin` · `/users` · `/services` · `/bookings` · `/transactions` | Admin |
| `/dashboard/profile` | All logged-in users |
| `*` | Custom 404 |

---

## 🗂️ Project Structure

> Adjust to match your actual folders.

```
fixmate-client/
├── app/
│   ├── (public)/            # Home, services, about
│   ├── (auth)/              # sign-in, sign-up
│   ├── dashboard/           # customer, technician, admin, profile
│   ├── payment/             # success, cancel
│   ├── api/auth/[...all]/   # BetterAuth handler
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
├── components/              # Navbar, Footer, cards, modals, stats, charts
├── lib/                     # auth config, API helpers
├── public/                  # images and assets
├── middleware.ts            # route protection
└── .env.local
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000

# BetterAuth
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000

# MongoDB (BetterAuth adapter)
MONGODB_URI=your_mongodb_connection_string

# ImgBB
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key

# Stripe (publishable key only on the client)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
```

> Never commit `.env.local`. Variable names must match the ones used in your code.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A running instance of the [FixMate Server](https://github.com/YOUR_USERNAME/fixmate-server)
- MongoDB, ImgBB, and Stripe (test mode) accounts

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/fixmate-client.git
cd fixmate-client

# 2. Install dependencies
npm install

# 3. Add environment variables
cp .env.example .env.local   # then fill in your values

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Run the production build |
| `npm run lint` | Lint the codebase |

---

## ☁️ Deployment

Deployed on **Vercel**.

1. Import the repo into Vercel.
2. Add every variable from `.env.local` in **Project Settings → Environment Variables**, using production URLs.
3. Add the production domain to BetterAuth **trusted origins** and to the server's **CORS allowed origins**.
4. Redeploy.

---

## 🔗 Related Repository

**⚙️ FixMate Server (Express + MongoDB + Stripe):** https://github.com/YOUR_USERNAME/fixmate-server

---

## 👨‍💻 Author

**Your Name**
- GitHub: [USERNAME](https://github.com/shahed-ab)
- LinkedIn: [linkedin](https://www.linkedin.com/in/abushahed/)
---

<div align="center">

⭐ If you like this project, please give it a star!

</div>
