import { Redirect, useParams } from 'react-router-dom';
import React from 'react';

export default function HomeRedirect() {
  const { locale } = useParams();

  return (
      <Redirect to={`/${locale}/login`} />
  );
}
