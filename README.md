# Deep Design - Interior Design Portfolio

A modern, responsive interior design portfolio website built with **Next.js**, **Tailwind CSS**, and **Framer Motion**.

## ✨ Features

- **Dynamic Project Showcase**: Filterable portfolio grid displaying projects by category (Hotel, Villa, Apartment, etc.).
- **Smooth Animations**: Elegant page transitions and scroll effects powered by Framer Motion.
- **Responsive Design**: Fully optimized for desktops, tablets, and mobile devices.
- **Admin Dashboard**: Secure backend interface for managing projects, team members, and messages.
- **Image Optimization**: Automatic image resizing and format conversion using Next.js Image.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/puruesdreamer/deepdesign.git
   cd deepdesign
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser**
   Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📂 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/             # Backend API routes
│   ├── works/           # Project detail pages
│   └── admin/           # Admin dashboard (protected)
├── components/          # Reusable UI components
│   ├── home/            # Homepage sections (Hero, Portfolio, etc.)
│   ├── layout/          # Layout components (Navbar, Footer)
│   └── admin/           # Admin-specific components
├── data/                # JSON data files (projects, team, messages)
└── lib/                 # Utility functions and shared logic
```

## 🔐 Admin Access

The project includes a hidden admin dashboard for content management. 
- **Path**: `/pur_deep_design_manager`
- **Default Password**: (Check `src/app/pur_deep_design_manager/page.tsx` or contact admin)

## 🚢 Deployment

This project is configured for seamless deployment on **Vercel**.

### Vercel Deployment (Recommended)

1. Push your code to GitHub.
2. Log in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your `deepdesign` repository.
4. Click **Deploy**. Vercel will automatically detect the Next.js configuration and build the site.
5. Your site will be live at `https://your-project-name.vercel.app`.

### Automatic Deployment

Whenever you push changes to the `main` branch, Vercel will automatically trigger a new deployment.

---

© 2026 Feng Yi Space Design. All Rights Reserved.
