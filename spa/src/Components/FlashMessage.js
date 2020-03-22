import React from 'react';

export default function FlashMessage() {
  return (
    <div className="alert alert-dismissible alert-danger fade show"
         role="alert">
      <button type="button" className="close" data-dismiss="alert"
              aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>

      message
    </div>
  );
}
