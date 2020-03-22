import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Header(params) {
  const { locale } = useParams();
  const { t, i18n } = useTranslation();
  const { routing } = params;

  return (
    <nav className="navbar navbar-expand-lg fixed-top navbar-light bg-light px-md-5">
      {/*Brand*/}
      <a className="navbar-brand ml-lg-3 px-md-5"
         href="/">Skeleton</a>




      <div>
        <button onClick={() => i18n.changeLanguage('de')}>de</button>
        <button onClick={() => i18n.changeLanguage('en')}>en</button>
      </div>



      {/*Burger*/}
      <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarMenu"
          aria-controls="navbarMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"/>
      </button>

      <div
          className="collapse navbar-nav navbar-collapse d-lg-flex justify-content-end"
          id="navbarMenu">
        {/*/!*Language*!/*/}
        {/*<div className="nav-item dropdown">*/}
        {/*  <a*/}
        {/*      className="nav-link dropdown-toggle"*/}
        {/*      href="#"*/}
        {/*      id="languageSelector"*/}
        {/*      role="button"*/}
        {/*      data-toggle="dropdown"*/}
        {/*      aria-haspopup="true"*/}
        {/*      aria-expanded="false"*/}
        {/*  >*/}
        {/*    {{'choose_language' | trans}}*/}
        {/*  </a>*/}
        {/*  <div className="dropdown-menu" aria-labelledby="languageSelector">*/}
        {/*    {% for locale in available_app_locales() %}*/}
        {/*    <a*/}
        {/*        href="{{ path(*/}
        {/*                    app.request.get('_route', 'home'),*/}
        {/*                    app.request.get('_route_params', [])|merge({_locale: locale.code})*/}
        {/*                ) }}"*/}
        {/*        {% if app.request.locale == locale.code %}*/}
        {/*        aria-checked="true"*/}
        {/*        {% else %}*/}
        {/*        aria-checked="false"*/}
        {/*        {% endif %}*/}
        {/*        className="dropdown-item {% if app.request.locale == locale.code %}active{% endif %}"*/}
        {/*        role="menuitem"*/}
        {/*    >{{locale.name | capitalize}} <small>{{*/}
        {/*      locale*/}
        {/*      .code[0:2]}}</small></a>*/}
        {/*    {% endfor %}*/}
        {/*  </div>*/}
        {/*</div>*/}

        {/*Account*/}
        <div className="account nav-item dropdown px-md-5">
          <a className="nav-link dropdown-toggle" href="###"
             id="navbarDropdown" role="button" data-toggle="dropdown"
             aria-haspopup="true" aria-expanded="false">
            <FontAwesomeIcon icon={faUser} />
          </a>
          <div className="dropdown-menu" aria-labelledby="navbarDropdown">
            {/*Profile*/}
            <Link
                className="dropdown-item"
                to={routing.getRelativeUrl(locale, 'profile')}
            >profile</Link>
            {/*Admin*/}
            {/*{% if is_granted('ROLE_ADMIN') %}*/}
            <a className="dropdown-item"
               href="###">admin_area</a>
            {/*{% endif %}*/}
            <div className="dropdown-divider"/>
            {/*Logout*/}
            <a className="dropdown-item"
               href="###">logout</a>
          </div>
        </div>
      </div>
    </nav>
  );
}

// <ul>
//   <li>
//     <Link to="/en/profile">Profile /en/profile</Link>
//   </li>
//   <li>
//     <Link to="/de/profile">Profile /de/profile</Link>
//   </li>
//   <li>
//     <Link to="/en/login">Login</Link>
//   </li>
//   <li>
//     <Link to="/en/hello">Hello</Link>
//   </li>
//   <li>
//     <Link to="/en">broken link: /en</Link>
//   </li>
//   <li>
//     <Link to="/en/">broken link: /en/</Link>
//   </li>
//   <li>
//     <Link to="/adsfadfargafgf">broken link: /adsfadfargafgf</Link>
//   </li>
//   <li>
//     <Link to="/en/adsfadfargafgf">broken link: /en/adsfadfargafgf</Link>
//   </li>
// </ul>
