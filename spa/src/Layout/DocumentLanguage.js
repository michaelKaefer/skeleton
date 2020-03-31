import './DocumentLanguage.scss';
import { useParams } from 'react-router-dom';

export default function DocumentLanguage() {
  const { locale } = useParams();

  if (locale === undefined) {
    throw Error('The current route does not contain a locale parameter.');
  }

  document.documentElement.lang = locale;

  return null;
}
