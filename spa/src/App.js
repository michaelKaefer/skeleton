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
import { withTranslation } from 'react-i18next';
import Footer from './Components/Footer';
import HomeRedirect from './Components/HomeRedirect';

function App() {
  const routing = new AppRouting();

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

                  {/*Home does not exist so we redirect to login*/}
                  <Route
                    path={routing.getHomeRegex()}
                  >
                    <HomeRedirect/>
                    {/*{console.log(this.props)}*/}
                    {/*{console.log(useParams())}*/}
                    {/*<Redirect to={`/${routing.defaultLocale}/`} />*/}
                  </Route>

                  {/*NotFound*/}
                  <Route>
                    <NotFound />
                  </Route>

                </Switch>
              </div>
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
