define([
	'fontoxml-modular-ui/uiManager',

	'./data-providers/dataProviders',
	'./data-providers/createDataProviderUsingConfiguredConnectors',

	'./modals/documents/FxCreateDocumentFormModalStackController',
	'./modals/documents/FxCreateDocumentFormModalStack.jsx',

	'./modals/documents/FxOpenDocumentBrowserModalController',
	'./modals/documents/FxOpenDocumentBrowserModal.jsx',

	'./modals/documents/FxOpenOrCreateDocumentModalStackController',
	'./modals/documents/FxOpenOrCreateDocumentModalStack.jsx',

	'./modals/document-links/FxDocumentLinkBrowserModalController',
	'./modals/document-links/FxDocumentLinkBrowserModal.jsx',

	'./modals/images/FxImageBrowserModalController',
	'./modals/images/FxImageBrowserModal.jsx'
], function (
	uiManager,

	dataProviders,
	createDataProviderUsingConfiguredConnectors,

	FxCreateDocumentFormModalStackController,
	FxCreateDocumentFormModalStack,

	FxOpenDocumentBrowserModalController,
	FxOpenDocumentBrowserModal,

	FxOpenOrCreateDocumentModalStackController,
	FxOpenOrCreateDocumentModalStack,

	FxDocumentLinkBrowserModalController,
	FxDocumentLinkBrowserModal,

	FxImageBrowserModalController,
	FxImageBrowserModal
) {
	'use strict';

	return function install () {
		uiManager.addController('FxCreateDocumentFormModalStackController', FxCreateDocumentFormModalStackController);
		uiManager.registerReactComponent('FxCreateDocumentFormModalStack', FxCreateDocumentFormModalStack);

		uiManager.addController('FxOpenDocumentBrowserModalController', FxOpenDocumentBrowserModalController);
		uiManager.registerReactComponent('FxOpenDocumentBrowserModal', FxOpenDocumentBrowserModal);

		uiManager.addController('FxOpenOrCreateDocumentModalStackController', FxOpenOrCreateDocumentModalStackController);
		uiManager.registerReactComponent('FxOpenOrCreateDocumentModalStack', FxOpenOrCreateDocumentModalStack);

		uiManager.addController('FxDocumentLinkBrowserModalController', FxDocumentLinkBrowserModalController);
		uiManager.registerReactComponent('FxDocumentLinkBrowserModal', FxDocumentLinkBrowserModal);

		uiManager.addController('FxImageBrowserModalController', FxImageBrowserModalController);
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
