import './Profile.scss';
import React, { useContext, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Col, FormCheck, Row } from 'react-bootstrap';
import * as yup from 'yup';
import { Form, Formik } from 'formik';
import { AuthenticationContext } from '../../Security/AuthenticationContext';
import flash from '../../Components/Flash';
import SubmitButton from '../../Components/SubmitButton';
import FormField from '../../Components/FormField';
import client from '../../Utils/Client';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUser} from '@fortawesome/free-solid-svg-icons';
import 'dropzone/dist/dropzone.css';
import Dropzone from 'dropzone';
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
  (() => {
    window.onload = () => {
      new Dropzone(dropzoneElement.current, {
        dictDefaultMessage: '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-upload" class="svg-inline--fa fa-file-upload fa-w-12 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm65.18 216.01H224v80c0 8.84-7.16 16-16 16h-32c-8.84 0-16-7.16-16-16v-80H94.82c-14.28 0-21.41-17.29-11.27-27.36l96.42-95.7c6.65-6.61 17.39-6.61 24.04 0l96.42 95.7c10.15 10.07 3.03 27.36-11.25 27.36zM377 105L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1c0-6.3-2.5-12.4-7-16.9z"></path></svg>'
            + ' '
            + t('profile__upload_avatar'),
        init: function() {
          this.on('error', (file, data) => {
            if (data.detail) {
              this.emit('error', file, data.detail);
            }
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
    };
  })();

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
            <Col lg="6">
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
            <Col lg="6">
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
              <Row>
                <Col lg="6">
                  <FormField
                      name="name"
                      type="text"
                      label={t('profile__name_label')}
                      hasError={formikProps.touched.name &&
                      formikProps.errors.name}
                      placeholder={t('profile__name_placeholder')}
                  />
                </Col>
              </Row>
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

      </Card.Body>
    </Card>
  );
}
