import Login from './Pages/Account/Login';
import Profile from './Pages/Account/Profile';
import Registration from './Pages/Account/Registration';

export default class AppRouting {
  constructor() {
    this.supportedLocales = new Set(['en', 'de']);
    this.defaultLocale = 'en';
    this.routes = {
      login: {
        path: {
          en: 'login',
          de: 'login',
        },
        component: Login,
        authorizedRoles: null,
      },
      profile: {
        path: {
          en: 'profile',
          de: 'profil',
        },
        component: Profile,
        authorizedRoles: ['ROLE_USER', 'ROLE_ADMIN'],
      },
      registration: {
        path: {
          en: 'registration',
          de: 'registrierung',
        },
        component: Registration,
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
