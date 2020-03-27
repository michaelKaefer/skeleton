import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from "react-router-dom";
import 'bootstrap';
import './App.scss';
import DocumentLanguage from './Components/DocumentLanguage';
import Header from './Components/Header';
import FlashMessage from './Components/FlashMessage';
import { withTranslation } from 'react-i18next';
import Footer from './Components/Footer';
import Content from './Components/Content';
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

  async function logoutUser(user) {
    localStorage.removeItem('user');
    setUser(null);

    try {
      const response = await fetch(process.env.REACT_APP_LOGOUT_URL, {
        method: 'POST',
        // headers: {
        //   'Content-Type': 'application/json'
        // },
        // credentials: 'include',
        // body: JSON.stringify( values ),
      });
      console.log(response);
      // if (response.status === 400) { // Malformed request
      //   actions.setFieldError('server', 'We are facing technical difficulties, please come back later!');
      //   actions.setSubmitting(false);
      //   return;
      // }
      // if (response.status === 401) { // Unauthorized
      //   actions.setFieldError('server', 'Invalid credentials, please try again!');
      //   actions.setSubmitting(false);
      //   return;
      // }
      // if (response.status !== 204) {
      //   actions.setFieldError('server', 'Unknown error, please try again or contact us!');
      //   actions.setSubmitting(false);
      //   return;
      // }
      // // Success
      // // for(const header of response.headers){
      // //   console.log(header);
      // // }
      // // console.log(response.headers.get('location'));
      //
      // loginUser({firstName: 'John', lastName: 'Doe'});
      // // console.log(1, useContext(AuthenticationContext));
      // actions.setSubmitting(false);
    } catch (e) {
      throw e;
      // actions.setFieldError('server', 'Network error or malformed JSON response.');
      // actions.setSubmitting(false);
    }
  }

  return (
    <AuthenticationContext.Provider value={{ user, loginUser, logoutUser }}>
      <Router>
        <Switch>
          <Route path={`/:locale(${[...routing.supportedLocales].join('|')})`}>
            <DocumentLanguage />
            <div className="App container-fluid p-0">
              <Header routing={routing}/>
              <main className="container">
                <div className="flash">
                  <FlashMessage/>
                </div>
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
