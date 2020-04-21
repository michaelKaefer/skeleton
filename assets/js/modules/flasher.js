import '../../scss/components/_flash.scss';
import Swal from 'sweetalert2';
import validator from './validator';
import client from './client';

class Flasher {
  constructor() {
    this.swalMixin = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary mr-2',
        cancelButton: 'btn btn-light',
      },
      buttonsStyling: false,
    });
  }

  success(html) {
    return this.swalMixin.fire({
      title: '<i class="fa fa-check-circle text-success"/>',
      html,
      showConfirmButton: false,
      timer: 1000,
    });
  }

  error(html) {
    return this.swalMixin.fire({
      title: '<i class="fa fa-times-circle text-danger"/>',
      html,
    });
  }

  confirm(html) {
    return this.swalMixin.fire({
      title: '<i class="fa fa-info-circle text-info"/>',
      html,
      // icon: 'warning',
      showCancelButton: true,
      // confirmButtonColor: '#3085d6',
      // cancelButtonColor: '#d33',
      confirmButtonText: document.documentElement.lang === 'de' ? 'Weiter' : 'Continue',
      cancelButtonText: document.documentElement.lang === 'de' ? 'Abbruch' : 'Abort',
    });
  }

  formModal(selector, html, callback) {
    return this.swalMixin.fire({
      // title: '<i class="fa fa-info-circle text-info"/>',
      html: `<div class="form-modal">${html}</div>`,
      // icon: 'warning',
      showCancelButton: true,
      // confirmButtonColor: '#3085d6',
      // cancelButtonColor: '#d33',
      allowOutsideClick: false,
      preConfirm: () => {
        validator.validateForm(selector);

        const form = document.querySelector(selector);
        const inputs = form.querySelectorAll('input');

        if (form.querySelector(':invalid') !== null) {
          inputs.forEach((input) => {
            input.focus();
            input.blur();
          });
          return false;
          // return Swal.showValidationMessage(
          //  `Request failed`
          // );
        }

        return new FormData(form);
      },
      confirmButtonText: document.documentElement.lang === 'de' ? 'Speichern' : 'Save',
      cancelButtonText: document.documentElement.lang === 'de' ? 'Abbruch' : 'Cancel',
    }).then(async (data) => {
      const { value: formData } = data;

      let response;
      try {
        response = await client.postForm('/de/address/new', formData);
      } catch (e) {
        /* eslint-disable no-console */
        console.error(`Could not submit form "${selector}"`);
        return;
      }

      callback(response);
    });
  }

  batch(flashes) {
    const initialResolvedPromise = Promise.resolve();

    return flashes.reduce(async (previous, flash) => {
      await previous;

      switch (flash.type) {
        case 'success':
          return this.success(flash.html);
        case 'error':
          return this.error(flash.html);
        default:
          throw new Error(`Unknown profile type "${flash.type}".`);
      }
    }, initialResolvedPromise);
  }
}

export default new Flasher();
