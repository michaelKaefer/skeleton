import Profile from './Components/Pages/Profile';
import Login from './Components/Pages/Login';

export default class AppRouting {
  constructor() {
    this.supportedLocales = new Set(['en', 'de']);
    this.defaultLocale = 'en';
    this.routes = {
      profile: {
        path: {
          en: 'profile',
          de: 'profil',
        },
        component: Profile,
      },
      login: {
        path: {
          en: 'login',
          de: 'login',
        },
        component: Login,
      },
    };
  }

  getPathRegex(route) {
    const locale = `:locale(${[...this.supportedLocales].join('|')})`;
    const path = Object.values(this.routes[route].path).join('|');
    return `/${locale}/(${path})`;
  }

  getRelativeUrl(locale, route) {
    return `/${locale}/${this.routes[route].path[locale]}`;
  }
}
