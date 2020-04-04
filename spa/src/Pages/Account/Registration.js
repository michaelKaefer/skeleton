import './Registration.scss';
import React, { useState } from 'react';
import { Card, Col, FormCheck, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import client from '../../Utils/Client';
import flash from '../../Components/Flash';
import { Form, Formik } from 'formik';
import FormField from '../../Components/FormField';
import SubmitButton from '../../Components/SubmitButton';

export default function Registration() {
  const { t } = useTranslation();

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
    const url = `${process.env.REACT_APP_API_BASE_URL}${process.env.REACT_APP_API_URL_PATH}/users`;

    try {
      await client.post(url, values);
      flash.success(t('success__registration'));
    } catch (e) {
      actions.setSubmitting(false);
      flash.error(t('errors__unknown'));
    }
  };

  const form = (
      <Formik
          initialValues={{
            email: '',
            firstName: '',
            lastName: '',
          }}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
      >
        {formikProps => (
            <Form>
              <Row>
                <Col lg="6">
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
                <Col lg="6">
                  <FormField
                      name="password"
                      type="password"
                      label={t('registration__password_label')}
                      hasError={formikProps.touched.password &&
                      formikProps.errors.password}
                      isRequired={true}
                  />
                </Col>
              </Row>

              <SubmitButton
                  isDisabled={Object.keys(formikProps.errors).length}
                  isLoading={formikProps.isSubmitting}
                  label={t('registration__save_button_label')}
              />
            </Form>
        )}
      </Formik>
  );

  return (
      <Card className="main-page-content shadow">
        <Card.Body>
          <h1 className="h5 card-title">
            {t('registration__heading')}
          </h1>

          {form}
        </Card.Body>
      </Card>
  );
}
