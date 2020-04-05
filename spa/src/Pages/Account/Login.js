import './Login.scss';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import { Card } from 'react-bootstrap';
import { AuthenticationContext } from '../../Security/AuthenticationContext';
import { Link, useHistory, useParams } from 'react-router-dom';
import client from '../../Utils/Client';
import flash from '../../Components/Flash';
import SubmitButton from '../../Components/SubmitButton';
import FormField from '../../Components/FormField';

export default function Login({ routing }) {
  const { locale } = useParams();
  const { t } = useTranslation();
  const { loginUser } = useContext(AuthenticationContext);
  let history = useHistory();

  const validationSchema = yup.object().shape({
    email: yup
        .string()
        .email('Must be a valid email address')
        .max(100, 'Email must be less than 100 characters')
        .required('An email is required'),
    password: yup
        .string()
        .min(6, 'Password must have at least 6 characters')
        .required('A password is required'),
  });

  const onSubmit = async (values, actions) => {
    // Login user on server and receive the URL where we can retrieve the user
    // resource
    let location;
    try {
      const { payload } = await client.post(process.env.REACT_APP_LOGIN_URL,
          values);
      location = payload.Location;
    }
    catch (e) {
      if (e.name === 'UnauthorizedError') {
        actions.setSubmitting(false);
        flash.error(t('errors__invalid_credentials'));
      }
      else {
        actions.setSubmitting(false);
        flash.error(t('errors__unknown'));
      }
      return;
    }





    const { payload } = await client.get('https://127.0.0.1:3000/en/debug');
    console.log(location, payload);
    return;



    // Get user info
    const url = `${process.env.REACT_APP_API_BASE_URL}${location}`;
    try {
      const { payload } = await client.get(url);

      // Login user in React
      loginUser(payload); // The payload only contains the user object
      actions.setSubmitting(false);
      flash.success(t('success__login'));
      history.push(routing.getRelativeUrl(locale, 'profile'));
    }
    catch (e) {
      actions.setFieldError('submitFailure', t('errors__unknown'));
      actions.setSubmitting(false);
    }
  };

  const form = (
      <Formik
          initialValues={{
            email: 'admin@example.com',
            password: '123123',
          }} // Todo: remove dev-placeholders :)
          onSubmit={onSubmit}
          validationSchema={validationSchema}
      >
        {formikProps => (
            <Form>
              <FormField
                  name="email"
                  type="email"
                  label={t('login__email_label')}
                  hasError={formikProps.touched.email &&
                  formikProps.errors.email}
                  isRequired={true}
                  placeholder="john.doe@example.com"
                  autoFocus={true}
              />
              <FormField
                  name="password"
                  type="password"
                  label={t('login__password_label')}
                  hasError={formikProps.touched.password &&
                  formikProps.errors.password}
                  isRequired={true}
              />

              <SubmitButton
                  isDisabled={Object.keys(formikProps.errors).length}
                  isLoading={formikProps.isSubmitting}
                  label={t('login__login_button_label')}
              />
            </Form>
        )}
      </Formik>
  );

  return (
      <Card className="main-page-content shadow">
        <Card.Body>
          <h1 className="h5 card-title">
            {t('login__heading')}
          </h1>

          <p>
            <Link
                to={routing.getRelativeUrl(locale, 'registration')}
            >{t('login__go_to_registration')}</Link>
          </p>

          {form}

          <p className="mt-2">
            <a href="/#">{t('login__forgot_password')}</a>
          </p>
        </Card.Body>
      </Card>
  );
}
