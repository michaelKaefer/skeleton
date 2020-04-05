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
        'form_error__email_invalid': 'Must be a valid email address',
        'form_error__email_less_than_100_characters': 'Email must be less than 100 characters',
        'form_error__email_required': 'An email is required',
        'form_error__password_minimum_6_characters': 'Password must have at least 6 characters',
        'form_error__password_required': 'A password is required',
        'form_error__agree_terms_and_data_privacy_required': 'The terms and the data privacy must be accepted.',
        // Header
        'header__profile': 'Profile',
        'header__admin_area': 'Admin area',
        'header__logout': 'Logout',
        'header__choose_language': 'Language',
        // Registration
        'registration__heading': 'Registration',
        'registration__go_to_login': 'Got to login',
        'registration__email_label': 'Email',
        'registration__email_placeholder': 'john.doe@example.com',
        'registration__password_label': 'Password',
        'registration__agree_terms_and_data_privacy_label': 'I have read and accepted the <a href="{{ terms_url }}">commercial terms and conditions</a> and the <a href="{{ data_privacy_url }}">privacy policy</a>.',
        'registration__newsletter_label': 'I want to subscribe to the newsletter.',
        'registration__save_button_label': 'Register',
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
        'profile__please_confirm_your_account': 'We sent you an email, please confirm your account!',
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
        'form_error__email_invalid': 'Die eingegebene E-Mail-Adresse ist ungültig.',
        'form_error__email_less_than_100_characters': 'Die E-Mail-Adresse muss darf maximal 99 Zeichen lang sein.',
        'form_error__email_required': 'Es muss eine E-Mail-Adresse angegeben werden.',
        'form_error__password_minimum_6_characters': 'Das Passwort muss mindestens 6 Zeichen lang sein.',
        'form_error__password_required': 'Es muss ein Passwort eingegeben werden.',
        'form_error__agree_terms_and_data_privacy_required': 'Die AGB und die Datenschutzbestimmungen müssen akzeptiert werden..',
        // Header
        'header__profile': 'Profil',
        'header__admin_area': 'Adminbereich',
        'header__logout': 'Logout',
        'header__choose_language': 'Sprache',
        // Registration
        'registration__heading': 'Registrierung',
        'registration__go_to_login': 'Zum Login',
        'registration__email_label': 'E-Mail',
        'registration__email_placeholder': 'max.mustermann@example.com',
        'registration__password_label': 'Passwort',
        'registration__agree_terms_and_data_privacy_label': 'Ich habe sowohl die <a href="{{ terms_url }}">AGB</a> als auch die <a href="{{ data_privacy_url }}">Datenschutzbestimmungen</a> gelesen und akzeptiere sie.',
        'registration__newsletter_label': 'Ich melde mich für den Newsletter an.',
        'registration__save_button_label': 'Registrieren',
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
        'profile__please_confirm_your_account': 'Wir haben Ihnen ein E-Mail zugesandt, bitte bestätigen Sie Ihre Anmeldung.',
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
