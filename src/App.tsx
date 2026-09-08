import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { LightboxModal } from './components/LightboxModal';
import { AIChatbot } from './components/AIChatbotModal';

// Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { KarizmaAlbumPage } from './pages/KarizmaAlbumPage';
import { PricingPage } from './pages/PricingPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { EnquiryPage } from './pages/EnquiryPage';
import { ContactPage } from './pages/ContactPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LegalPage } from './pages/LegalPage';

import { GalleryItem, Booking } from './types';
import { Phone, MessageCircle } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, isAdmin } = useAuth();

  // Navigation State
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParam, setPageParam] = useState<string>('');

  // Modals
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingServiceSlug, setBookingServiceSlug] = useState<string | undefined>(undefined);
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Sync with browser history / hash if needed
  const navigateTo = (page: string, param?: string) => {
    setCurrentPage(page);
    setPageParam(param || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBooking = (serviceSlug?: string) => {
    setBookingServiceSlug(serviceSlug);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950">
      
      {/* Top Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        onOpenBooking={handleOpenBooking}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            onOpenBooking={handleOpenBooking}
            onOpenLightbox={(item) => setLightboxItem(item)}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage
            onNavigate={navigateTo}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {currentPage === 'services' && (
          <ServicesPage
            onNavigate={navigateTo}
            onOpenBooking={handleOpenBooking}
          />
        )}

        {currentPage === 'service-detail' && (
          <ServiceDetailPage
            serviceSlug={pageParam || 'wedding-photography'}
            onNavigate={navigateTo}
            onOpenBooking={handleOpenBooking}
          />
        )}

        {currentPage === 'gallery' && (
          <GalleryPage
            onOpenLightbox={(item) => setLightboxItem(item)}
            onOpenBooking={() => handleOpenBooking()}
          />
        )}

        {currentPage === 'karizma-albums' && (
          <KarizmaAlbumPage
            onOpenBooking={handleOpenBooking}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'pricing' && (
          <PricingPage
            onNavigate={navigateTo}
            onOpenBooking={handleOpenBooking}
          />
        )}

        {currentPage === 'reviews' && (
          <ReviewsPage
            onOpenBooking={handleOpenBooking}
            onNavigateToLogin={() => navigateTo('login')}
          />
        )}

        {currentPage === 'enquiry' && (
          <EnquiryPage
            onOpenBooking={() => handleOpenBooking()}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'contact' && (
          <ContactPage
            onOpenBooking={() => handleOpenBooking()}
            onNavigate={navigateTo}
          />
        )}

        {(currentPage === 'login' || currentPage === 'signup' || currentPage === 'admin-login') && (
          <AuthPage
            initialMode={currentPage === 'signup' ? 'signup' : 'login'}
            onNavigate={navigateTo}
            onSuccess={() => {
              if (isAdmin) {
                navigateTo('admin');
              } else {
                navigateTo('dashboard');
              }
            }}
          />
        )}

        {currentPage === 'dashboard' && (
          <DashboardPage
            onNavigateToLogin={() => navigateTo('login')}
            onOpenBooking={handleOpenBooking}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboardPage
            onNavigateToLogin={() => navigateTo('admin-login')}
          />
        )}

        {(currentPage === 'privacy' || currentPage === 'terms') && (
          <LegalPage
            type={currentPage === 'privacy' ? 'privacy' : 'terms'}
            onNavigate={navigateTo}
          />
        )}
      </main>

      {/* Floating Fast WhatsApp Action Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <a
          id="floating-whatsapp-btn"
          href="https://wa.me/918709017294?text=Hello%20Ashish%20Wedding%20Film%20Studio,%20I%20would%20like%20to%20inquire%20about%20booking%20and%20rates%20for%20my%20event."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Direct WhatsApp with Ashish Studio"
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xl shadow-emerald-900/50 hover:scale-105 transition-all border border-emerald-400/40 group"
        >
          <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
          <span className="hidden sm:inline">WhatsApp Studio</span>
        </a>
      </div>

      {/* 24/7 AI Chatbot Assistant */}
      <AIChatbot
        onOpenBooking={handleOpenBooking}
        onNavigate={navigateTo}
      />

      {/* Global Interactive Booking & Advance Payment Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialServiceSlug={bookingServiceSlug}
        onBookingComplete={(b: Booking) => {
          // Booking recorded
        }}
        onNavigateToDashboard={() => {
          setIsBookingOpen(false);
          navigateTo('dashboard');
        }}
        onNavigateToLogin={() => {
          setIsBookingOpen(false);
          navigateTo('login');
        }}
      />

      {/* Media & Video Lightbox Modal */}
      <LightboxModal
        item={lightboxItem}
        onClose={() => setLightboxItem(null)}
        onOpenBooking={() => {
          setLightboxItem(null);
          handleOpenBooking();
        }}
      />

      {/* Main Studio Footer */}
      <Footer
        onNavigate={navigateTo}
        onOpenBooking={() => handleOpenBooking()}
      />

    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
