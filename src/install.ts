import configurationManager from 'fontoxml-configuration/src/configurationManager';
import documentsHierarchy from 'fontoxml-documents/src/documentsHierarchy';
import documentsManager from 'fontoxml-documents/src/documentsManager';
import t from 'fontoxml-localization/src/t';
import uiManager from 'fontoxml-modular-ui/src/uiManager';
import addTransform from 'fontoxml-operations/src/addTransform';
import selectionManager from 'fontoxml-selection/src/selectionManager';

import dataProviders from './dataProviders';
import DocumentBrowserModal from './documents/DocumentBrowserModal';
import DocumentTemplateBrowserModal from './documents/DocumentTemplateBrowserModal';
import DocumentWithLinkSelectorBrowserModal from './documents/DocumentWithLinkSelectorBrowserModal';
import ImageBrowserModal from './images/ImageBrowserModal';
import CreateDocumentModalStack from './stacks/CreateDocumentModalStack';
import OpenOrCreateDocumentModalStack from './stacks/OpenOrCreateDocumentModalStack';

const cmsBrowserUploadMimeTypesToAccept = configurationManager.get(
	'cms-browser-upload-mime-types-to-accept'
);

const cmsBrowserUploadMaxFileSizeInBytes = configurationManager.get(
	'cms-browser-upload-max-file-size-in-bytes'
);

export default function install(): void {
	addTransform(
		'setBrowseContextToFocusedDocumentOrTopLevelDocumentFromHierarchy',
		function setBrowseContextToFocusedDocumentOrTopLevelDocumentFromHierarchy(
			stepData
		) {
			// Use the existing value if set or explicitly omitted
			if (
				stepData.browseContextDocumentId ||
				stepData.browseContextDocumentId === null
			) {
				return stepData;
			}

			// Use the focused document
			if (selectionManager.focusedDocumentId) {
				stepData.browseContextDocumentId =
					documentsManager.getRemoteDocumentId(
						selectionManager.focusedDocumentId
					);
				return stepData;
			}

			// Use the first loaded document in the hierarchy
			const browseContextHierarchyNode = documentsHierarchy.find(
				function (hierarchyNode) {
					return (
						hierarchyNode.documentReference &&
						hierarchyNode.documentReference.remoteDocumentId
					);
				}
			);
			stepData.browseContextDocumentId = browseContextHierarchyNode
				? browseContextHierarchyNode.documentReference.remoteDocumentId
				: null;

			return stepData;
		}
	);

	dataProviders.set('dataProviderUsingConfiguredConnectorsForDocuments', {
		assetTypes: ['document'],
		resultTypes: ['file', 'folder'],
		rootFolderLabel: t('Document library'),
	});
	dataProviders.set(
		'dataProviderUsingConfiguredConnectorsForDocumentTemplates',
		{
			assetTypes: ['document-template'],
			resultTypes: ['file'],
			rootFolderLabel: t('Templates'),
		}
	);
	dataProviders.set(
		'dataProviderUsingConfiguredConnectorsForDocumentFolders',
		{
			assetTypes: ['document'],
			resultTypes: ['folder'],
			rootFolderLabel: t('Document library'),
		}
	);
	dataProviders.set('dataProviderUsingConfiguredConnectorsForImages', {
		assetTypes: ['image'],
		resultTypes: ['file', 'folder'],
		rootFolderLabel: t('Image library'),
		uploadAssetType: 'image',
		uploadMimeTypesToAccept: cmsBrowserUploadMimeTypesToAccept,
		uploadMaxFileSizeInBytes: cmsBrowserUploadMaxFileSizeInBytes,
	});

	uiManager.registerReactComponent(
		'DocumentBrowserModal',
		DocumentBrowserModal
	);
	uiManager.registerReactComponent(
		'DocumentTemplateBrowserModal',
		DocumentTemplateBrowserModal
	);
	uiManager.registerReactComponent(
		'DocumentWithLinkSelectorBrowserModal',
		DocumentWithLinkSelectorBrowserModal
	);
	uiManager.registerReactComponent('ImageBrowserModal', ImageBrowserModal);
	uiManager.registerReactComponent(
		'CreateDocumentModalStack',
		CreateDocumentModalStack
	);
	uiManager.registerReactComponent(
		'OpenOrCreateDocumentModalStack',
		OpenOrCreateDocumentModalStack
	);
}
