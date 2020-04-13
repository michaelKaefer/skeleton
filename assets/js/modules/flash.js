import '../../scss/components/_flash.scss';
import Swal from 'sweetalert2';

class Flash {
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
    this.swalMixin.fire({
      title: '<i class="fa fa-check-circle text-success"/>',
      html,
      showConfirmButton: false,
      timer: 1000,
    });
  }

  error(html) {
    this.swalMixin.fire({
      title: '<i class="fa fa-times-circle text-danger"/>',
      html,
    });
  }

  confirm(html) {
    return this.swalMixin.fire({
      title: '<i class="fa fa-exclamation-triangle text-warning"/>',
      text: html,
      // icon: 'warning',
      showCancelButton: true,
      // confirmButtonColor: '#3085d6',
      // cancelButtonColor: '#d33',
      confirmButtonText: 'Continue',
      cancelButtonText: 'Abort',
    });
  }
}

const flash = new Flash();

export default flash;

const flashes = document.querySelectorAll('.flash-message');

(async () => {
  for (let i = 0; i < flashes.length; i++) {
    const { type } = flashes[i].dataset;
    const messageHtml = flashes[i].innerHTML;

    if (i > 0) {
      // eslint-disable-next-line
      console.error(`Cannot show more than one flash per request. Dismissing flash of type "${type}" with message "${messageHtml}".`);
      continue;
    }

    switch (type) {
      case 'success':
        await flash.success(messageHtml);
        break;
      case 'error':
        await flash.success(messageHtml);
        break;
      default:
        throw new Error('Unknown profile type.');
    }
  }
})();
