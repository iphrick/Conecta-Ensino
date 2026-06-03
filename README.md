# Conecta Ensino 🎓

**Conecta Ensino** is a modern, high-performance e-learning platform built with **Next.js 16**, **React 19**, and **Firebase**. It provides a comprehensive ecosystem for both educators and students, featuring course creation, progress tracking, and automated certificate generation with public validation.

## ✨ Features

### For Students
- 🚀 **Modern Video Player**: Seamless playback with progress tracking and lateral syllabus.
- 📜 **Instant Certificates**: Automatically generates a PDF certificate upon 100% course completion.
- 🔍 **Certificate Validation**: Public page to verify certificate authenticity via a unique hash.
- 📱 **Mobile-First & Responsive**: Watch lessons on any device with a fluid, glassmorphism-inspired UI.

### For Instructors
- 🛠️ **Course Management (CRUD)**: Easy-to-use dashboard to create, edit, and organize courses.
- 📁 **Module & Lesson Organization**: Drag-and-drop or easily reorder modules.
- ☁️ **Cloud Uploads**: Upload video lessons and supplementary PDF materials directly to Firebase Storage.

### For Administrators
- 👥 **User Management**: Control user roles (Student, Instructor, Admin).
- 🏷️ **Category Management**: Create and manage course thematic categories.
- 📊 **Financial Dashboard**: View total billing reports and platform analytics.

## 💻 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend/BaaS**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Storage)
- **State Management**: [TanStack React Query](https://tanstack.com/query/latest)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm, yarn, pnpm, or bun
- A Firebase project

### 1. Clone the repository
```bash
git clone https://github.com/your-username/conecta-ensino.git
cd conecta-ensino
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Variables
Create a `.env.local` or `.env` file in the root of the project by copying `.env.example`:
```bash
cp .env.example .env.local
```
Fill in the environment variables with your Firebase configuration.

### 4. Run the Development Server
```bash
npm run dev
# or
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the platform.

## 🏗️ Project Structure
- `src/app/`: Next.js App Router pages and layouts (auth, courses, dashboard, verify-certificate).
- `src/components/`: Reusable UI components and layouts.
- `src/lib/`: Utility functions and shared helpers.
- `src/services/`: Firebase database and storage integration services.
- `firestore.rules` & `storage.rules`: Firebase security rules.

## 📜 License

This project is licensed under the MIT License.
