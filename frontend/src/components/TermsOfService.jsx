import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex justify-start">
        <Link
          to="/"
          className="rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50"
        >
          {t('common.backToHome')}
        </Link>
      </div>

      <article className="rounded-[32px] border border-white/40 bg-white/60 p-8 shadow-xl shadow-indigo-200/30 backdrop-blur-lg">
        <h1 className="text-3xl font-semibold text-slate-900">{t('terms.title')}</h1>
        <p className="mt-2 text-sm text-slate-600">{t('terms.lastUpdated')}</p>

        <div className="mt-8 space-y-6 text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('terms.acceptance.title')}</h2>
            <p className="mt-2 leading-relaxed">{t('terms.acceptance.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('terms.service.title')}</h2>
            <p className="mt-2 leading-relaxed">{t('terms.service.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('terms.userConduct.title')}</h2>
            <p className="mt-2 leading-relaxed">{t('terms.userConduct.content')}</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>{t('terms.userConduct.item1')}</li>
              <li>{t('terms.userConduct.item2')}</li>
              <li>{t('terms.userConduct.item3')}</li>
              <li>{t('terms.userConduct.item4')}</li>
              <li>{t('terms.userConduct.item5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('terms.moderation.title')}</h2>
            <p className="mt-2 leading-relaxed">{t('terms.moderation.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('terms.anonymity.title')}</h2>
            <p className="mt-2 leading-relaxed">{t('terms.anonymity.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('terms.liability.title')}</h2>
            <p className="mt-2 leading-relaxed">{t('terms.liability.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('terms.termination.title')}</h2>
            <p className="mt-2 leading-relaxed">{t('terms.termination.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('terms.changes.title')}</h2>
            <p className="mt-2 leading-relaxed">{t('terms.changes.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('terms.contact.title')}</h2>
            <p className="mt-2 leading-relaxed">{t('terms.contact.content')}</p>
          </section>
        </div>
      </article>
    </section>
  );
}
