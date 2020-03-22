import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {I18nextProvider} from 'react-i18next';
import i18next from 'i18next';

i18next.init({
  interpolation: { escapeValue: false },  // React already does escaping
  lng: "de",
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        "welcome": "EN Welcome to React and react-i18next"
      }
    },
    de: {
      translation: {
        "welcome": "DE Welcome to React and react-i18next"
      }
    },
  },
});
// i18n
//   .use(initReactI18next) // passes i18n down to react-i18next
//   .init({
//     resources: {
//       en: {
//         translation: {
//           "welcome": "EN Welcome to React and react-i18next"
//         }
//       },
//       de: {
//         translation: {
//           "welcome": "DE Welcome to React and react-i18next"
//         }
//       },
//     },
//     lng: "de",
//     fallbackLng: "en",
//
//     interpolation: {
//       escapeValue: false
//     }
//   });

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
