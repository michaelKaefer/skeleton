import flash from '../../modules/flash';

const container = document.getElementById('js-is-organization');
const radios = container.querySelectorAll('label');

radios.forEach((radio) => {
  radio.addEventListener('click', async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const type = event.currentTarget.dataset.value;

    const { value } = await flash.confirm('change_profile_type');
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
