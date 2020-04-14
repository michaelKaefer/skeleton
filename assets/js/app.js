import '../scss/app.scss';

import '@fortawesome/fontawesome-free/js/all.min';
import './_bootstrap';

import flasher from './modules/flasher';

const flashElements = Array.from(document.querySelectorAll('.flash-message')); // Collect from DOM
flasher.batch(flashElements.map((el) => ({ type: el.dataset.type, html: el.innerHTML }))); // Fire
