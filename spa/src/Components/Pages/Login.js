import React from 'react';

export default function Login() {
  return (
    <div className="login card shadow">
      <div className="card-body">
        <h1 className="h5 card-title">
          heading
        </h1>

        <p>
          go_to_registration
        </p>

        <form method="post">
          <div className="alert alert-danger">
            error
          </div>

          <div className="form-group">
            <label htmlFor="inputEmail" className="required">email_label</label>
            <input
                type="email"
                value="{{ last_username }}"
                name="email"
                id="inputEmail"
                className="form-control"
                required
                autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="inputPassword" className="required">password_label</label>
            <input type="password" name="password" id="inputPassword"
                   className="form-control" required/>
          </div>

          <input type="hidden" name="_csrf_token"
                 value="{{ csrf_token('authenticate') }}"
          />

          <p>
            forgot_password
          </p>

          <button className="btn btn-lg btn-primary" type="submit">
            login_button_label
          </button>
        </form>
      </div>
    </div>
  );
}
