import { formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';

const locales = { en: enUS, fr };

export function formatRelativeTime(date, language = 'fr') {
  const now = new Date();
  const commentDate = new Date(date);
  const minutesDiff = differenceInMinutes(now, commentDate);
  
  if (minutesDiff < 10) {
    return language === 'fr' ? 'à l\'instant' : 'just now';
  }
  
  const locale = locales[language] || locales.fr;
  return formatDistanceToNow(commentDate, { addSuffix: true, locale });
}

export function formatDate(date, language = 'fr') {
  const locale = locales[language] || locales.fr;
  return new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}
