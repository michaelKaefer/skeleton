import React from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';
import NotFound from './Pages/NotFound';

export default function Content(params) {
  const { routing } = params;
  const { locale } = useParams();

  return (
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

