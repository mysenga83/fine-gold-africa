import type { ReactNode } from 'react';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import SourcingPage from './pages/SourcingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import GovernancePage from './pages/GovernancePage';
import InvestorRelationsPage from './pages/InvestorRelationsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WalletPage from './pages/WalletPage';
import OrdersPage from './pages/OrdersPage';
import KYCPage from './pages/KYCPage';
import PurchasePage from './pages/PurchasePage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import BuyGoldPage from './pages/BuyGoldPage';
import BuyerGuidePage from './pages/BuyerGuidePage';
import PriceChartsPage from './pages/PriceChartsPage';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  { name: 'Home',               path: '/',                   element: <HomePage />,              public: true },
  { name: 'Buy Gold',           path: '/buy-gold',           element: <BuyGoldPage />,           public: true },
  { name: 'Our Products',       path: '/catalog',            element: <CatalogPage />,           public: true },
  { name: 'Buyer Guide',        path: '/buyer-guide',        element: <BuyerGuidePage />,        public: true },
  { name: 'Price Charts',       path: '/price-charts',       element: <PriceChartsPage />,       public: true },
  { name: 'Trust & Sourcing',   path: '/sourcing',           element: <SourcingPage />,          public: true },
  { name: 'Governance',         path: '/governance',         element: <GovernancePage />,        public: true },
  { name: 'Investor Relations', path: '/investor-relations', element: <InvestorRelationsPage />, public: true },
  { name: 'About Us',           path: '/about',              element: <AboutPage />,             public: true },
  { name: 'Contact',            path: '/contact',            element: <ContactPage />,           public: true },
  { name: 'Login',              path: '/login',              element: <LoginPage />,             public: true },
  { name: 'Register',           path: '/register',           element: <RegisterPage />,          public: true },
  { name: 'Payment Success',    path: '/payment-success',    element: <PaymentSuccessPage />,    public: true },
  { name: 'Admin',              path: '/admin',              element: <AdminPage /> },
  { name: 'Dashboard',          path: '/dashboard',          element: <DashboardPage /> },
  { name: 'Wallet',             path: '/wallet',             element: <WalletPage /> },
  { name: 'Orders',             path: '/orders',             element: <OrdersPage /> },
  { name: 'KYC',                path: '/kyc',                element: <KYCPage /> },
  { name: 'Purchase',           path: '/purchase',           element: <PurchasePage /> },
];
