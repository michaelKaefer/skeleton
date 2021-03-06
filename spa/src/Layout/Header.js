import './Header.scss';
import React, {useContext} from 'react';
import {Link, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import ISO6391 from 'iso-639-1';
import {AuthenticationContext} from '../Security/AuthenticationContext';
import UserInfo from '../Components/UserInfo';
import { Navbar } from 'react-bootstrap';

export default function Header( {routing} ) {
  const {locale} = useParams();
  const {t, i18n} = useTranslation();
  const {user, logoutUser} = useContext( AuthenticationContext );

  return (
      <Navbar bg="white" expand="lg"
          className="fixed-top px-md-5"
      >
        {/*Brand*/}
        <Navbar.Brand className="ml-lg-3 px-md-5"
           href="/">Skeleton</Navbar.Brand>

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
          {/*Language*/}
          <div className="nav-item dropdown">
            <button
                className="btn btn-link nav-link dropdown-toggle"
                id="languageSelector"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
            >
              {t( 'header__choose_language' )}
            </button>
            <div className="dropdown-menu" aria-labelledby="languageSelector">
              {[...routing.supportedLocales].map( locale => (
                  <Link
                      key={locale}
                      className="dropdown-item"
                      to={`/${locale}/`}
                      onClick={() => i18n.changeLanguage( locale )}
                  >{ISO6391.getNativeName( locale )}&nbsp;
                    <small>{locale}</small></Link>
              ) )}
            </div>
          </div>

          {/*Account*/}
          {user ? (
              <div className="account nav-item dropdown px-md-5">
                {/*User info*/}
                <UserInfo user={user}/>

                <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                  {/*Profile*/}
                  <Link
                      className="dropdown-item"
                      to={routing.getRelativeUrl( locale, 'profile' )}
                  >{t( 'header__profile' )}</Link>

                  {/*Admin*/}
                  {/*{% if is_granted('ROLE_ADMIN') %}*/}
                  <a className="dropdown-item"
                     href="###">{t( 'header__admin_area' )}</a>
                  {/*{% endif %}*/}
                  <div className="dropdown-divider"/>

                  {/*Logout*/}
                  <Link
                      className="dropdown-item"
                      to={`/${locale}/`}
                      onClick={() => logoutUser()}
                  >{t( 'header__logout' )}</Link>
                </div>
              </div>
          ) : ''}
        </div>
      </Navbar>
  );
}

