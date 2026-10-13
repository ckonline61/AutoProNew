import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import SparePartsPage from './pages/SparePartsPage';
import UsedCarsPage from './pages/UsedCarsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="spare-parts" element={<SparePartsPage />} />
          <Route path="used-cars" element={<UsedCarsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<PrivacyPolicyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="*" element={<div className="px-6 py-24 text-center"><h1 className="text-3xl font-bold">Page not found</h1><p className="my-4">The requested page does not exist.</p><Link className="text-blue-600 underline" to="/">Return home</Link></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
