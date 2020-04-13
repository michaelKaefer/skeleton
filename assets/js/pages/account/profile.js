import $ from 'jquery';

const container = document.getElementById('js-is-organization');
const radios = container.querySelectorAll('label');

const personElement = document.querySelector('.person');
const organizationElement = document.querySelector('.organization');

radios.forEach((radio) => {
  radio.addEventListener('click', async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const type = event.currentTarget.dataset.value;
    const typeInput = document.querySelector('input[name="profile[type]"]');
    typeInput.value = type;

    const form = document.querySelector('form[name="profile"]');
    const url = form.getAttribute('action');
    const method = form.getAttribute('method');

    // fetch(url, {
    //   method,
    //   headers: {
    //     // 'Content-Type': 'application/json'
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   body: new FormData({postData})
    // });

    await radios.forEach((r) => r.classList.remove('active'));
    event.currentTarget.classList.add('active');

    switch (type) {
      case 'PERSON':
        personElement.classList.remove('d-none');
        organizationElement.classList.add('d-none');
        break;
      case 'ORGANIZATION':
        organizationElement.classList.remove('d-none');
        personElement.classList.add('d-none');
        break;
      default:
        throw new Error('Unknown user type.');
    }

    // const data = {};
    // data[typeInput.getAttribute('name')] = typeInput.value;
    // data['profile[organization][name]'] = 'x';
    // console.log(123);
    $.ajax({
      url,
      type: method,
      data: $('form[name="profile"]').serialize(),
      success: (html) => {
        // Replace current position field ...
        $('form[name="profile"]').replaceWith(
          // ... with the returned one from the AJAX response.
          $(html).find('form[name="profile"]'),
        );
        // Position field now displays the appropriate positions.
      },
    });
  });
});
