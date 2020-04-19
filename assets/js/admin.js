import '../scss/admin.scss';

document.querySelectorAll('input[value="ROLE_ADMIN"]').forEach((input) => {
  input.addEventListener('click', (event) => {
    // eslint-disable-next-line no-restricted-globals,no-alert
    if (input.checked && !confirm('Are you sure to make this user an admin?')) {
      event.preventDefault();
    }
  });
});

const tables = document.querySelectorAll('.table');
tables.forEach((table) => {
  table.classList.add('table-striped');
});
