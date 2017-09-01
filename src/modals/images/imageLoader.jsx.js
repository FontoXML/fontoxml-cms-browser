import configuredAssetConnector from 'fontoxml-configuration/get!asset-connector';
import documentsManager from 'fontoxml-documents/documentsManager';
import getImageDataFromUrl from 'fontoxml-image-resolver/getImageDataFromUrl';
import selectionManager from 'fontoxml-selection/selectionManager';

const loadImage = remoteImageId => {
	const documentFile = documentsManager.getDocumentFile(selectionManager.focusedDocumentId);
	return configuredAssetConnector
		.getPreviewUrl(documentFile, 'web', remoteImageId)
		.then(previewUrl => getImageDataFromUrl(window.document, previewUrl));
};

export default function imageLoader(remoteImageId, props, onImageisFinishedLoading = () => {}) {
	loadImage(remoteImageId).then(
		imageData => {
			props.addCachedFileByRemoteId(remoteImageId, imageData);
			onImageisFinishedLoading();
		},
		error => {
			if (!error) {
				return;
			}
			props.deleteCachedFileByRemoteId(remoteImageId);
			props.addCachedErrorByRemoteId(remoteImageId, error);
			onImageisFinishedLoading();
		}
	);
}
