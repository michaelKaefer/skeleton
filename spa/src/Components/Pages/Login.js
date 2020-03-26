import './Login.scss';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

export default function Login() {
  const { t } = useTranslation();

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Must be a valid email address")
      .max(100, "Email must be less than 100 characters")
      .required("An email is required"),
    password: Yup.string()
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
            initialValues={{ email: 'admin@example.com', password: '123123' }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              const response = await fetch(process.env.REACT_APP_LOGIN_URL, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                // credentials: 'include',
                body: JSON.stringify(values),
              });
              const data = await response.json();

              console.log(data);
            }}
        >
          {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
              /* and other goodies */
            }) => (
              <Form>
                <div className="form-group">
                  <label htmlFor="email" className="required">{t('email_label')}</label>
                  <Field
                      id="email"
                      type="email"
                      name="email"
                      className={`form-control${touched.email && errors.email ? ' error' : ''}`}
                      placeholder="john.doe@example.com"
                      autoFocus
                  />
                  {touched.email && errors.email ? (
                      <div className="error-message"><ErrorMessage name="email" component="div" /></div>
                  ): null}
                </div>
                <div className="form-group">
                  <label htmlFor="password" className="required">{t('password_label')}</label>
                  <Field
                      id="password"
                      type="password"
                      name="password"
                      className={`form-control${touched.password && errors.password ? ' error' : ''}`}
                  />
                  {touched.password && errors.password ? (
                      <div className="error-message"><ErrorMessage name="password" component="div" /></div>
                  ): null}
                </div>

                <p>
                  <a href="/#">{t('forgot_password')}</a>
                </p>

                <button className="btn btn-lg btn-primary" type="submit" disabled={isSubmitting}>
                  {t('login_button_label')}
                </button>
              </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
