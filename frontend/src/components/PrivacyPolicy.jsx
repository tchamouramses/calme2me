import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
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
        <h1 className="text-3xl font-semibold text-slate-900">{t('privacy.title')}</h1>
        <p className="mt-2 text-sm text-slate-600">{t('privacy.lastUpdated')}</p>

        <div className="mt-8 space-y-6 text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('privacy.intro.title')}</h2>
            <p className="mt-2 leading-relaxed">{t('privacy.intro.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('privacy.dataCollection.title')}</h2>
            <p className="mt-2 leading-relaxed">{t('privacy.dataCollection.content')}</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>{t('privacy.dataCollection.item1')}</li>
              <li>{t('privacy.dataCollection.item2')}</li>
              <li>{t('privacy.dataCollection.item3')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('privacy.dataUsage.title')}</h2>
            <p className="mt-2 leading-relaxed">{t('privacy.dataUsage.content')}</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>{t('privacy.dataUsage.item1')}</li>
              <li>{t('privacy.dataUsage.item2')}</li>
              <li>{t('privacy.dataUsage.item3')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('privacy.aiModeration.title')}</h2>
            <p className="mt-2 leading-relaxed">{t('privacy.aiModeration.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('privacy.anonymity.title')}</h2>
            <p className="mt-2 leading-relaxed">{t('privacy.anonymity.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('privacy.cookies.title')}</h2>
            <p className="mt-2 leading-relaxed">{t('privacy.cookies.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('privacy.rights.title')}</h2>
            <p className="mt-2 leading-relaxed">{t('privacy.rights.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('privacy.contact.title')}</h2>
            <p className="mt-2 leading-relaxed">{t('privacy.contact.content')}</p>
          </section>
        </div>
      </article>
    </section>
  );
}
