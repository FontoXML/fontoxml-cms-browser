define([
	'fontoxml-modular-ui/uiManager',

	'./modals/documents/FxCreateDocumentFormModalStack.jsx',
	'./modals/documents/FxOpenDocumentBrowserModal.jsx',
	'./modals/documents/FxOpenOrCreateDocumentModalStack.jsx',
	'./modals/document-links/FxDocumentLinkBrowserModal.jsx',
	'./modals/images/FxImageBrowserModal.jsx'
], function (
	uiManager,

	FxCreateDocumentFormModalStack,
	FxOpenDocumentBrowserModal,
	FxOpenOrCreateDocumentModalStack,
	FxDocumentLinkBrowserModal,
	FxImageBrowserModal
) {
	'use strict';

	return function install () {
		uiManager.registerReactComponent('FxCreateDocumentFormModalStack', FxCreateDocumentFormModalStack);
		uiManager.registerReactComponent('FxOpenDocumentBrowserModal', FxOpenDocumentBrowserModal);
		uiManager.registerReactComponent('FxOpenOrCreateDocumentModalStack', FxOpenOrCreateDocumentModalStack);
		uiManager.registerReactComponent('FxDocumentLinkBrowserModal', FxDocumentLinkBrowserModal);
		uiManager.registerReactComponent('FxImageBrowserModal', FxImageBrowserModal);
	};
});
