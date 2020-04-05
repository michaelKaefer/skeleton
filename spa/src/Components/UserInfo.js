import './UserInfo.scss';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

export default function UserInfo({ user }) {
  const TYPE_PERSON = 'PERSON';
  const TYPE_ORGANIZATION = 'ORGANIZATION';
  let name = '';

  if (user.type === TYPE_PERSON) {
    if (user.firstName !== undefined) {
      name += user.firstName;
    }
    if (user.firstName !== undefined && user.lastName !== undefined) {
      name += ' ';
    }
    if (user.lastName !== undefined) {
      name += user.lastName;
    }
  } else if (user.type === TYPE_ORGANIZATION) {
    if (user.name !== undefined) {
      name += user.name;
    }
  }

  if (name === '') {
    name = user.email;
  }

  return (
      <button className="btn btn-link nav-link dropdown-toggle"
         id="navbarDropdown" data-toggle="dropdown"
         aria-haspopup="true" aria-expanded="false">
        {name}&nbsp;&nbsp;<FontAwesomeIcon
          icon={faUser}/>
      </button>
  );
}