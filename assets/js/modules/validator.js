class Validator {
  /* eslint-disable class-methods-use-this */
  validateField(element) {
    element.setCustomValidity('');
    element.checkValidity();
    element.parentElement.classList.add('was-validated');
  }

  /* eslint-disable class-methods-use-this */
  validateForm(formSelector) {
    const form = document.querySelector(formSelector);
    const inputs = form.querySelectorAll('input');

    inputs.forEach((input) => {
      if (input.type === 'hidden') {
        return;
      }

      if (input.parentElement.querySelectorAll('input').length !== 1) {
        throw Error('Parent of an input is not allowed to contain other inputs.');
      }

      const errorMessageContainer = document.createElement('div');
      errorMessageContainer.classList.add('invalid-feedback');
      input.parentElement.appendChild(errorMessageContainer);

      input.addEventListener('blur', () => {
        this.validateField(input);
      });

      input.addEventListener('input', () => {
        if (input.validity.valid && input.parentElement.classList.contains('was-validated')) {
          this.validateField(input);
        } else if (!input.validity.valid && input.parentElement.classList.contains('was-validated')) {
          this.validateField(input);
        }

        if (input.parentElement.querySelector(':invalid') === null) {
          /* eslint-disable no-param-reassign */
          input.parentElement.querySelector('.invalid-feedback').style.display = 'none';

          // // For checkboxes we do not want the valid feedback styles
          // if (input.type === 'checkbox') {
          //   input.parentElement.classList.remove('was-validated');
          // }
        }
      });

      input.addEventListener('invalid', () => {
        let message;

        switch (true) {
          case input.validity.badInput:
            message = 'This field has a bad input.';
            if (input.dataset.badinput !== undefined) {
              message = input.dataset.badinput;
            }
            break;
          case input.validity.patternMismatch:
            message = `This field must match ${input.pattern}.`;
            if (input.dataset.patternmismatch !== undefined) {
              message = input.dataset.patternmismatch;
            }
            break;
          case input.validity.rangeOverflow:
            message = `This field must be less than or equal to ${input.max}.`;
            if (input.dataset.rangeoverflow !== undefined) {
              message = input.dataset.rangeoverflow;
            }
            break;
          case input.validity.rangeUnderflow:
            message = `This field must be greater than or equal to ${input.min}.`;
            if (input.dataset.rangeunderflow !== undefined) {
              message = input.dataset.rangeunderflow;
            }
            break;
          case input.validity.stepMismatch:
            message = `This field must be ${input.min} plus an integral multiple of ${input.step}.`;
            if (input.dataset.stepmismatch !== undefined) {
              message = input.dataset.stepmismatch;
            }
            break;
          case input.validity.tooLong:
            message = `This field cannot have more than ${input.maxLength} characters.`;
            if (input.dataset.toolong !== undefined) {
              message = input.dataset.toolong;
            }
            break;
          case input.validity.tooShort:
            message = `At least ${input.minLength} characters are required.`;
            if (input.dataset.tooshort !== undefined) {
              message = input.dataset.tooshort;
            }
            break;
          case input.validity.typeMismatch:
            switch (input.type) {
              case 'email':
                message = 'Has to be an email.';
                break;
              case 'number':
                message = 'Has to be a number.';
                break;
              case 'text':
                message = 'Has to be a text.';
                break;
              default:
                message = `This field has to be of type ${input.type}.`;
            }
            if (input.dataset.typemismatch !== undefined) {
              message = input.dataset.typemismatch;
            }
            break;
          case input.validity.valueMissing:
            message = 'This field cannot be empty.';
            if (input.dataset.valuemissing !== undefined) {
              message = input.dataset.valuemissing;
            }
            break;
          case input.validity.customError:
            message = 'This field has a custom error.';
            if (input.dataset.customerror !== undefined) {
              message = input.dataset.customerror;
            }
            break;
          default:
            message = 'Invalid value.';
        }

        input.setCustomValidity(message);
        input.parentElement.querySelector('.invalid-feedback').innerHTML = message;
        input.parentElement.querySelector('.invalid-feedback').style.display = 'block';
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (form.querySelector(':invalid') !== null) {
        inputs.forEach((input) => {
          input.focus();
          input.blur();
        });
      } else {
        form.submit();
      }
    });
  }
}

export default new Validator();

/*
Example usage

<form noValidate>
    <div>
        <label htmlFor="name">Enter username (upper and lowercase letters): </label>
        <input
            type="text"
            name="name"
            className="form-control"
            id="name"
            required
            pattern="[A-Za-z]+"
            data-patternMismatch="Enter username (upper and lowercase letters)"
        >
        <div className="invalid-feedback"></div>
    </div>
    <div>
        <label htmlFor="number">number: </label>
        <input type="number" name="number" className="form-control" id="number" required>
        <div className="invalid-feedback"></div>
    </div>
    <button>Submit</button>
</form>

import validator from '../../modules/validator';
validator.validateForm('form[name="profile"]');
 */
