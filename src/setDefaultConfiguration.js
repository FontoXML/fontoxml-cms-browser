import configurationManager from 'fontoxml-configuration/src/configurationManager.js';

export default function setDefaultConfiguration() {
	/**
	 * Set whether your CMS supports 'jump in tree':
	 * whether or not it responds with hierarchyItems in browse requests.
	 * See the {@link fonto-documentation/docs/editor/fontoxml-editor-documentation/api-s-and-reference/cms-connectors-api/browse-for-documents-and-assets.xml CMS connectors API documentation}
	 * for more information.
	 *
	 * @fontosdk
	 *
	 * @const  {boolean}  cms-browser-sends-hierarchy-items-in-browse-response
	 * @category  add-on/fontoxml-cms-browser
	 */
	configurationManager.setDefault('cms-browser-sends-hierarchy-items-in-browse-response', false);

	/**
	 * Set the mime types to accept when uploading images in the browse modal.
	 *
	 * @fontosdk
	 *
	 * @const  {string}  cms-browser-upload-mime-types-to-accept
	 * @category  add-on/fontoxml-cms-browser
	 */
	configurationManager.setDefault('cms-browser-upload-mime-types-to-accept', 'image/*');

	/**
	 * Set the max file size in bytes to accept when uploading images in the browse modal.
	 *
	 * @fontosdk
	 *
	 * @const  {number}  cms-browser-upload-max-file-size-in-bytes
	 * @category  add-on/fontoxml-cms-browser
	 */
	configurationManager.setDefault('cms-browser-upload-max-file-size-in-bytes', 4194304);
}
