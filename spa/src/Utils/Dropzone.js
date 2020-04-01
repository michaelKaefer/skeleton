import 'dropzone/dist/dropzone.css';
import Dropzone from 'dropzone';

Dropzone.autoDiscover = false;

window.onload = () => {
  const forms = document.querySelectorAll('.dropzone');

  forms.forEach(form => {
    const dropzone = new Dropzone(form, {
      headers: {
      }
    });
  });

  // console.log(Dropzone, 111, form, 222);
};


