import Button from 'react-bootstrap/Button';
import { Spinner } from 'react-bootstrap';
import React from 'react';

export default function SubmitButton({ isDisabled, isLoading, label }) {
  return (
    <Button
      type="submit"
      disabled={isLoading || isDisabled}
    >
      {isLoading ? (
        <span style={{
          paddingRight: '3px',
        }}>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  style={{
                    borderWidth: '0.12em',
                    position: 'relative',
                    marginRight: '9px',
                  }}
                />
                <span>Loading...</span>
              </span>
      ): (
        <span>{label}</span>
      )}
    </Button>
  );
}
