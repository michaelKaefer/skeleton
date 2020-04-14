import Dropzone from 'dropzone';
import flasher from '../../modules/flasher';
import dropzoneConfiguration from '../../_dropzone';

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

const container = document.getElementById('js-is-organization');
const radios = container.querySelectorAll('label');

radios.forEach((radio) => {
  radio.addEventListener('click', async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const type = event.currentTarget.dataset.value;

    const { value } = await flasher.confirm('change_profile_type');
    if (value !== true) {
      return;
    }

    const typeInput = document.querySelector('input[name="profile[type]"]');
    typeInput.value = type;

    const form = document.querySelector('form[name="profile"]');

    const firstNameInput = document.querySelector('input[name="profile[person][firstName]"]');
    if (firstNameInput !== null) {
      firstNameInput.value = '-';
    }
    const lastNameInput = document.querySelector('input[name="profile[person][lastName]"]');
    if (lastNameInput !== null) {
      lastNameInput.value = '-';
    }
    const nameInput = document.querySelector('input[name="profile[organization][name]"]');
    if (nameInput !== null) {
      nameInput.value = '-';
    }

    form.submit();
  });
});
