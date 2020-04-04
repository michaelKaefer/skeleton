import './DocumentLanguage.scss';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

export default function DocumentLanguage() {
  const { locale } = useParams();

  if (locale === undefined) {
    throw Error('The current route does not contain a locale parameter.');
  }

  useEffect(() => {
    document.documentElement.lang = locale;
  });

  return null;
}
