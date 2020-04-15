import Dropzone from 'dropzone';
import * as yup from 'yup';
import flasher from '../../modules/flasher';
import dropzoneConfiguration from '../../_dropzone';

const l = (...args) => console.log(args);

/**
 * Form validation
 */
const fields = [
  {
    id: 'email',
    selector: 'input[name="profile[email]"]',
    yup: yup
      .string()
      .email()
      .max(1/*00*/)
      .required(),
  },
];



///////////////////////////////////////////
yup.setLocale({
  mixed: {
    default: 'invalid',
  },
  string: {
    email: () => ({ key: 'email_invalid' }), // 'Must be a valid email address',
    max: ({ max }) => ({ key: 'email_too_long', values: { max } }), // 'Email must be less than 100 characters'
    required: () => ({ key: 'email_required' }), // 'An email is required',
  },
});
const schema = yup.object().shape(fields.reduce((shape, field) => {
  return {
    ...shape,
    [field.id]: field.yup,
  };
}, {}));
///////////////////////////////////////////




// const schema = yup.object().shape({
//   'name="profile[email]"': yup
//       .string()
//       .email()
//       .max(1/*00*/)
//       .required(),
//   // firstName: yup
//   //     .string(),
//   // lastName: yup
//   //     .string(),
// });

const submit = document.querySelector('form[name="profile"] button[type="submit"]');

submit.addEventListener('click', (e) => {
  e.preventDefault();





  schema.validate(fields.reduce((shape, field) => {
    return {
      ...shape,
      [field.id]: document.querySelector(field.selector).value,
    };
  }, {})).then((valid, x) => {
    l(1,valid, x); // => true
  }).catch(function(err) {
    l(err)
    err.name; // => 'ValidationError'
    err.errors; // => ['Deve ser maior que 18']
  });

  // schema.validate({
  //   'name="profile[email]"': 'jimmy@example.com',
  //   age: 11,
  // }).then((valid, x) => {
  //   l(1,valid, x); // => true
  // }).catch(function(err) {
  //   l(err)
  //   err.name; // => 'ValidationError'
  //   err.errors; // => ['Deve ser maior que 18']
  // });

  // schema
  //     .isValid({
  //       'name="profile[email]"': 'jimmy@example.com',
  //       age: 24,
  //     })
  //     .then((valid, x) => {
  //       l(1,valid, x); // => true
  //     });
  // l(132);
});

l(submit);

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
const container = document.getElementById('js-is-organization');
const radios = container.querySelectorAll('label');

radios.forEach((radio) => {
  radio.addEventListener('click', async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const type = event.currentTarget.dataset.value;
    const { message } = event.currentTarget.parentElement.parentElement.dataset;

    const { value } = await flasher.confirm(message);
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
