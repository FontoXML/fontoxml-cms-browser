define([
	'fontoxml-modular-ui/uiManager',

	'./old/modals/documents/FxCreateDocumentFormModalStack.jsx',
	'./old/modals/documents/FxOpenDocumentBrowserModal.jsx',
	'./old/modals/documents/FxOpenOrCreateDocumentModalStack.jsx',
	'./documents/DocumentWithLinkSelectorBrowserModal.jsx',
	'./images/ImageBrowserModal.jsx'
], function (
	uiManager,

	FxCreateDocumentFormModalStack,
	FxOpenDocumentBrowserModal,
	FxOpenOrCreateDocumentModalStack,
	DocumentWithLinkSelectorBrowserModal,
	ImageBrowserModal
) {
	'use strict';

	return function install () {
		uiManager.registerReactComponent('FxCreateDocumentFormModalStack', FxCreateDocumentFormModalStack);
		uiManager.registerReactComponent('FxOpenDocumentBrowserModal', FxOpenDocumentBrowserModal);
		uiManager.registerReactComponent('FxOpenOrCreateDocumentModalStack', FxOpenOrCreateDocumentModalStack);
		uiManager.registerReactComponent('DocumentWithLinkSelectorBrowserModal', DocumentWithLinkSelectorBrowserModal);
		uiManager.registerReactComponent('ImageBrowserModal', ImageBrowserModal);
	};
});
