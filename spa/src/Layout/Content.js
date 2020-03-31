import './Content.scss';
import React, { useContext } from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';
import NotFound from '../Pages/NotFound';
import { AuthenticationContext } from '../Security/AuthenticationContext';

export default function Content(params) {
  const { routing } = params;
  const { locale } = useParams();
  const { user } = useContext(AuthenticationContext);

  return (
      <div className="content">
        <Switch>

          {/*Routes*/}
          {Object.keys(routing.routes).map(route => {
            const userIsAuthorized = (
                routing.routes[route].authorizedRoles === null
                ? true
                : user && user.roles.some(r => routing.routes[route].authorizedRoles.includes(r))
            );

            if (userIsAuthorized) {
              return (
                <Route
                  key={route}
                  path={routing.getPathRegex(route)}
                >
                  {React.createElement(routing.routes[route].component, {routing})}
                </Route>
              );
            } else {
              return (
                <Route
                  key={route}
                  path={routing.getPathRegex(route)}
                >
                  <Redirect to={routing.getRelativeUrl(locale, 'login')} />
                </Route>
              );
            }
          })}

          {/*Home does not exist so we redirect to login*/}
          <Route
              path={routing.getHomeRegex()}
          >
            <Redirect to={`/${locale}/login`} />
          </Route>

          {/*NotFound*/}
          <Route>
            <NotFound />
          </Route>

        </Switch>
      </div>
  );
}

