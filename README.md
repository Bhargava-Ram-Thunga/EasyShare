# Easy Share

<div align="center">

### A Modern, Secure File Sharing Platform

Fast, simple, and secure file sharing made easy. Share files with anyone using a simple code.

[Live Demo](#) · [Report Bug](https://github.com/Bhargava-Ram-Thunga/easy-share/issues) · [Request Feature](https://github.com/Bhargava-Ram-Thunga/easy-share/issues)

</div>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About

**Easy Share** is a modern web application that simplifies file sharing between users. Whether you need to share documents, images, or any other files, Easy Share provides a fast and secure way to transfer files using simple sharing codes.

Built with modern web technologies, Easy Share offers a clean, intuitive interface that works seamlessly across all devices. No registration required - just upload, share the code, and you're done.

## Features

### Core Features

- **Simple File Sharing** - Upload files and get a shareable code instantly
- **Secure Transfers** - End-to-end encrypted file transfers
- **No Registration Required** - Start sharing immediately without creating an account
- **Code-Based Access** - Share files using simple, easy-to-remember codes
- **Real-time Progress** - Track upload and download progress in real-time
- **File History** - Keep track of your shared and received files
- **Multi-File Support** - Share multiple files at once
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices

### Security Features

- Secure file transfers
- Privacy-focused design
- No data retention after transfer
- Terms of service and privacy policy compliance

## Tech Stack

Easy Share is built using modern, industry-standard technologies:

### Frontend

- **[React 19](https://react.dev/)** - UI library for building interactive interfaces
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Next-generation frontend tooling
- **[React Router](https://reactrouter.com/)** - Declarative routing for React
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[clsx](https://github.com/lukeed/clsx)** & **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Efficient className management

### Development Tools

- **ESLint** - Code linting and quality
- **TypeScript ESLint** - TypeScript-specific linting rules
- **PostCSS** - CSS transformations
- **Autoprefixer** - Automatic vendor prefixing

## Getting Started

Follow these steps to get Easy Share running on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**

You can check your versions with:

```bash
node --version
npm --version
```

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Bhargava-Ram-Thunga/easy-share.git
cd easy-share
```

2. **Navigate to the frontend directory**

```bash
cd frontend
```

3. **Install dependencies**

Using npm:

```bash
npm install
```

Using yarn:

```bash
yarn install
```

Using pnpm:

```bash
pnpm install
```

### Running the Application

1. **Start the development server**

```bash
npm run dev
```

2. **Open your browser**

Navigate to [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal)

3. **Start sharing files!**

The application will automatically reload when you make changes to the code.

### Build for Production

To create a production-ready build:

```bash
npm run build
```

The optimized files will be generated in the `dist` directory.

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
easy-share/
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static assets (images, fonts, etc.)
│   │   ├── components/      # React components
│   │   │   ├── common/      # Reusable common components
│   │   │   ├── layout/      # Layout components (Header, Footer, etc.)
│   │   │   ├── receiving/   # Components for receiving files
│   │   │   └── sharing/     # Components for sharing files
│   │   ├── contexts/        # React Context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility libraries
│   │   ├── pages/           # Page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── SharePage.tsx
│   │   │   ├── ReceivePage.tsx
│   │   │   ├── FilesPage.tsx
│   │   │   ├── HistoryPage.tsx
│   │   │   ├── PrivacyPage.tsx
│   │   │   └── TermsPage.tsx
│   │   ├── store/           # State management
│   │   ├── styles/          # Global styles
│   │   ├── types/           # TypeScript type definitions
│   │   ├── App.tsx          # Main App component
│   │   ├── main.tsx         # Application entry point
│   │   └── index.css        # Global CSS
│   ├── public/              # Public static files
│   ├── index.html           # HTML entry point
│   ├── package.json         # Dependencies and scripts
│   ├── tsconfig.json        # TypeScript configuration
│   ├── vite.config.ts       # Vite configuration
│   └── tailwind.config.js   # Tailwind CSS configuration
└── README.md                # This file
```

## Usage

### Sharing Files

1. **Navigate to the Share page** by clicking "Share Files" on the homepage
2. **Upload your files** by dragging and dropping or clicking to browse
3. **Get your share code** - A unique code will be generated
4. **Share the code** with the recipient via email, message, or any other method

### Receiving Files

1. **Navigate to the Receive page** by clicking "Receive Files" on the homepage
2. **Enter the share code** provided by the sender
3. **Download your files** - Files will be available for download immediately

### Managing Files

- **Files Page** - View all files you've shared or received
- **History Page** - Track your file sharing history and statistics

## Screenshots

_Screenshots coming soon..._

<!-- Add screenshots of your application here -->

## Contributing

We welcome contributions to Easy Share! Here's how you can help:

### Reporting Bugs

If you find a bug, please create an issue with:

- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (browser, OS, etc.)

### Suggesting Features

Have an idea for a new feature? Create an issue with:

- A clear description of the feature
- Why it would be useful
- Any implementation ideas you might have

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

Please ensure your code:

- Follows the existing code style
- Includes appropriate tests
- Updates documentation as needed
- Passes all linting checks (`npm run lint`)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

**Project Maintainer** - [@Bhargava-Ram-Thunga](https://github.com/Bhargava-Ram-Thunga)

**Project Link** - [https://github.com/Bhargava-Ram-Thunga/easy-share](https://github.com/Bhargava-Ram-Thunga/easy-share)

---

<div align="center">

Made with ❤️ by the Easy Share Team

[⬆ back to top](#easy-share)

</div>
