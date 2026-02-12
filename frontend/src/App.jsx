import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import About from './components/About';
import AdminDashboard from './components/AdminDashboard';
import Feed from './components/Feed';
import Footer from './components/Footer';
import HomeHero from './components/HomeHero';
import Login from './components/Login';
import PrivacyPolicy from './components/PrivacyPolicy';
import ProblemDetailPage from './components/ProblemDetailPage';
import ProblemModal from './components/ProblemModal';
import ProblemPage from './components/ProblemPage';
import PseudoModal from './components/PseudoModal';
import TermsOfService from './components/TermsOfService';
import api from './api';
import zenBg from './assets/zen.webp';

function HomePage({ pseudo, onOpenProblemModal, onRequirePseudo, headerContent }) {
  return (
    <>
      <div 
        className="relative -mx-6 -mt-8 mb-4 overflow-hidden rounded-b-[48px] bg-cover bg-center"
        style={{ backgroundImage: `url(${zenBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/20 to-white/40"></div>
        <div className="relative">
          {headerContent}
          <div className="mx-auto max-w-6xl px-6 pb-4">
            <HomeHero onOpenProblemModal={onOpenProblemModal} />
          </div>
        </div>
      </div>
      <Feed pseudo={pseudo} onRequirePseudo={onRequirePseudo} />
    </>
  );
}

function App() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [pseudo, setPseudo] = useState(() => localStorage.getItem('pseudo') || '');
  const [isPseudoModalOpen, setIsPseudoModalOpen] = useState(false);
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const showPseudoActions = location.pathname !== '/admin';
  const isPseudoRequired = showPseudoActions && !pseudo;

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setCheckingAuth(false);
        return;
      }
      
      try {
        const response = await api.get('/api/me');
        setUser(response.data.user);
      } catch (err) {
        setUser(null);
        localStorage.removeItem('auth_token');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await api.post('/api/logout');
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  const handleSavePseudo = (newPseudo) => {
    setPseudo(newPseudo);
    localStorage.setItem('pseudo', newPseudo);
    setIsPseudoModalOpen(false);
  };

  const handleRequirePseudo = () => {
    if (!showPseudoActions) return;
    setIsPseudoModalOpen(true);
  };

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  useEffect(() => {
    if (isPseudoRequired) {
      setIsPseudoModalOpen(true);
    }
  }, [isPseudoRequired]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">{t('admin.loading')}</p>
      </div>
    );
  }

  const isHomePage = location.pathname === '/';

  const headerContent = (
    <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">
            {t('app.brand')}
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">{t('app.title')}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-full border border-white/60 bg-white/50 px-3 py-2 shadow-sm backdrop-blur-md">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t('nav.language')}
            </span>
            <div className="relative">
              <select
                value={i18n.language}
                onChange={(event) => changeLang(event.target.value)}
                className="appearance-none rounded-full border border-slate-200 bg-white px-4 py-1.5 pr-8 text-xs font-semibold text-slate-700 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="fr">FR</option>
                <option value="en">EN</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </div>
          {showPseudoActions && (
            <button
              type="button"
              onClick={() => setIsPseudoModalOpen(true)}
              className="rounded-full bg-white/50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-white/70"
            >
              {pseudo ? t('nav.changePseudo') : t('nav.setPseudo')}
            </button>
          )}
          {user && location.pathname === '/admin' && (
            <button
              onClick={handleLogout}
              className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-300/40 transition hover:bg-rose-600"
            >
              {t('auth.logout')}
            </button>
          )}
        </div>
      </header>
  );

  return (
    <div className="min-h-screen">
      {!isHomePage && headerContent}

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-16">
        <Routes>
          <Route
            path="/"
            element={(
              <HomePage
                pseudo={pseudo}
                onOpenProblemModal={() => setIsProblemModalOpen(true)}
                onRequirePseudo={handleRequirePseudo}
                headerContent={headerContent}
              />
            )}
          />
          <Route
            path="/myself"
            element={(
              <ProblemPage
                pseudo={pseudo}
                onRequirePseudo={handleRequirePseudo}
              />
            )}
          />
          <Route
            path="/problems/:uuid"
            element={(
              <ProblemDetailPage
                pseudo={pseudo}
                onRequirePseudo={handleRequirePseudo}
              />
            )}
          />
          <Route
            path="/admin"
            element={user ? <AdminDashboard /> : <Login onSuccess={handleLogin} />}
          />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      <ProblemModal
        isOpen={isProblemModalOpen}
        onClose={() => setIsProblemModalOpen(false)}
        pseudo={pseudo}
        onRequirePseudo={handleRequirePseudo}
      />
      <PseudoModal
        isOpen={isPseudoModalOpen}
        onClose={() => setIsPseudoModalOpen(false)}
        onSave={handleSavePseudo}
        initialValue={pseudo}
        isLocked={isPseudoRequired}
      />
    </div>
  );
}

export default App;
