import './Profile.scss';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Col, Row } from 'react-bootstrap';
import * as yup from 'yup';
import { Form, Formik } from 'formik';
import { AuthenticationContext } from '../../Security/AuthenticationContext';
import flash from '../../Components/Flash';
import SubmitButton from '../../Components/SubmitButton';
import FormField from '../../Components/FormField';
import client from '../../Utils/Client';

export default function Profile() {
  const {t} = useTranslation();
  const {user, updateUser} = useContext(AuthenticationContext);

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
    const url = `${process.env.REACT_APP_API_BASE_URL}${user['@id']}`;

    try {
      const { payload } = await client.patch(url, values);
      updateUser(payload);
      flash.success(t('success__updated'));
    } catch (e) {
      actions.setSubmitting(false);
      flash.error(t('errors__unknown'));
    }
  };

  const form = (
    <Formik
      initialValues={{
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      }}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    >
      {formikProps => (
        <Form>
          <FormField
            name="email"
            type="email"
            label={t('profile__email_label')}
            hasError={formikProps.touched.email && formikProps.errors.email}
            isRequired={true}
            placeholder={t('profile__email_placeholder')}
            autoFocus={true}
          />

          <Row>
            <Col>
              <FormField
                name="firstName"
                type="text"
                label={t('profile__first_name_label')}
                hasError={formikProps.touched.firstName &&
                formikProps.errors.firstName}
                isRequired={true}
                placeholder={t('profile__first_name_placeholder')}
              />
            </Col>
            <Col>
              <FormField
                name="lastName"
                type="text"
                label={t('profile__last_name_label')}
                hasError={formikProps.touched.lastName &&
                formikProps.errors.lastName}
                isRequired={true}
                placeholder={t('profile__last_name_placeholder')}
              />
            </Col>
          </Row>

          <SubmitButton
            isDisabled={Object.keys(formikProps.errors).length}
            isLoading={formikProps.isSubmitting}
            label={t('profile__save_button_label')}
          />
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

        {form}
      </Card.Body>
    </Card>
  );
}
