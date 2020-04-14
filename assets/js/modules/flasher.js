import '../../scss/components/_flash.scss';
import Swal from 'sweetalert2';

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
      text: html,
      // icon: 'warning',
      showCancelButton: true,
      // confirmButtonColor: '#3085d6',
      // cancelButtonColor: '#d33',
      confirmButtonText: document.documentElement.lang === 'de' ? 'Weiter' : 'Continue',
      cancelButtonText: document.documentElement.lang === 'de' ? 'Abbruch' : 'Abort',
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
