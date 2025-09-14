# CreditFlow - Credit Card Management System

A modern, responsive credit card management dashboard built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **Dashboard Overview**: Real-time credit limit, outstanding balance, and rewards tracking
- **Card Application**: Multi-step form with comprehensive validation
- **Transaction Management**: Paginated transaction history with filters and search
- **Payment Processing**: Secure payment interface with multiple options
- **Profile Management**: User profile with editable personal information

### Design & UX
- **Dual Theme Support**: Seamless light/dark mode switching
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Glass morphism effects with subtle animations
- **Micro-interactions**: Framer Motion powered hover states and transitions
- **Accessibility**: WCAG AA compliant with proper contrast ratios

### Technical Highlights
- **React 18** with TypeScript for type safety
- **React Hook Form + Zod** for robust form validation
- **TanStack Query** for efficient data fetching and caching
- **Framer Motion** for smooth animations and transitions
- **Headless UI** for accessible component primitives
- **Tailwind CSS** with custom design system

## 🎨 Design System

### Color Palette
```css
/* Primary Brand */
--primary: #4e54c8 (Indigo)
--accent: #14b8a6 (Teal)

/* Status Colors */
--success: #22c55e (Green)
--warning: #f59e0b (Amber)
--error: #ef4444 (Red)

/* Neutral Grays */
--gray-50 to --gray-900 (Full spectrum)
```

### Typography
- **Font Family**: Inter (Primary UI font)
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- **Scale**: Modular scale with proper hierarchy

### Spacing & Layout
- **Base Unit**: 8px spacing system
- **Border Radius**: 12px for cards, 8px for buttons
- **Shadows**: Layered shadow system for depth

## 📱 Components

### UI Components
- `StatCard` - Animated statistics display
- `TransactionsTable` - Paginated transaction list
- `ApplyCardForm` - Multi-step application form
- `Sidebar` - Collapsible navigation
- `TopNav` - User menu and theme toggle

### Layout Components
- `Layout` - Main app shell
- `Dashboard` - Overview page
- `Transactions` - Transaction management
- `Payments` - Payment processing
- `Profile` - User settings

## 🛠 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Modern browser with ES6+ support

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd creditflow
npm install
```

2. **Start development server**
```bash
npm run dev
```

3. **Open in browser**
```
http://localhost:5173
```

### Demo Credentials
```
Email: john.doe@example.com
Password: password123
```

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── forms/          # Form components
│   ├── layout/         # Layout components
│   ├── tables/         # Table components
│   └── ui/             # Basic UI elements
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── layouts/            # Page layouts
├── pages/              # Route components
├── styles/             # Global styles and themes
└── data/              # Static data and constants
```

## 🎯 Performance Optimizations

- **Code Splitting**: Lazy-loaded routes and components
- **Image Optimization**: Responsive images with proper sizing
- **Caching Strategy**: React Query for intelligent data caching
- **Bundle Size**: Tree-shaking and minimal dependencies
- **Loading States**: Skeleton loaders and progressive enhancement

## 🔒 Security Features

- **Input Validation**: Comprehensive Zod schemas
- **PAN Masking**: Secure display of sensitive data
- **XSS Protection**: Sanitized user inputs
- **Type Safety**: Full TypeScript coverage

## 📈 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Document management system
- [ ] Chat support integration
- [ ] Mobile app (React Native)
- [ ] API integration layer

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**