import './Login.scss';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { Alert, Spinner } from 'react-bootstrap';
import { AuthenticationContext } from '../../Security/AuthenticationContext';

export default function Login() {
  const { t } = useTranslation();
  const { loginUser } = useContext(AuthenticationContext);

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .email("Must be a valid email address")
      .max(100, "Email must be less than 100 characters")
      .required("An email is required"),
    password: yup
      .string()
      .min(6, "Password must have at least 6 characters")
      .required("A password is required"),
  });

  return (
    <div className="login card shadow">
      <div className="card-body">
        <h1 className="h5 card-title">
          {t('heading')}
        </h1>

        <p>
          <a href="/#">{t('go_to_registration')}</a>
        </p>

        <Formik
            initialValues={{ email: 'admin@example.com', password: '123123', server: '' }}
            onSubmit={async (values, actions) => {
              try {
                const response = await fetch(process.env.REACT_APP_LOGIN_URL, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  // credentials: 'include',
                  body: JSON.stringify( values ),
                });
                if (response.status === 400) { // Malformed request
                  actions.setFieldError('server', 'We are facing technical difficulties, please come back later!');
                  actions.setSubmitting(false);
                  return;
                }
                if (response.status === 401) { // Unauthorized
                  actions.setFieldError('server', 'Invalid credentials, please try again!');
                  actions.setSubmitting(false);
                  return;
                }
                if (response.status !== 200) {
                  actions.setFieldError('server', 'Unknown error, please try again or contact us!');
                  actions.setSubmitting(false);
                  return;
                }
                // Success
                // for(const header of response.headers){
                //   console.log(header);
                // }
                const userIri = await response.text();

                console.log(userIri); // HIER WEITER TODO
                loginUser({firstName: 'John', lastName: 'Doe'});
                // console.log(1, useContext(AuthenticationContext));
                actions.setSubmitting(false);
              } catch (e) {
                actions.setFieldError('server', 'Network error or malformed JSON response.');
                actions.setSubmitting(false);
              }
            }}
            validationSchema={validationSchema}
        >
          {formikProps => (
              <Form>
                {formikProps.isSubmitting ? (
                    <Alert variant="light" className="text-center">
                      <Spinner animation="border" role="status">
                        <span className="sr-only">Loading...</span>
                      </Spinner>
                    </Alert>
                ) : (
                    <div>
                    {formikProps.touched.server && formikProps.errors.server ? (
                      <Alert variant="danger" className="text-center">
                        <ErrorMessage name="server" component="div" />
                      </Alert>
                    ): null}
                    </div>
                )}
                <ErrorMessage name="general" component="div" />
                <div className="form-group">
                  <label htmlFor="email" className="required">{t('email_label')}</label>
                  <Field
                      id="email"
                      type="email"
                      name="email"
                      className={`form-control${formikProps.touched.email && formikProps.errors.email ? ' error' : ''}`}
                      placeholder="john.doe@example.com"
                      autoFocus
                  />
                  {formikProps.touched.email && formikProps.errors.email ? (
                      <div className="error-message"><ErrorMessage name="email" component="div" /></div>
                  ): null}
                </div>
                <div className="form-group">
                  <label htmlFor="password" className="required">{t('password_label')}</label>
                  <Field
                      id="password"
                      type="password"
                      name="password"
                      className={`form-control${formikProps.touched.password && formikProps.errors.password ? ' error' : ''}`}
                  />
                  {formikProps.touched.password && formikProps.errors.password ? (
                      <div className="error-message"><ErrorMessage name="password" component="div" /></div>
                  ): null}
                </div>

                <p>
                  <a href="/#">{t('forgot_password')}</a>
                </p>

                <button className="btn btn-lg btn-primary" type="submit" disabled={formikProps.isSubmitting}>
                  {t('login_button_label')}
                </button>
              </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
