import React from 'react';
import { Route } from 'react-router-dom';
import { useAuthenticationContext } from './AuthenticationContext';

export default function PrivateRoute({ component: Component, ...rest }) {
  const isAuthenticated = useAuthenticationContext();

  return (
      <Route
          {...rest}
          render={props =>
              isAuthenticated ? (
                  <Component {...props} />
              ) : (
                  <Redirect to="/login" />
              )
          }
      />
  );
}
