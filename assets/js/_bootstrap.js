import $ from 'jquery';
import 'bootstrap'; // we don't need to use it, this package is only a jQuery plugin which modifies our jQuery variable $
import bsCustomFileInput from 'bs-custom-file-input';

$('[data-toggle="popover"]').popover();
bsCustomFileInput.init();
