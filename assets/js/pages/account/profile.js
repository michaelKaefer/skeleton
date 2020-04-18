import Dropzone from 'dropzone';
import flasher from '../../modules/flasher';
import validator from '../../modules/validator';
import dropzoneConfiguration from '../../_dropzone';

/**
 * Form validation
 */
validator.validateForm('form[name="profile"]');

/**
 * Dropzone for avatar
 */
Dropzone.autoDiscover = false;
const el = document.querySelector('.avatar');
dropzoneConfiguration.setDescription(el.dataset.description);
/* eslint-disable no-new */
new Dropzone(el, {
  ...dropzoneConfiguration.get(),
  init() {
    this.on('error', (file, data) => {
      if (data.detail) {
        this.emit('error', file, data.detail);
      }
      flasher.error(el.dataset.error);
    });
    this.on('success', async (file, data) => {
      const { url } = data;
      document.getElementById('js-avatar').src = url;
      flasher.success(el.dataset.success);
      this.removeFile(file);
    });
  },
});

/**
 * Switch between profile types "Person" and "Organization"
 */
const switcher = document.querySelector('.js-profile-type-switch');
switcher.addEventListener('click', (event) => {
  // event.preventDefault();
  // event.stopPropagation();

  // if (event.target.nodeName)
  if (event.target.nodeName !== 'INPUT') {
    return;
  }

  const form = document.querySelector('form[name="profile"]');
  const inputs = form.querySelectorAll('input');

  if (form.querySelector(':invalid') !== null) {
    inputs.forEach((input) => {
      input.focus();
      input.blur();
    });
  } else {
    console.log(event.target);
    // const type = event.cur
    // rentTarget.dataset.value;
    // const { message } = event.currentTarget.parentElement.parentElement.dataset;
    //
    // const { value } = await flasher.confirm(message);
    // if (value !== true) {
    //   return;
    // }
    //
    // const typeInput = document.querySelector('input[name="profile[type]"]');
    // typeInput.value = type;
    //
    // const firstNameInput = document.querySelector('input[name="profile[person][firstName]"]');
    // if (firstNameInput !== null) {
    //   firstNameInput.value = '-';
    // }
    // const lastNameInput = document.querySelector('input[name="profile[person][lastName]"]');
    // if (lastNameInput !== null) {
    //   lastNameInput.value = '-';
    // }
    // const nameInput = document.querySelector('input[name="profile[organization][name]"]');
    // if (nameInput !== null) {
    //   nameInput.value = '-';
    // }
    //
    // form.submit();
  }
});
// const container = document.getElementById('js-is-organization');
// const radios = container.querySelectorAll('label');
//
// radios.forEach((radio) => {
//   radio.addEventListener('click', async (event) => {
//     event.preventDefault();
//     event.stopPropagation();
//
//     const form = document.querySelector('form[name="profile"]');
//     const inputs = form.querySelectorAll('input');
//
//     if (form.querySelector(':invalid') !== null) {
//       inputs.forEach((input) => {
//         input.focus();
//         input.blur();
//       });
//     } else {
//       const type = event.currentTarget.dataset.value;
//       const { message } = event.currentTarget.parentElement.parentElement.dataset;
//
//       const { value } = await flasher.confirm(message);
//       if (value !== true) {
//         return;
//       }
//
//       const typeInput = document.querySelector('input[name="profile[type]"]');
//       typeInput.value = type;
//
//       const firstNameInput = document.querySelector('input[name="profile[person][firstName]"]');
//       if (firstNameInput !== null) {
//         firstNameInput.value = '-';
//       }
//       const lastNameInput = document.querySelector('input[name="profile[person][lastName]"]');
//       if (lastNameInput !== null) {
//         lastNameInput.value = '-';
//       }
//       const nameInput = document.querySelector('input[name="profile[organization][name]"]');
//       if (nameInput !== null) {
//         nameInput.value = '-';
//       }
//
//       form.submit();
//     }
//   });
// });
