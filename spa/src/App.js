import React from 'react';
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

function App(params) {
  const { routing } = params;

  return (
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
  );
}

export default withTranslation('common')(App);
