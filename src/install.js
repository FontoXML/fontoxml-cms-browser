define([
	'fontoxml-modular-ui/uiManager',

	'./data-providers/dataProviders',
	'./data-providers/createDataProviderUsingConfiguredConnectors',
	'./modals/documents/FxCreateDocumentFormModalStack.jsx',
	'./modals/documents/FxOpenDocumentBrowserModal.jsx',
	'./modals/documents/FxOpenOrCreateDocumentModalStack.jsx',
	'./modals/document-links/FxDocumentLinkBrowserModal.jsx',
	'./modals/images/FxImageBrowserModal.jsx'
], function (
	uiManager,

	dataProviders,
	createDataProviderUsingConfiguredConnectors,

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

		dataProviders.set(
			'dataProviderUsingConfiguredConnectorsForDocuments',
			createDataProviderUsingConfiguredConnectors({ assetTypes: ['document'], resultTypes: ['file', 'folder'] })
		);
		dataProviders.set(
			'dataProviderUsingConfiguredConnectorsForDocumentTemplates',
			createDataProviderUsingConfiguredConnectors({ assetTypes: ['document-template'], resultTypes: ['file'] })
		);
		dataProviders.set(
			'dataProviderUsingConfiguredConnectorsForDocumentFolders',
			createDataProviderUsingConfiguredConnectors({ assetTypes: ['document'], resultTypes: ['folder'] })
		);
		dataProviders.set(
			'dataProviderUsingConfiguredConnectorsForImages',
			createDataProviderUsingConfiguredConnectors({
				assetTypes: ['image'],
				resultTypes: ['file', 'folder'],
				uploadAssetType: 'image',
				uploadMimeTypesToAccept: 'image/*',
				uploadMaxFileSizeInBytes: 4194304
			})
		);
	};
});
