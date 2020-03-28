import './Login.scss';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { Alert, Card, Spinner } from 'react-bootstrap';
import { AuthenticationContext } from '../Security/AuthenticationContext';
import { useHistory, useParams } from 'react-router-dom';
import FormGroup from 'react-bootstrap/FormGroup';

export default function Login({routing}) {
  const {locale} = useParams();
  const {t} = useTranslation();
  const {loginUser} = useContext( AuthenticationContext );
  let history = useHistory();

  const validationSchema = yup.object().shape( {
    email: yup
      .string()
      .email( 'Must be a valid email address' )
      .max( 100, 'Email must be less than 100 characters' )
      .required( 'An email is required' ),
    password: yup
      .string()
      .min( 6, 'Password must have at least 6 characters' )
      .required( 'A password is required' ),
  } );

  const onSubmit = async (values, actions) => {
    // Login user on server
    let response;
    let payload;

    try {
      response = await fetch( process.env.REACT_APP_LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify( values ),
      } );
      payload = await response.json();
    }
    catch (e) {
      actions.setFieldError( 'loginFailure',
        'Network error or malformed response during login, please contact us!' );
      actions.setSubmitting( false );
      console.error( e );
      return;
    }

    switch (response.status) {
      case 400:
        actions.setFieldError( 'loginFailure',
          'We are facing technical difficulties, please contact us!' );
        actions.setSubmitting( false );
        console.error( response, payload );
        return;
      case 401:
        actions.setFieldError( 'loginFailure',
          'Invalid credentials, please try again!' );
        actions.setSubmitting( false );
        console.error( response, payload );
        return;
      case 200:
        break;
      default:
        actions.setFieldError( 'loginFailure',
          'Unknown error, please try again or contact us!' );
        actions.setSubmitting( false );
        console.error( response, payload );
        return;
    }

    // Get user info
    const url = `${process.env.REACT_APP_API_BASE_URL}${payload.Location}`;

    try {
      response = await fetch( url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      } );
      payload = await response.json();
    }
    catch (e) {
      actions.setFieldError( 'submitFailure',
        'Network error or malformed response while fetching user info, please contact us!' );
      actions.setSubmitting( false );
      console.error( e );
      return;
    }

    if ( response.status !== 200 ) {
      actions.setFieldError('loginFailure',
        'Unknown error, please try again or contact us!');
      actions.setSubmitting(false);
      console.error(response, payload);
      return;
    }

    // Login user in React
    loginUser( payload ); // The payload only contains the user object
    actions.setSubmitting( false );

    history.push( routing.getRelativeUrl( locale, 'profile' ) );
  };

  const form = (
    <Formik
      initialValues={{
        email: 'admin@example.com',
        password: '123123',
        loginFailure: '',
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
              {formikProps.touched.loginFailure &&
              formikProps.errors.loginFailure ? (
                <Alert variant="danger" className="text-center">
                  <ErrorMessage name="loginFailure" component="div"/>
                </Alert>
              ) : null}
            </div>
          )}
          <ErrorMessage name="general" component="div"/>
          <FormGroup>
            <label htmlFor="email" className="required">{t(
              'login__email_label' )}</label>
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
          <FormGroup>
            <label htmlFor="password" className="required">{t(
              'login__password_label' )}</label>
            <Field
              id="password"
              type="password"
              name="password"
              className={`form-control${formikProps.touched.password &&
              formikProps.errors.password ? ' error' : ''}`}
            />
            {formikProps.touched.password && formikProps.errors.password ? (
              <div className="error-message"><ErrorMessage name="password"
                                                           component="div"/>
              </div>
            ) : null}
          </FormGroup>

          <p>
            <a href="/#">{t( 'login__forgot_password' )}</a>
          </p>

          <button className="btn btn-lg btn-primary" type="submit"
                  disabled={formikProps.isSubmitting}>
            {t( 'login__login_button_label' )}
          </button>
        </Form>
      )}
    </Formik>
  );

  return (
    <Card className="main-page-content shadow">
      <Card.Body>
        <h1 className="h5 card-title">
          {t( 'login__heading' )}
        </h1>

        <p>
          <a href="/#">{t( 'login__go_to_registration' )}</a>
        </p>

        {form}
      </Card.Body>
    </Card>
  );
}
