import './Profile.scss';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Card, Col, Row, Spinner } from 'react-bootstrap';
import * as yup from 'yup';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import FormGroup from 'react-bootstrap/FormGroup';
import { AuthenticationContext } from '../Security/AuthenticationContext';

export default function Profile() {
  const {t} = useTranslation();
  const { user, updateUser } = useContext(AuthenticationContext);

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .email('Must be a valid email address')
      .max(100, 'Email must be less than 100 characters')
      .required('An email is required'),
    firstName: yup
      .string()
      .required('A first name is required'),
    lastName: yup
      .string()
      .required('A last name is required'),
  });

  const onSubmit = async (values, actions) => {
    // Save user
    let response;
    let payload;

    const url = `${process.env.REACT_APP_API_BASE_URL}${user['@id']}`;
// console.log(user, url, values);
// return;
    try {
      response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json',
        },
        body: JSON.stringify(values),
      });
      payload = await response.json();
    }
    catch (e) {
      actions.setFieldError('submitFailure',
        'Network error or malformed response during login, please contact us!');
      actions.setSubmitting(false);
      console.error(e);
      return;
    }

    if (response.status !== 200) {
      actions.setFieldError('submitFailure',
        'Unknown error, please try again or contact us!');
      actions.setSubmitting(false);
      console.error(response, payload);
      return;
    }

    updateUser(payload);
  };

  const form = (
    <Formik
      initialValues={{
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        submitFailure: '',
      }} // Todo: remove dev-placeholders :)
      onSubmit={onSubmit}
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
              {formikProps.touched.submitFailure &&
              formikProps.errors.submitFailure ? (
                <Alert variant="danger" className="text-center">
                  <ErrorMessage name="submitFailure" component="div"/>
                </Alert>
              ) : null}
            </div>
          )}
          <ErrorMessage name="general" component="div"/>
          <FormGroup>
            <label htmlFor="email" className="required">{t(
              'login__email_label')}</label>
            <Field
              id="email"
              type="email"
              name="email"
              className={`form-control${formikProps.touched.email &&
              formikProps.errors.email ? ' error' : ''}`}
              placeholder="john.doe@example.com"
              autoFocus
            />
            {formikProps.touched.email && formikProps.errors.email ? (
              <div className="error-message"><ErrorMessage name="email"
                                                           component="div"/>
              </div>
            ) : null}
          </FormGroup>

          <Row>
            <Col>
              <FormGroup>
                <label htmlFor="firstName" className="required">{t(
                  'login__first_name_label')}</label>
                <Field
                  id="firstName"
                  type="text"
                  name="firstName"
                  className={`form-control${formikProps.touched.firstName &&
                  formikProps.errors.firstName ? ' error' : ''}`}
                  placeholder="John"
                />
                {formikProps.touched.firstName && formikProps.errors.firstName
                  ? (
                    <div className="error-message"><ErrorMessage
                      name="firstName"
                      component="div"/>
                    </div>
                  )
                  : null}
              </FormGroup>
            </Col>
            <Col>
              <FormGroup>
                <label htmlFor="lastName" className="required">{t(
                  'login__last_name_label')}</label>
                <Field
                  id="lastName"
                  type="text"
                  name="lastName"
                  className={`form-control${formikProps.touched.lastName &&
                  formikProps.errors.lastName ? ' error' : ''}`}
                  placeholder="Doe"
                />
                {formikProps.touched.lastName && formikProps.errors.lastName ? (
                  <div className="error-message"><ErrorMessage name="lastName"
                                                               component="div"/>
                  </div>
                ) : null}
              </FormGroup>
            </Col>
          </Row>

          <button className="btn btn-lg btn-primary" type="submit"
                  disabled={formikProps.isSubmitting}>
            {t('profile__save_button_label')}
          </button>
        </Form>
      )}
    </Formik>
  );

  return (
    <Card className="main-page-content shadow">
      <Card.Body>
        <h1 className="h5 card-title">
          {t('profile__heading')}
        </h1>

        <p>
          <a href="/#">{t('login__go_to_registration')}</a>
        </p>

        {form}
      </Card.Body>
    </Card>
  );
}
