define([
	'fontoxml-modular-ui/uiManager',

	'./old/modals/documents/FxCreateDocumentFormModalStack.jsx',
	'./old/modals/documents/FxOpenOrCreateDocumentModalStack.jsx',
	'./documents/DocumentBrowserModal.jsx',
	'./documents/DocumentWithLinkSelectorBrowserModal.jsx',
	'./images/ImageBrowserModal.jsx'
], function (
	uiManager,

	FxCreateDocumentFormModalStack,
	FxOpenOrCreateDocumentModalStack,
	DocumentBrowserModal,
	DocumentWithLinkSelectorBrowserModal,
	ImageBrowserModal
) {
	'use strict';

	return function install () {
		uiManager.registerReactComponent('FxCreateDocumentFormModalStack', FxCreateDocumentFormModalStack);
		uiManager.registerReactComponent('DocumentBrowserModal', DocumentBrowserModal);
		uiManager.registerReactComponent('FxOpenOrCreateDocumentModalStack', FxOpenOrCreateDocumentModalStack);
		uiManager.registerReactComponent('DocumentWithLinkSelectorBrowserModal', DocumentWithLinkSelectorBrowserModal);
		uiManager.registerReactComponent('ImageBrowserModal', ImageBrowserModal);
	};
});
