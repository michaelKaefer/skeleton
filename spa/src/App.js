import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from "react-router-dom";
import 'bootstrap';
import './App.scss';
import DocumentLanguage from './Layout/DocumentLanguage';
import Header from './Layout/Header';
import { withTranslation } from 'react-i18next';
import Footer from './Layout/Footer';
import Content from './Layout/Content';
import { AuthenticationContext } from './Security/AuthenticationContext';

function App(params) {
  const { routing } = params;
  const [user, setUser] = useState(
      localStorage.getItem('user') !== null
          ? JSON.parse(localStorage.getItem('user'))
          : null
  );

  function loginUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  }

  function updateUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  }

  async function logoutUser(user) {
    let response;

    try {
      response = await fetch(process.env.REACT_APP_LOGOUT_URL, {
        method: 'GET',
      });
    }
    catch (e) {
      console.error(e);
      return;
    }

    if (response.status !== 200) {
      console.error(response);
      return;
    }

    localStorage.removeItem('user');
    setUser(null);
    console.log('Logged out');
  }

  return (
    <AuthenticationContext.Provider value={{ user, loginUser, logoutUser, updateUser }}>
      <Router>
        <Switch>
          <Route path={`/:locale(${[...routing.supportedLocales].join('|')})`}>
            <DocumentLanguage />
            <div className="App container-fluid p-0">
              <Header routing={routing}/>
              <main className="container">
                <Content routing={routing}/>
              </main>
              <Footer/>
            </div>
          </Route>

          {/*Missing locale*/}
          <Route>
            <Redirect to={`/${routing.defaultLocale}/`} />
          </Route>
        </Switch>
      </Router>
    </AuthenticationContext.Provider>
  );
}

export default withTranslation('common')(App);
