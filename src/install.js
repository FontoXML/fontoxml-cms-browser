import configurationManager from 'fontoxml-configuration/src/configurationManager.js';
import documentsHierarchy from 'fontoxml-documents/src/documentsHierarchy.js';
import documentsManager from 'fontoxml-documents/src/documentsManager.js';
import t from 'fontoxml-localization/src/t.js';
import uiManager from 'fontoxml-modular-ui/src/uiManager.js';
import addTransform from 'fontoxml-operations/src/addTransform.js';
import selectionManager from 'fontoxml-selection/src/selectionManager.js';
import dataProviders from './dataProviders.js';
import DocumentBrowserModal from './documents/DocumentBrowserModal.jsx';
import DocumentTemplateBrowserModal from './documents/DocumentTemplateBrowserModal.jsx';
import DocumentWithLinkSelectorBrowserModal from './documents/DocumentWithLinkSelectorBrowserModal.jsx';
import ImageBrowserModal from './images/ImageBrowserModal.jsx';
import CreateDocumentModalStack from './stacks/CreateDocumentModalStack.jsx';
import OpenOrCreateDocumentModalStack from './stacks/OpenOrCreateDocumentModalStack.jsx';

const cmsBrowserUploadMimeTypesToAccept = configurationManager.get(
	'cms-browser-upload-mime-types-to-accept'
);

const cmsBrowserUploadMaxFileSizeInBytes = configurationManager.get(
	'cms-browser-upload-max-file-size-in-bytes'
);

export default function install() {
	addTransform(
		'setBrowseContextToFocusedDocumentOrTopLevelDocumentFromHierarchy',
		function setBrowseContextToFocusedDocumentOrTopLevelDocumentFromHierarchy(stepData) {
			// Use the existing value if set or explicitly omitted
			if (stepData.browseContextDocumentId || stepData.browseContextDocumentId === null) {
				return stepData;
			}

			// Use the focused document
			if (selectionManager.focusedDocumentId) {
				stepData.browseContextDocumentId = documentsManager.getRemoteDocumentId(
					selectionManager.focusedDocumentId
				);
				return stepData;
			}

			// Use the first loaded document in the hierarchy
			var browseContextHierarchyNode = documentsHierarchy.find(function(hierarchyNode) {
				return (
					hierarchyNode.documentReference &&
					hierarchyNode.documentReference.remoteDocumentId
				);
			});
			stepData.browseContextDocumentId = browseContextHierarchyNode
				? browseContextHierarchyNode.documentReference.remoteDocumentId
				: null;

			return stepData;
		}
	);

	dataProviders.set('dataProviderUsingConfiguredConnectorsForDocuments', {
		assetTypes: ['document'],
		resultTypes: ['file', 'folder'],
		rootFolderLabel: t('My drive')
	});
	dataProviders.set('dataProviderUsingConfiguredConnectorsForDocumentTemplates', {
		assetTypes: ['document-template'],
		resultTypes: ['file'],
		rootFolderLabel: t('Templates')
	});
	dataProviders.set('dataProviderUsingConfiguredConnectorsForDocumentFolders', {
		assetTypes: ['document'],
		resultTypes: ['folder'],
		rootFolderLabel: t('My drive')
	});
	dataProviders.set('dataProviderUsingConfiguredConnectorsForImages', {
		assetTypes: ['image'],
		resultTypes: ['file', 'folder'],
		rootFolderLabel: t('My drive'),
		uploadAssetType: 'image',
		uploadMimeTypesToAccept: cmsBrowserUploadMimeTypesToAccept,
		uploadMaxFileSizeInBytes: cmsBrowserUploadMaxFileSizeInBytes
	});

	uiManager.registerReactComponent('DocumentBrowserModal', DocumentBrowserModal);
	uiManager.registerReactComponent('DocumentTemplateBrowserModal', DocumentTemplateBrowserModal);
	uiManager.registerReactComponent(
		'DocumentWithLinkSelectorBrowserModal',
		DocumentWithLinkSelectorBrowserModal
	);
	uiManager.registerReactComponent('ImageBrowserModal', ImageBrowserModal);
	uiManager.registerReactComponent('CreateDocumentModalStack', CreateDocumentModalStack);
	uiManager.registerReactComponent(
		'OpenOrCreateDocumentModalStack',
		OpenOrCreateDocumentModalStack
	);
}
