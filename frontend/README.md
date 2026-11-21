# 🎨 PolkaDocs Frontend

Client-side Progressive Web Application (PWA) for PolkaDocs, built with React 19, Vite, and Tailwind CSS.

## 🚀 Features

* **Grounded Chat Interface:** Conversational AI chat with markdown rendering, LaTeX equations, and code block formatting.
* **Source Citation Drawer:** Interactive slide-over drawer displaying exact source document chunks cited in AI responses.
* **Multi-Format Document Uploader:** Drag-and-drop document upload supporting PDF, DOCX, TXT, and Markdown files with real-time ingestion status tracking.
* **Progressive Web App (PWA):** Service worker precaching via `vite-plugin-pwa` and Workbox for fast installable mobile and desktop experiences.
* **Modern UI & Responsive Design:** Built with Tailwind CSS v4, Radix UI primitives, and Lucide icons.

## 🛠️ Tech Stack

* **Framework:** React 19 + TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS v4
* **State Management:** Zustand
* **PWA Engine:** `vite-plugin-pwa` + Workbox
* **Icons & Components:** Lucide React, Radix UI

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create `.env` in the `frontend/` directory (optional for local development, as requests to `/api` proxy to `http://localhost:3000` by default):
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### 3. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser. All `/api` requests are automatically proxied to the local backend at `http://localhost:3000`.

### 4. Scripts
* `npm run dev` — Start Vite development server with Hot Module Replacement (HMR).
* `npm run build` — Type-check and compile production bundle into `dist/`.
* `npm run lint` — Run Oxlint validation.

## 🚀 Deployment

The frontend is continuously deployed to **Vercel** with automatic preview branches and production deployments:
* **Production URL:** [https://polka-docs.vercel.app/](https://polka-docs.vercel.app/)
