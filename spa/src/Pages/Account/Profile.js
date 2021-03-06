import './Profile.scss';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Card, Col, FormCheck, Row } from 'react-bootstrap';
import * as yup from 'yup';
import { Form, Formik } from 'formik';
import { AuthenticationContext } from '../../Security/AuthenticationContext';
import flash from '../../Components/Flash';
import SubmitButton from '../../Components/SubmitButton';
import FormField from '../../Components/FormField';
import client from '../../Utils/Client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faExclamation } from '@fortawesome/free-solid-svg-icons';
import Dropzone from 'dropzone';
import dropzoneConfiguration from '../../Configuration/DropzoneConfiguration';
Dropzone.autoDiscover = false;

export default function Profile() {
  const {t} = useTranslation();
  const {user, updateUser} = useContext(AuthenticationContext);
  const [isOrganization, setIsOrganization] = useState(false);

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .email('Must be a valid email address')
      .max(100, 'Email must be less than 100 characters')
      .required('An email is required'),
    firstName: yup
      .string(),
    lastName: yup
      .string(),
  });

  const toggleIsOrganization = (event) => {
    setIsOrganization(!isOrganization);
  };

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

  const dropzoneElement = useRef(null);
  dropzoneConfiguration.setDescription(t('profile__upload_avatar'));
  useEffect(() => {
    if (!user.confirmationTokenWasSent) {
      new Dropzone(dropzoneElement.current, {
        ...dropzoneConfiguration.get(),
        init: function() {
          this.on('error', (file, data) => {
            if (data.detail) {
              this.emit('error', file, data.detail);
            }
            flash.error(t('error__file_upload'));
          });
          this.on('success', async (file, data) => {
            const { url } = data;
            user.avatarUrl = url;
            updateUser(user);
            flash.success(t('success__file_uploaded'));
            this.removeFile(file);
          });
        }
      });
    }
  }, [t, updateUser, user]);

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
          <Row>
            <Col lg="12">
              <FormField
                name="email"
                type="email"
                label={t('profile__email_label')}
                hasError={formikProps.touched.email && formikProps.errors.email}
                isRequired={true}
                placeholder={t('profile__email_placeholder')}
                autoFocus={true}
              />
            </Col>
            <Col lg="12">
              <div style={{marginBottom: '12px'}}>
                <FormCheck
                    type="switch"
                    id="is-organization-switch"
                      label={t('profile__is_a_organization_profile')}
                    onClick={toggleIsOrganization}
                />
              </div>
            </Col>
          </Row>

          {isOrganization ? (
            <Col lg="12">
              <FormField
                  name="name"
                  type="text"
                  label={t('profile__name_label')}
                  hasError={formikProps.touched.name &&
                  formikProps.errors.name}
                  placeholder={t('profile__name_placeholder')}
              />
            </Col>
          ) : (
            <Row>
              <Col lg="6">
                <FormField
                    name="firstName"
                    type="text"
                    label={t('profile__first_name_label')}
                    hasError={!isOrganization && formikProps.touched.firstName &&
                    formikProps.errors.firstName}
                    placeholder={t('profile__first_name_placeholder')}
                />
              </Col>
              <Col lg="6">
                <FormField
                    name="lastName"
                    type="text"
                    label={t('profile__last_name_label')}
                    hasError={!isOrganization && formikProps.touched.lastName &&
                    formikProps.errors.lastName}
                    placeholder={t('profile__last_name_placeholder')}
                />
              </Col>
            </Row>
          )}

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
          <FontAwesomeIcon icon={faUser}/> <span>{t('profile__heading')}</span>
        </h1>

        <hr />
        <br />

        {user.confirmationTokenWasSent ? (
            <Alert variant="warning">
              <FontAwesomeIcon icon={faExclamation}/>&nbsp;&nbsp;{t('profile__please_confirm_your_account')}
            </Alert>
        ) : (
          <Row>
            <Col sm="6" lg="8">
              {form}
            </Col>
            <Col sm="6" lg="4">
              <div className="avatar">
                <img
                    src={`${process.env.REACT_APP_PUBLIC_UPLOADS_BASE_URL}/${user.avatarUrl}`}
                    alt="Avatar"
                />
                <form
                    action={process.env.REACT_APP_UPLOAD_PUBLIC_FILE_URL}
                    method="POST"
                    encType="multipart/form-data"
                    className="dropzone avatar"
                    ref={dropzoneElement}
                >
                  <input type="hidden" name="entity" value="App\Entity\User" />
                  <input type="hidden" name="id" value={user.id} />
                  <input type="hidden" name="getter" value="getAvatar" />
                  <input type="hidden" name="setter" value="setAvatar" />
                </form>
              </div>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
}
