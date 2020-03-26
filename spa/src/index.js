import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {I18nextProvider} from 'react-i18next';
import i18next from 'i18next';

i18next.init({
  interpolation: { escapeValue: false },  // React already does escaping
  lng: 'de',
  fallbackLng: 'en',
  resources: {
    en: {
      translation: {
        // Header
        'profile': 'Profile',
        'admin_area': 'Admin area',
        'logout': 'Logout',
        'choose_language': 'Language',
        // Login
        'heading': 'Login',
        'go_to_registration': 'Go to registration',
        'email_label': 'Email',
        'password_label': 'Password',
        'forgot_password': 'Forgot password',
        'login_button_label': 'Login',
      },
    },
    de: {
      translation: {
        // Header
        'profile': 'Profil',
        'admin_area': 'Adminbereich',
        'logout': 'Logout',
        'choose_language': 'Sprache',
        // Login
        'heading': 'Login',
        'go_to_registration': 'Zur Registrierung',
        'email_label': 'E-Mail',
        'password_label': 'Passwort',
        'forgot_password': 'Passwort vergessen',
        'login_button_label': 'Login',
      },
    },
  },
});

ReactDOM.render(
    <I18nextProvider i18n={i18next}>
      <App/>
    </I18nextProvider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
