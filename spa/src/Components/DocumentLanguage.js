import { useParams } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';

export default function DocumentLanguage() {
  const { locale } = useParams();
  // const { i18n } = useTranslation();

  if (locale === undefined) {
    throw Error('The current route does not contain a locale parameter.');
  }

  document.documentElement.lang = locale;
  // i18n.changeLanguage(locale);

  return null;
}
