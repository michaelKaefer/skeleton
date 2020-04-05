import './Registration.scss';
import React, { useContext } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import client from '../../Utils/Client';
import flash from '../../Components/Flash';
import { Form, Formik } from 'formik';
import FormField from '../../Components/FormField';
import SubmitButton from '../../Components/SubmitButton';
import { Link, useHistory, useParams } from 'react-router-dom';
import { AuthenticationContext } from '../../Security/AuthenticationContext';

export default function Registration({ routing }) {
  const { locale } = useParams();
  const { t } = useTranslation();
  const { loginUser } = useContext(AuthenticationContext);
  let history = useHistory();

  const validationSchema = yup.object().shape({
    email: yup
        .string()
        .email(t('form_error__email_invalid'))
        .max(100, t('form_error__email_less_than_100_characters'))
        .required(t('form_error__email_required')),
    password: yup
        .string()
        .min(6, t('form_error__password_minimum_6_characters'))
        .required(t('form_error__password_required')),
    agreeTermsAndDataPrivacy: yup
        .boolean()
        .oneOf([true], t('form_error__agree_terms_and_data_privacy_required')),
    newsletter: yup
        .boolean(),
  });

  const onSubmit = async (values, actions) => {
    let location;
    try {
      const { payload } = await client.post(process.env.REACT_APP_REGISTRATION_URL, values);
      location = payload.Location;
      flash.success(t('success__registration'));
    } catch (e) {
      actions.setSubmitting(false);
      flash.error(t('errors__unknown'));
    }

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
            email: 'new.user@example.com',
            password: '123123',
            agreeTermsAndDataPrivacy: false,
            newsletter: false,
          }}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
      >
        {formikProps => (
            <Form>
              <Row>
                <Col lg="12">
                  <FormField
                      name="email"
                      type="email"
                      label={t('registration__email_label')}
                      hasError={formikProps.touched.email && formikProps.errors.email}
                      isRequired={true}
                      placeholder={t('registration__email_placeholder')}
                      autoFocus={true}
                  />
                </Col>
                <Col lg="12">
                  <FormField
                      name="password"
                      type="password"
                      label={t('registration__password_label')}
                      hasError={formikProps.touched.password &&
                      formikProps.errors.password}
                      isRequired={true}
                  />
                </Col>
                <Col lg="12">
                  {/*<Interpolate i18nKey='common:interpolateSample' component={<strong>{t('key'}</strong>} />*/}
                  <FormField
                      name="agreeTermsAndDataPrivacy"
                      type="checkbox"
                      label={t('registration__agree_terms_and_data_privacy_label', { terms_url: '#', data_privacy_url: '#' })}
                      hasError={formikProps.touched.agreeTermsAndDataPrivacy && formikProps.errors.agreeTermsAndDataPrivacy}
                      isRequired={true}
                  />
                </Col>
                <Col lg="12">
                  <FormField
                      name="newsletter"
                      type="checkbox"
                      label={t('registration__newsletter_label')}
                      hasError={formikProps.touched.newsletter && formikProps.errors.newsletter}
                  />
                </Col>
              </Row>

              <SubmitButton
                  isLoading={formikProps.isSubmitting}
                  label={t('registration__save_button_label')}
              />
            </Form>
        )}
      </Formik>
  );

  return (
      <Card className="register shadow">
        <Card.Body>
          <h1 className="h5 card-title">
            {t('registration__heading')}
          </h1>

          <p>
            <Link
                to={routing.getRelativeUrl(locale, 'login')}
            >{t('registration__go_to_login')}</Link>
          </p>

          {form}
        </Card.Body>
      </Card>
  );
}
