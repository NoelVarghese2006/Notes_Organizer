# NoteFlow

> **Organize your thoughts visually, export with clarity.**

NoteFlow is a full-stack web application that transforms messy, unstructured bullet points into clean, organized notes through an intuitive visual canvas interface. Built with Next.js 16, React 19, Supabase, and Tailwind CSS 4.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel)

---

## ✨ Features

### 📥 Paste & Parse
Paste your unorganized bullet points into the import panel. NoteFlow's smart parser automatically creates individual draggable note cards. Lines ending with a colon (`:`) are automatically detected as category headers, creating new categorized columns on the canvas.

### 🎨 Visual Canvas
- **Drag & drop** note cards between categorized columns
- **Pan and zoom** the infinite canvas (scroll to zoom, click-and-drag to pan)
- **Color-coded categories** with customizable colors
- **Reorder notes** within categories using up/down controls
- **Edit or delete** notes inline

### 🗂️ Project Management
- Create multiple projects from the dashboard
- Each project has its own workspace with independent notes and categories
- Projects are persisted to Supabase and tied to your account

### 📤 Export to Markdown
Export your organized notes as clean, structured Markdown files grouped by category — perfect for documentation, planning, or sharing.

### 🔐 Authentication
- Email/password authentication powered by Supabase Auth
- Protected routes for dashboard and workspace
- Session management with server-side cookie handling

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) components |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL + Auth) |
| **Deployment** | [Vercel](https://vercel.com/) |
| **Package Manager** | npm |

---

## 📁 Project Structure

```
my-app/
├── app/                          # Next.js App Router pages
│   ├── api/health/               # Health check endpoint (Supabase keep-alive)
│   ├── auth/
│   │   ├── login/                # Login page
│   │   └── sign-up/              # Sign-up page
│   ├── dashboard/                # Project dashboard
│   ├── workspace/[id]/           # Visual workspace per project
│   ├── globals.css               # Global styles + Tailwind
│   ├── layout.tsx                # Root layout (fonts, metadata, analytics)
│   └── page.tsx                  # Landing/marketing page
├── components/
│   ├── cat-containers.tsx        # Draggable category column component
│   ├── export-dialog.tsx         # Export to Markdown dialog
│   ├── new-project-dialog.tsx    # Create project dialog
│   ├── note-card.tsx             # Individual note card (draggable, editable)
│   ├── workspace-canvas.tsx      # Main canvas (zoom, pan, column layout)
│   ├── workspace-header.tsx      # Top bar (save, export, logout)
│   ├── workspace-sidebar.tsx     # Sidebar (import panel, category list)
│   └── ui/                       # shadcn/ui primitives
├── lib/
│   ├── client.ts                 # Supabase browser client
│   ├── server.ts                 # Supabase server client (cookies)
│   ├── store.ts                  # Zustand stores (notes, categories)
│   └── utils.ts                  # Utility functions
├── proxy.ts                      # Supabase proxy configuration
├── next.config.ts                # Next.js configuration
├── package.json
└── tsconfig.json
```

---

## 🧠 How It Works

1. **Import** — Paste your bullet points into the sidebar text area. Lines ending with `:` become category columns; each bullet becomes a draggable note card.
2. **Organize** — Drag note cards between category columns on the infinite canvas. Reorder them within columns, edit content inline, or delete unwanted notes.
3. **Export** — Click "Export" to generate a clean Markdown document with all notes grouped by category, ready to copy or download.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com/) project (free tier works)

### Environment Variables

Create a `.env.local` file in the `my-app/` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/sign-up-success
```

### Installation

```bash
cd my-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Schema

The application expects the following Supabase tables:

- **`projects`** — `id`, `user_id`, `name`, `description`, `created_at`
- **`categories`** — `id`, `user_id`, `project_id`, `name`, `color`, `position_x`, `position_y`, `created_at`
- **`notes`** — `id`, `user_id`, `project_id`, `category`, `content`, `order_index`, `width`, `height`, `created_at`, `updated_at`

---

## 🚢 Deployment

The app is deployed on Vercel. A GitHub Actions workflow (`.github/workflows/main.yml`) pings the health endpoint every 3 days to keep the Supabase instance active on the free tier.

**Live demo:** [https://notes-organizer-aba.vercel.app](https://notes-organizer-aba.vercel.app)

---

## 📄 License

This project is private and not licensed for public use.