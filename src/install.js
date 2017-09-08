define([
	'fontoxml-modular-ui/uiManager',

	'./documents/DocumentBrowserModal.jsx',
	'./documents/DocumentWithLinkSelectorBrowserModal.jsx',
	'./images/ImageBrowserModal.jsx',
	'./stacks/CreateDocumentModalStack.jsx',
	'./stacks/OpenOrCreateDocumentModalStack.jsx'
], function (
	uiManager,

	DocumentBrowserModal,
	DocumentWithLinkSelectorBrowserModal,
	ImageBrowserModal,
	CreateDocumentModalStack,
	OpenOrCreateDocumentModalStack
) {
	'use strict';

	return function install () {
		uiManager.registerReactComponent('DocumentBrowserModal', DocumentBrowserModal);
		uiManager.registerReactComponent('DocumentWithLinkSelectorBrowserModal', DocumentWithLinkSelectorBrowserModal);
		uiManager.registerReactComponent('ImageBrowserModal', ImageBrowserModal);
		uiManager.registerReactComponent('CreateDocumentModalStack', CreateDocumentModalStack);
		uiManager.registerReactComponent('OpenOrCreateDocumentModalStack', OpenOrCreateDocumentModalStack);
	};
});
