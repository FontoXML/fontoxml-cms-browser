import documentsHierarchy from 'fontoxml-documents/src/documentsHierarchy';
import documentsManager from 'fontoxml-documents/src/documentsManager';
import uiManager from 'fontoxml-modular-ui/src/uiManager';
import addTransform from 'fontoxml-operations/src/addTransform';
import type { RemoteDocumentId } from 'fontoxml-remote-documents/src/types';
import selectionManager from 'fontoxml-selection/src/selectionManager';

import DocumentBrowserModal from './documents/DocumentBrowserModal';
import DocumentTemplateBrowserModal from './documents/DocumentTemplateBrowserModal';
import DocumentWithLinkSelectorBrowserModal from './documents/DocumentWithLinkSelectorBrowserModal';
import ImageBrowserModal from './images/ImageBrowserModal';
import CreateDocumentModalStack from './stacks/CreateDocumentModalStack';
import OpenOrCreateDocumentModalStack from './stacks/OpenOrCreateDocumentModalStack';

export default function install(): void {
	addTransform<{ browseContextDocumentId: RemoteDocumentId | null }>(
		'setBrowseContextToFocusedDocumentOrTopLevelDocumentFromHierarchy',
		function setBrowseContextToFocusedDocumentOrTopLevelDocumentFromHierarchy(
			stepData
		) {
			// Use the existing value if set or explicitly omitted.
			if (
				stepData.browseContextDocumentId ||
				stepData.browseContextDocumentId === null
			) {
				return stepData;
			}

			// Use the focused document.
			if (selectionManager.focusedDocumentId) {
				stepData.browseContextDocumentId =
					documentsManager.getRemoteDocumentId(
						selectionManager.focusedDocumentId
					);
				return stepData;
			}

			// Use the first document in the hierarchy if available.
			stepData.browseContextDocumentId =
				documentsHierarchy.children[0]?.documentReference
					?.remoteDocumentId ?? null;

			return stepData;
		}
	);

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
