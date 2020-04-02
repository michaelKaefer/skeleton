import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';
import AppRouting from './AppRouting';

const routing = new AppRouting();

// After a locale switch or on initial request for a locale (eg: /de) we set the locale
let locale = routing.defaultLocale;
const localesRegex = [...routing.supportedLocales].join('|');
const regex = new RegExp(`^/(${localesRegex})/?`);
if (regex.test(window.location.pathname)) {
  locale = window.location.pathname.match(regex)[1];
}

i18next.init({
  interpolation: { escapeValue: false },  // React already does escaping
  lng: locale,
  fallbackLng: routing.defaultLocale,
  resources: {
    en: {
      translation: {
        // Success messages
        'success__updated': 'Updated successfully!',
        'success__login': 'Logged in successfully!',
        'success__file_uploaded': 'File uploaded successfully!',
        // Error messages
        'errors__invalid_credentials': 'Invalid credentials, please try again!',
        'errors__unknown': 'Unknown error, please try again or contact us!',
        // Header
        'header__profile': 'Profile',
        'header__admin_area': 'Admin area',
        'header__logout': 'Logout',
        'header__choose_language': 'Language',
        // Login
        'login__heading': 'Login',
        'login__go_to_registration': 'Go to registration',
        'login__email_label': 'Email',
        'login__password_label': 'Password',
        'login__forgot_password': 'Forgot password',
        'login__login_button_label': 'Login',
        // Profile
        'profile__heading': 'Profile',
        'profile__go_to_registration': 'Go to registration',
        'profile__save_button_label': 'Save',
        'profile__upload_avatar': 'Upload new profile image',
        'profile__email_label': 'Email',
        'profile__email_placeholder': 'john.doe@example.com',
        'profile__is_a_organization_profile': 'Company profile',
        'profile__name_label': 'Name',
        'profile__name_placeholder': 'Acme Inc.',
        'profile__first_name_label': 'First name',
        'profile__first_name_placeholder': 'John',
        'profile__last_name_label': 'Last name',
        'profile__last_name_placeholder': 'Doe',
      },
    },
    de: {
      translation: {
        // Success messages
        'success__updated': 'Erfolgreich bearbeitet!',
        'success__login': 'Erfolgreich eingeloggt!',
        'success__file_uploaded': 'Datei erfolgreich hochgeladen!',
        // Error messages
        'errors__invalid_credentials': 'Ungültige Zugangsdaten, bitte versuchen sie es erneut!',
        'errors__unknown': 'Unbekannter Fehler, bitte versuchen Sie es erneut oder kontaktieren Sie uns!',
        // Header
        'header__profile': 'Profil',
        'header__admin_area': 'Adminbereich',
        'header__logout': 'Logout',
        'header__choose_language': 'Sprache',
        // Login
        'login__heading': 'Login',
        'login__go_to_registration': 'Zur Registrierung',
        'login__email_label': 'E-Mail',
        'login__password_label': 'Passwort',
        'login__forgot_password': 'Passwort vergessen',
        'login__login_button_label': 'Login',
        // Profile
        'profile__heading': 'Profil',
        'profile__go_to_registration': 'Zur Registrierung',
        'profile__save_button_label': 'Speichern',
        'profile__upload_avatar': 'Neues Profilbild hochladen',
        'profile__email_label': 'E-Mail',
        'profile__email_placeholder': 'max.mustermann@example.com',
        'profile__is_a_organization_profile': 'Firmenprofil',
        'profile__name_label': 'Name',
        'profile__name_placeholder': 'Firma GmbH',
        'profile__first_name_label': 'Vorname',
        'profile__first_name_placeholder': 'Max',
        'profile__last_name_label': 'Nachname',
        'profile__last_name_placeholder': 'Mustermann',
      },
    },
  },
});

ReactDOM.render(
    <I18nextProvider i18n={i18next}>
      <App routing={routing}/>
    </I18nextProvider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
