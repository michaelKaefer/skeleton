import './FormField.scss';
import React from 'react';
import FormGroup from 'react-bootstrap/FormGroup';
import { ErrorMessage, Field } from 'formik';

export default function FormField({ name, type, hasError, label = false, isRequired = false, placeholder = '', autoFocus = false }) {
  if (type === 'checkbox') {
    return (
        <FormGroup>
          <div className="form-check">
            <Field
                id={name}
                type={type}
                name={name}
                className={`form-check-input${hasError ? ' error' : ''}`}
                placeholder={placeholder}
                autoFocus={autoFocus}
            />
            {label !== false ? (
                <label
                    dangerouslySetInnerHTML={{ __html: label }}
                    htmlFor={name}
                    className={`form-check-label${isRequired ? ' required' : ''}`}
                />
            ) : null}
          </div>

          {hasError ? (
              <ErrorMessage
                  className="error-message"
                  name={name}
                  component="div"
              />
          ) : null}
        </FormGroup>
    );
  }

  return (
    <FormGroup>
      {label !== false ? (
        <label
          htmlFor={name}
          className={isRequired ? 'required' : ''}
        >{label}</label>
      ) : null}

      <Field
        id={name}
        type={type}
        name={name}
        className={`form-control${hasError ? ' error' : ''}`}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />

      {hasError ? (
        <ErrorMessage
          className="error-message"
          name={name}
          component="div"
        />
      ) : null}
    </FormGroup>
  );
}
