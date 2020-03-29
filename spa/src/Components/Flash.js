import './Flash.scss';
import React from 'react';
import withReactContent from 'sweetalert2-react-content';
import Swal from "sweetalert2";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-primary',
    cancelButton: 'btn btn-danger'
  },
  buttonsStyling: false
});

class Flash {
  success(html) {
    withReactContent(swalWithBootstrapButtons).fire({
      title: <FontAwesomeIcon className="text-success" icon={faCheckCircle}/>,
      html: html,
      showConfirmButton: false,
      timer: 1000,
    });
  }

  error(html) {
    withReactContent(swalWithBootstrapButtons).fire({
      title: <FontAwesomeIcon className="text-danger" icon={faTimesCircle}/>,
      html: html,
    });
  }
}

export default new Flash();
