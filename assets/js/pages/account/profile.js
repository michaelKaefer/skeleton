import '../../../scss/pages/account/profile.scss';
import Dropzone from 'dropzone';
import flasher from '../../modules/flasher';
import validator from '../../modules/validator';
import dropzoneConfiguration from '../../_dropzone';
import client from '../../modules/client';

const addAddressButton = document.querySelector('.js-add-address');
addAddressButton.addEventListener('click', async () => {
  let addressFormHtml;
  try {
    const response = await client.get('/de/address/new');
    addressFormHtml = response.payload.content;
  } catch (e) {
    /* eslint-disable no-console */
    console.error('Could not load address form', e);
    return;
  }

  await flasher.formModal('form[name="address"]', addressFormHtml, (response) => {
    const { content: address } = response.payload.address;

    const template = document.querySelector('.js-address-template');
    const div = template.cloneNode(true);

    let { innerHTML } = div;

    innerHTML = innerHTML.replace('__address__', address);
    innerHTML = innerHTML.replace('__address_edit_link__', '#');
    innerHTML = innerHTML.replace('__address_delete_link__', '#');
    div.innerHTML = innerHTML;

    div.classList.remove('d-none');
    div.classList.remove('js-address-template');

    template.parentElement.appendChild(div);
  });
});
//
//
// function addTagForm($collectionHolder, $newLinkLi) {
//   // Get the data-prototype explained earlier
//   var prototype = $collectionHolder.data('prototype');
//
//   // get the new index
//   var index = $collectionHolder.data('index');
//
//   var newForm = prototype;
//   // You need this only if you didn't set 'label' => false in your tags field in TaskType
//   // Replace '__name__label__' in the prototype's HTML to
//   // instead be a number based on how many items we have
//   // newForm = newForm.replace(/__name__label__/g, index);
//
//   // Replace '__name__' in the prototype's HTML to
//   // instead be a number based on how many items we have
//   newForm = newForm.replace(/__name__/g, index);
//
//   // increase the index with one for the next item
//   $collectionHolder.data('index', index + 1);
//
//   // Display the form in the page in an li, before the "Add a tag" link li
//   var $newFormLi = $('<div class="col-md-6"></div>').append(newForm);
//   $newLinkLi.before($newFormLi);
// }
//
//
//
// var $collectionHolder;
//
// // setup an "add a tag" link
// var $addTagButton = $('.add_tag_link');
// var $newLinkLi = $('<div class="col-md-6"></div>');
//
// $(document).ready(function() {
//   // Get the ul that holds the collection of tags
//   $collectionHolder = $('.js-addresses');
//
//   // add the "add a tag" anchor and li to the tags ul
//   $collectionHolder.append($newLinkLi);
//
//   // count the current form inputs we have (e.g. 2), use that as the new
//   // index when inserting a new item (e.g. 2)
//   $collectionHolder.data('index', $collectionHolder.find('input').length);
//
//   $addTagButton.on('click', function(e) {
//     // add a new tag form (see next code block)
//     addTagForm($collectionHolder, $newLinkLi);
//   });
// });
//
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
      document.getElementById('js-avatar').style.dislay = 'block';
      document.getElementById('js-avatar').src = url;
      flasher.success(el.dataset.success);
      this.removeFile(file);
    });
  },
});

/**
 * Switch between profile types "Person" and "Organization"
 */
document.querySelector('.js-profile-type-switch .js-left-label').addEventListener('click', () => {
  document.querySelector('.js-profile-type-switch .custom-control-input').click();
});
const switcher = document.querySelector('.js-profile-type-switch');
switcher.addEventListener('click', async (event) => {
  if (event.target.nodeName !== 'INPUT') {
    return;
  }

  const form = document.querySelector('form[name="profile"]');
  const inputs = form.querySelectorAll('input');

  if (form.querySelector(':invalid') !== null) {
    event.preventDefault();
    event.stopPropagation();

    inputs.forEach((input) => {
      input.focus();
      input.blur();
    });

    switcher.querySelector('.invalid-feedback').style.display = 'block';
  } else {
    const input = switcher.querySelector('input');
    const { message } = input.parentElement.parentElement.parentElement.dataset;

    if (!message) {
      /* eslint-disable no-console */
      console.error('No message found in element: ', document.getElementById('is-organization').parentElement.parentElement.parentElement);
    }

    const { value } = await flasher.confirm(message);
    if (value !== true) {
      return;
    }

    const type = input.checked ? 'ORGANIZATION' : 'PERSON';

    const typeInput = document.querySelector('input[name="profile[type]"]');
    typeInput.value = type;

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
  }
});
