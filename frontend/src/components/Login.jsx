import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';

export default function Login({ onSuccess }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/login', {
        email,
        password,
      });

      // Store token in localStorage
      localStorage.setItem('auth_token', response.data.token);
      
      onSuccess?.(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || t('errors.network'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-[40px] border border-white/40 bg-white/60 p-8 shadow-2xl shadow-indigo-200/40 backdrop-blur-xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
          {t('auth.adminAccess')}
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">{t('auth.login')}</h2>
        <p className="mt-2 text-sm text-slate-600">{t('auth.adminRequired')}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold text-indigo-700">{t('auth.email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-full border border-white/50 bg-white/70 px-5 py-3 text-slate-800 shadow-inner shadow-white/40 outline-none ring-2 ring-transparent transition focus:ring-indigo-400"
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-indigo-700">{t('auth.password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-full border border-white/50 bg-white/70 px-5 py-3 text-slate-800 shadow-inner shadow-white/40 outline-none ring-2 ring-transparent transition focus:ring-indigo-400"
            required
          />
        </div>

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-300/40 transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {loading ? t('input.submitting') : t('auth.submit')}
        </button>
      </form>
    </section>
  );
}
