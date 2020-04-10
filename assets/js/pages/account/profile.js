let switcher = document.getElementById('is-company');
let switcherLabel = document.querySelector('label[for="is-company"]');

let personElement = document.querySelector('.person');
let companyElement = document.querySelector('.company');

switcher.addEventListener('click', (event) => {
  if (event.currentTarget.checked) {
    personElement.classList.remove('d-none');
    companyElement.classList.add('d-none');
    switcherLabel.innerHTML = 'person';
  } else {
    personElement.classList.add('d-none');
    companyElement.classList.remove('d-none');
    switcherLabel.innerHTML = 'company';
  }
});