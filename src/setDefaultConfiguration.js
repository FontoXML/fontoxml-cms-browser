import configurationManager from 'fontoxml-configuration/src/configurationManager.js';

export default function setDefaultConfiguration() {
	/**
	 * Set whether your CMS supports 'jump in tree':
	 * whether or not it responds with hierarchyItems in browse requests.
	 * See https://documentation.fontoxml.com/editor/latest/browse-for-documents-and-assets-3099216.html
	 * for more information.
	 *
	 * @fontosdk
	 *
	 * @const  {boolean}  cms-browser-sends-hierarchy-items-in-browse-response
	 * @category  add-on/fontoxml-cms-browser
	 */
	configurationManager.setDefault('cms-browser-sends-hierarchy-items-in-browse-response', false);
}
