define([
	'fontoxml-documents/documentsHierarchy',
	'fontoxml-documents/documentsManager',
	'fontoxml-localization/t',
	'fontoxml-modular-ui/uiManager',
	'fontoxml-operations/addTransform',
	'fontoxml-selection/selectionManager',

	'./data-providers/createDataProviderUsingConfiguredConnectors',
	'./data-providers/dataProviders',
	'./documents/DocumentBrowserModal.jsx',
	'./documents/DocumentTemplateBrowserModal.jsx',
	'./documents/DocumentWithLinkSelectorBrowserModal.jsx',
	'./images/ImageBrowserModal.jsx',
	'./stacks/CreateDocumentModalStack.jsx',
	'./stacks/OpenOrCreateDocumentModalStack.jsx'
], function (
	documentsHierarchy,
	documentsManager,
	t,
	uiManager,
	addTransform,
	selectionManager,

	createDataProviderUsingConfiguredConnectors,
	dataProviders,
	DocumentBrowserModal,
	DocumentTemplateBrowserModal,
	DocumentWithLinkSelectorBrowserModal,
	ImageBrowserModal,
	CreateDocumentModalStack,
	OpenOrCreateDocumentModalStack
) {
	'use strict';

	return function install () {
		addTransform(
			'setBrowseContextToFocusedDocumentOrTopLevelDocumentFromHierarchy',
			function setBrowseContextToFocusedDocumentOrTopLevelDocumentFromHierarchy (stepData) {
				// Use the existing value if set or explicitly omitted
				if (stepData.browseContextDocumentId || stepData.browseContextDocumentId === null) {
					return stepData;
				}

				// Use the focused document
				if (selectionManager.focusedDocumentId) {
					stepData.browseContextDocumentId = documentsManager
						.getDocumentFile(selectionManager.focusedDocumentId)
						.remoteDocumentId;
					return stepData;
				}

				// Use the first loaded document in the hierarchy
				var browseContextHierarchyNode = documentsHierarchy.find(function (hierarchyNode) {
					return hierarchyNode.documentReference && hierarchyNode.documentReference.remoteDocumentId;
				});
				stepData.browseContextDocumentId = browseContextHierarchyNode ?
					browseContextHierarchyNode.documentReference.remoteDocumentId :
					null;

				return stepData;
			}
		);

		dataProviders.set(
			'dataProviderUsingConfiguredConnectorsForDocuments',
			createDataProviderUsingConfiguredConnectors({
				assetTypes: ['document'],
				resultTypes: ['file', 'folder'],
				rootFolderLabel: t('My drive')
			})
		);
		dataProviders.set(
			'dataProviderUsingConfiguredConnectorsForDocumentTemplates',
			createDataProviderUsingConfiguredConnectors({
				assetTypes: ['document-template'],
				resultTypes: ['file'],
				rootFolderLabel: t('Templates')
			})
		);
		dataProviders.set(
			'dataProviderUsingConfiguredConnectorsForDocumentFolders',
			createDataProviderUsingConfiguredConnectors({
				assetTypes: ['document'],
				resultTypes: ['folder'],
				rootFolderLabel: t('My drive')
			})
		);
		dataProviders.set(
			'dataProviderUsingConfiguredConnectorsForImages',
			createDataProviderUsingConfiguredConnectors({
				assetTypes: ['image'],
				resultTypes: ['file', 'folder'],
				rootFolderLabel: t('My drive'),
				uploadAssetType: 'image',
				uploadMimeTypesToAccept: 'image/*',
				uploadMaxFileSizeInBytes: 4194304
			})
		);

		uiManager.registerReactComponent('DocumentBrowserModal', DocumentBrowserModal);
		uiManager.registerReactComponent('DocumentTemplateBrowserModal', DocumentTemplateBrowserModal);
		uiManager.registerReactComponent('DocumentWithLinkSelectorBrowserModal', DocumentWithLinkSelectorBrowserModal);
		uiManager.registerReactComponent('ImageBrowserModal', ImageBrowserModal);
		uiManager.registerReactComponent('CreateDocumentModalStack', CreateDocumentModalStack);
		uiManager.registerReactComponent('OpenOrCreateDocumentModalStack', OpenOrCreateDocumentModalStack);
	};
});
