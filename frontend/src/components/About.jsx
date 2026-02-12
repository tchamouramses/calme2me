import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function About() {
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
        <h1 className="text-3xl font-semibold text-slate-900">{t('about.title')}</h1>

        <div className="mt-8 space-y-8 text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('about.mission.title')}</h2>
            <p className="mt-3 leading-relaxed">{t('about.mission.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('about.vision.title')}</h2>
            <p className="mt-3 leading-relaxed">{t('about.vision.content')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('about.values.title')}</h2>
            <p className="mt-3 leading-relaxed">{t('about.values.intro')}</p>
            <ul className="mt-4 space-y-3">
              <li className="flex gap-3">
                <span className="flex-shrink-0 rounded-full bg-indigo-100 p-1">
                  <svg className="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-slate-800">{t('about.values.item1.title')}</p>
                  <p className="text-sm text-slate-600">{t('about.values.item1.desc')}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 rounded-full bg-indigo-100 p-1">
                  <svg className="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-slate-800">{t('about.values.item2.title')}</p>
                  <p className="text-sm text-slate-600">{t('about.values.item2.desc')}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 rounded-full bg-indigo-100 p-1">
                  <svg className="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-slate-800">{t('about.values.item3.title')}</p>
                  <p className="text-sm text-slate-600">{t('about.values.item3.desc')}</p>
                </div>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('about.features.title')}</h2>
            <p className="mt-3 leading-relaxed">{t('about.features.intro')}</p>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              <li className="flex items-center gap-2">
                <span className="text-indigo-500">✓</span>
                <span>{t('about.features.item1')}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-500">✓</span>
                <span>{t('about.features.item2')}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-500">✓</span>
                <span>{t('about.features.item3')}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-500">✓</span>
                <span>{t('about.features.item4')}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-500">✓</span>
                <span>{t('about.features.item5')}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-500">✓</span>
                <span>{t('about.features.item6')}</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800">{t('about.cta.title')}</h2>
            <p className="mt-3 leading-relaxed">{t('about.cta.content')}</p>
            <Link
              to="/"
              className="mt-4 inline-block rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-300/40 transition hover:bg-indigo-600"
            >
              {t('about.cta.button')}
            </Link>
          </section>
        </div>
      </article>
    </section>
  );
}
