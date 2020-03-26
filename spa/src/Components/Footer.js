import React from 'react';

export default function Footer() {
  return (
    <div>
      <hr/>

      <div className="container py-4">
        <div className="row">
          <div className="col-6 col-md">
            <h5>Information</h5>
            <ul className="list-unstyled text-small">
              <li><a className="text-muted" href="/#">Contact</a></li>
              <li><a className="text-muted" href="/#">Shipping Terms</a></li>
              <li><a className="text-muted" href="/#">Legal Notice</a></li>
              <li><a className="text-muted" href="/#">Data Policy</a></li>
              <li><a className="text-muted" href="/#">Imprint</a></li>
              <li><a className="text-muted" href="/#">Payment</a></li>
              <li><a className="text-muted" href="/#">Withdrawal</a></li>
              <li><a className="text-muted" href="/#">About Us</a></li>
            </ul>
          </div>
          <div className="col-6 col-md">
            <h5>Landingpages</h5>
            <ul className="list-unstyled text-small">
              <li><a className="text-muted" href="/#">My Landingpage</a></li>
              <li><a className="text-muted" href="/#">My Other Landingpage</a>
              </li>
              <li><a className="text-muted" href="/#">My Final Landingpage</a>
              </li>
            </ul>
          </div>
          <div className="col-6 col-md">
            <h5>Account</h5>
            <ul className="list-unstyled text-small">
              <li><a className="text-muted" href="/#">Your Orders</a></li>
              <li><a className="text-muted" href="/#">Your Addresses</a></li>
              <li><a className="text-muted" href="/#">Your Personal Data</a>
              </li>
              <li><a className="text-muted" href="/#">Your Treuebonus</a></li>
            </ul>
          </div>
          <div className="col-6 col-md">
            <h5>Payment Methods</h5>
            <ul className="list-unstyled text-small">
              <li><a className="text-muted" href="/#">Klarna</a></li>
              <li><a className="text-muted" href="/#">Invoice</a></li>
              <li><a className="text-muted" href="/#">SOFORT</a></li>
              <li><a className="text-muted" href="/#">mastercard</a></li>
              <li><a className="text-muted" href="/#">Visa</a></li>
              <li><a className="text-muted" href="/#">maestro</a></li>
              <li><a className="text-muted" href="/#">PayPal</a></li>
              <li><a className="text-muted" href="/#">Amazon Pay</a></li>
              <li><a className="text-muted" href="/#">Vorkasse</a></li>
            </ul>
          </div>
        </div>
      </div>

      <hr/>

      <div className="container pb-3 text-muted">
        <span><a className="text-muted" href="/#">Imprint</a></span>
        <span> | </span>
        <span><a className="text-muted" href="/#">Legal Notice</a></span>
        <span> | </span>
        <span><a className="text-muted" href="/#">Data Policy</a></span>
      </div>
    </div>
  );
}

