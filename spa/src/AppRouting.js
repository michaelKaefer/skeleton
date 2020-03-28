import Profile from './Pages/Profile';
import Login from './Pages/Login';

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
        authorizedRoles: ['ROLE_USER', 'ROLE_ADMIN'],
      },
      login: {
        path: {
          en: 'login',
          de: 'login',
        },
        component: Login,
        authorizedRoles: null,
      },
    };
  }

  getPathRegex(route) {
    const locale = `:locale(${[...this.supportedLocales].join('|')})`;
    const path = Object.values(this.routes[route].path).join('|');
    return `/${locale}/(${path})`;
  }

  getHomeRegex() {
    const locale = `:locale(${[...this.supportedLocales].join('|')})`;
    return `/${locale}/`;
  }

  getRelativeUrl(locale, route) {
    return `/${locale}/${this.routes[route].path[locale]}`;
  }
}
