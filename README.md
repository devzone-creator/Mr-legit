# Mr. Legit - Premium Fashion E-commerce Platform

A modern, full-featured e-commerce platform built with React, TypeScript, and Supabase, designed specifically for premium men's fashion and iPhone accessories in Ghana.

## 🚀 Features

### Customer Features
- **User Authentication**: Secure registration and login system
- **Product Browsing**: Browse products by categories with advanced filtering
- **Shopping Cart**: Add/remove items, update quantities, persistent cart
- **Wishlist**: Save favorite items for later
- **Search**: Real-time product search functionality
- **Checkout Process**: Complete order flow with delivery information
- **Payment Integration**: Mobile Money (MoMo) and card payment options
- **Order Tracking**: View order history and status updates
- **Responsive Design**: Optimized for all devices

### Admin Features
- **Protected Admin Dashboard**: Role-based access control
- **Product Management**: Add, edit, delete products with image uploads
- **Order Management**: View and update order statuses
- **Customer Management**: View customer profiles and order history
- **Real-time Notifications**: Get notified of new orders instantly
- **Analytics Dashboard**: Track sales, revenue, and customer metrics
- **Inventory Management**: Track stock levels and product variants

### Technical Features
- **Real-time Updates**: Live order notifications and status updates
- **Error Handling**: Comprehensive error boundaries and validation
- **Performance Optimized**: Lazy loading, caching, and optimized queries
- **Security**: Row-level security, protected routes, input validation
- **Responsive UI**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **State Management**: React Hooks
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Ready for Netlify/Vercel

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mr-legit-store
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the migration files in the `supabase/migrations` folder
   - Configure authentication settings

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

### Tables
- **profiles**: User profiles with contact and location information
- **products**: Product catalog with variants, pricing, and inventory
- **categories**: Product categories and organization
- **orders**: Customer orders with delivery and payment information
- **order_items**: Individual items within orders

### Security
- Row Level Security (RLS) enabled on all tables
- Role-based access control (customer/admin)
- Secure API endpoints with authentication

## 🔐 Authentication & Authorization

### User Roles
- **Customer**: Can browse, purchase, and manage their orders
- **Admin**: Full access to dashboard, product management, and order processing

### Security Features
- JWT-based authentication
- Password hashing and validation
- Protected routes and API endpoints
- Input sanitization and validation

## 💳 Payment Integration

### Supported Methods
- **Mobile Money (MoMo)**: MTN, Vodafone, AirtelTigo
- **Card Payments**: Visa, Mastercard
- **Payment Processing**: Secure payment flow with confirmation

## 📱 Mobile Responsiveness

- Mobile-first design approach
- Touch-friendly interface
- Optimized for all screen sizes
- Progressive Web App (PWA) ready

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deployment Options
- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your GitHub repository
- **Custom Server**: Serve the `dist` folder with any web server

### Environment Setup
Ensure all environment variables are configured in your deployment platform.

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Product browsing and search
- [ ] Cart functionality
- [ ] Checkout process
- [ ] Payment flow
- [ ] Admin dashboard access
- [ ] Order management
- [ ] Mobile responsiveness

## 📈 Performance Optimization

- Lazy loading for images and components
- Optimized database queries
- Caching strategies
- Minified production builds
- CDN-ready assets

## 🔧 Development

### Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── lib/           # Utilities and configurations
├── hooks/         # Custom React hooks
├── utils/         # Helper functions
└── types/         # TypeScript type definitions
```

### Code Style
- ESLint configuration for code quality
- Prettier for code formatting
- TypeScript for type safety
- Consistent naming conventions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🎯 Roadmap

### Phase 1 ✅
- [x] User authentication and profiles
- [x] Product catalog and management
- [x] Shopping cart and wishlist
- [x] Order processing
- [x] Admin dashboard

### Phase 2 (Future)
- [ ] Advanced analytics
- [ ] Email notifications
- [ ] Inventory alerts
- [ ] Customer reviews and ratings
- [ ] Promotional codes and discounts
- [ ] Multi-language support

---

**Mr. Legit** - Redefining fashion e-commerce in Ghana 🇬🇭