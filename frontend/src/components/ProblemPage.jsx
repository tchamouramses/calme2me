import { useTranslation } from 'react-i18next';
import SafeInput from './SafeInput';

export default function ProblemPage({ pseudo, onRequirePseudo }) {
  const { t } = useTranslation();

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <header className="rounded-[32px] border border-white/40 bg-white/60 p-6 shadow-xl shadow-indigo-200/30 backdrop-blur-lg">
        <h2 className="text-xl font-semibold text-slate-900">{t('problemPage.title')}</h2>
        <p className="mt-2 text-sm text-slate-600">
          {t('problemPage.subtitle')}
        </p>
      </header>

      <SafeInput endpoint="/api/problems" pseudo={pseudo} onRequirePseudo={onRequirePseudo} />
    </section>
  );
}
