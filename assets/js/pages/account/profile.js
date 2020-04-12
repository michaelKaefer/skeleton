const container = document.getElementById('js-is-company');
const radios = container.querySelectorAll('label');

const personElement = document.querySelector('.person');
const companyElement = document.querySelector('.company');

radios.forEach((radio) => {
  radio.addEventListener('click', async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const type = event.currentTarget.dataset.value;
    document.querySelector('input[name="profile[type]"]').value = type;

    await radios.forEach((r) => r.classList.remove('active'));
    event.currentTarget.classList.add('active');

    switch (type) {
      case 'PERSON':
        personElement.classList.remove('d-none');
        companyElement.classList.add('d-none');
        break;
      case 'COMPANY':
        companyElement.classList.remove('d-none');
        personElement.classList.add('d-none');
        break;
    }
  });
});
