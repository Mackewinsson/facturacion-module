# Spanish Invoicing Module (Facturación)

A complete Spanish invoicing system built with Next.js, fully compliant with Spanish AEAT regulations (RD 1619/2012).

## 🚀 Features

### ✅ Spanish AEAT Compliance
- **Factura completa (ordinaria)** - Full invoices with all required fields
- **Factura simplificada** - Simplified invoices for small amounts
- **Factura rectificativa** - Corrective invoices with reference tracking
- **Special VAT regimes**:
  - Exentas (Art. 20 LIVA)
  - Inversión del Sujeto Pasivo (ISP)
  - Intracomunitarias
  - Exportaciones
  - Recargo de Equivalencia
  - IRPF retention for professionals

### 🎨 User Interface
- **Collapsible sidebar** with smooth animations
- **Responsive design** for all screen sizes
- **Spanish language** throughout the interface
- **Professional dark theme** sidebar
- **Active state highlighting** for current page

### 📊 Invoice Management
- **Create new invoices** with comprehensive forms
- **Edit existing invoices** with full validation
- **View invoice details** in print-ready format
- **Search and filter** invoices by various criteria
- **Pagination** for large invoice lists

### 💰 Tax Calculations
- **Automatic tax calculations** for all Spanish VAT rates (0%, 4%, 10%, 21%)
- **Recargo de Equivalencia** calculations
- **IRPF retention** calculations for professionals
- **Multi-line invoices** with different VAT rates per line
- **Real-time totals** with detailed breakdowns

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data**: Mock data service (frontend-only)
- **Build Tool**: Turbopack

## 📁 Project Structure

```
src/
├── app/
│   ├── facturacion/           # Main invoicing module
│   │   ├── page.tsx          # Invoice list
│   │   ├── nueva/            # Create new invoice
│   │   ├── editar/[id]/      # Edit invoice
│   │   └── ver/[id]/         # View invoice
│   ├── login/                # Authentication
│   └── dashboard/            # Main dashboard
├── components/
│   ├── Sidebar.tsx           # Collapsible navigation
│   ├── LayoutWithSidebar.tsx # Layout wrapper
│   └── SpanishInvoiceForm.tsx # Main invoice form
└── lib/
    ├── mock-data.ts          # Mock data service
    └── spanish-tax-calculations.ts # Tax calculations
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/facturacion-module.git
   cd facturacion-module
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

### Login
- Use any user ID and password to access the system
- You'll be redirected directly to the facturación module

## 📋 Usage

### Creating Invoices
1. Click "Nueva Factura" from the main page
2. Fill in the comprehensive Spanish invoice form
3. Add invoice lines with different VAT rates
4. Review automatic tax calculations
5. Save the invoice

### Managing Invoices
- **View**: Click "Ver" to see invoice details
- **Edit**: Click "Editar" to modify existing invoices
- **Search**: Use the search bar to find specific invoices
- **Filter**: Filter by invoice status (All, Draft, Sent, Paid, etc.)

### Navigation
- **Sidebar**: Click the arrow button to collapse/expand
- **Menu Items**: Navigate between Facturación, Pedidos, and Dashboard
- **Logout**: Click the logout button at the bottom of the sidebar

## 🎯 Key Features

### Invoice Types
- **Ordinaria**: Complete invoices with all mandatory fields
- **Simplificada**: Simplified invoices for amounts under €400
- **Rectificativa**: Corrective invoices with reference tracking

### Special Cases
- **Exentas**: Exempt operations with legal references
- **ISP**: Reverse charge with proper legal mentions
- **Intracomunitarias**: Intra-community operations
- **Exportaciones**: Export operations
- **Recargo Equivalencia**: Special VAT regime for retailers

### Tax Calculations
- Automatic calculation of taxable base, VAT, and totals
- Support for multiple VAT rates per invoice
- Recargo de Equivalencia calculations
- IRPF retention for professional services

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Mock Data
The system uses mock data for demonstration purposes. The `MockInvoiceService` provides:
- 5 sample invoices with different types and scenarios
- CRUD operations (Create, Read, Update, Delete)
- Search and filtering capabilities
- Pagination support

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or support, please open an issue in the GitHub repository.

---

**Built with ❤️ for Spanish businesses**