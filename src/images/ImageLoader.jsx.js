import configuredAssetConnector from 'fontoxml-configuration/get!asset-connector';
import documentsManager from 'fontoxml-documents/documentsManager';
import getImageDataFromUrl from 'fontoxml-image-resolver/getImageDataFromUrl';
import selectionManager from 'fontoxml-selection/selectionManager';

import Loader from '../loaders/Loader.jsx';

const loadItem = remoteId => {
	const documentFile = documentsManager.getDocumentFile(selectionManager.focusedDocumentId);
	return configuredAssetConnector
		.getPreviewUrl(documentFile, 'web', remoteId)
		.then(previewUrl => getImageDataFromUrl(window.document, previewUrl));
};

export default new Loader(loadItem);
