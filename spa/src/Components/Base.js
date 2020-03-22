import React from 'react';
import { useLocation } from 'react-router-dom';

export default function Base() {
  const location = useLocation();
  console.log(location);
  return (
    <div className="login card shadow">
      <div className="card-body">
        <h1 className="h5 card-title">
          profile
        </h1>

        <p>
          go_to_registration
        </p>
      </div>
    </div>
  );
}
