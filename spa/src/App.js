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
import Spinner from './Components/Spinner';
import Header from './Components/Header';
import FlashMessage from './Components/FlashMessage';
import NotFound from './Components/Pages/NotFound';
import AppRouting from './AppRouting';
import {withTranslation, Trans, useTranslation} from 'react-i18next';

function App() {
  const routing = new AppRouting();
  const { t } = useTranslation();

  return (
    <Router>
      <Switch>
        <Route path={`/:locale(${[...routing.supportedLocales].join('|')})`}>
          <DocumentLanguage />
          <div className="App container-fluid p-0">
            <Spinner/>
            <Header routing={routing}/>
            <main className="container">
              <div className="flash">
                <FlashMessage/>
              </div>
              <div className="content">
                <Switch>

                  {/*Routes*/}
                  {Object.keys(routing.routes).map(route => (
                    <Route
                      key={route}
                      path={routing.getPathRegex(route)}
                    >
                      {React.createElement(routing.routes[route].component)}
                    </Route>
                  ))}

                  {/*NotFound*/}
                  <Route>
                    <NotFound />
                  </Route>
                </Switch>
              </div>
            </main>
            <footer>
              Footer


              <h2>{ t('welcome') }</h2>
            </footer>
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
