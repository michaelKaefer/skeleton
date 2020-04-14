// import 'dropzone/dist/dropzone.css';
// import 'dropzone/dist/basic.css';
import '../scss/components/_dropzone.scss';

const fileUploadIcon = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-upload" class="svg-inline--fa fa-file-upload fa-w-12 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm65.18 216.01H224v80c0 8.84-7.16 16-16 16h-32c-8.84 0-16-7.16-16-16v-80H94.82c-14.28 0-21.41-17.29-11.27-27.36l96.42-95.7c6.65-6.61 17.39-6.61 24.04 0l96.42 95.7c10.15 10.07 3.03 27.36-11.25 27.36zM377 105L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1c0-6.3-2.5-12.4-7-16.9z"></path></svg>';

// Overrides the original previewTemplate:
const previewTemplate = `\
<div class="alert alert-light dz-preview dz-file-preview">
  <button type="button" class="close mr-1" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true"><i class="fa fa-trash-alt fa-xs"></i></span>
  </button>
  <div class="thumbnail">
    <div class="dz-image"><img data-dz-thumbnail class="rounded" alt="Preview"/></div>
  </div>
  <div class="dz-details">
    <div class="dz-filename">
        <span data-dz-name></span>
        <span data-dz-size></span>
    </div>
  </div>
  <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress/></div>
  <div class="dz-error-message"><span data-dz-errormessage/></div>
</div>\
`;

class DropzoneConfiguration {
  constructor() {
    this.description = null;
  }

  setDescription(description) {
    this.description = description;
  }

  get() {
    let config = {
      maxFilesize: 2, // MiB
      previewTemplate,
    };

    // Set the description message if there is one
    if (this.description !== null) {
      config = {
        ...config,
        dictDefaultMessage: `${fileUploadIcon} ${this.description}`,
      };
    }

    return config;
  }
}

export default new DropzoneConfiguration();
