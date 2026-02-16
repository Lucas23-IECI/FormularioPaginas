# Formulario Paginas

A modern, high-performance web application built with Next.js 14, React, and Tailwind CSS. This project helps users create and manage client briefing forms efficiently.

## Features

- **Dynamic Form Building**: Create custom briefing forms with ease.
- **Modern UI/UX**: clean, responsive design using Tailwind CSS.
- **Performance Optimized**: Built on Next.js for server-side rendering and static generation.
- **Database Integration**: Prisma ORM with SQLite used for data persistence (configurable for Postgres/MySQL).
- **Type Safety**: Full TypeScript support for robust development.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [SQLite](https://www.sqlite.org/index.html) (via Prisma)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Deployment**: Compatible with Vercel, Netlify, or Docker containers.

## Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (v18 or higher)
- npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Lucas23-IECI/FormularioPaginas.git
    cd FormularioPaginas
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Setup:**
    Duplicate `.env.example` to `.env` and configure your environment variables.
    ```bash
    cp .env.example .env
    ```

4.  **Database Migration:**
    Initialize the database using Prisma.
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/              # Next.js App Router pages and layouts
├── components/       # Reusable UI components
├── lib/              # Utility functions and shared logic
├── types/            # TypeScript type definitions
└── modules/          # Feature-specific modules
```

## Contributing

Contributions are welcome. Please follow these steps:
1.  Fork the repository.
2.  Create a feature branch: `git checkout -b feature/AmazingFeature`.
3.  Commit your changes: `git commit -m 'Add some AmazingFeature'`.
4.  Push to the branch: `git push origin feature/AmazingFeature`.
5.  Open a Pull Request.

## License

Distributed under the MIT License. See `LICENSE` for more information.
