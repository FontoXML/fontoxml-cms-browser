import configuredAssetConnector from 'fontoxml-configuration/get!asset-connector';
import documentsManager from 'fontoxml-documents/documentsManager';
import getImageDataFromUrl from 'fontoxml-image-resolver/getImageDataFromUrl';
import selectionManager from 'fontoxml-selection/selectionManager';

const cachedImageByRemoteId = {};

class ImageLoader {
	load(remoteId) {
		const cachedItem = cachedImageByRemoteId[remoteId];
		if (cachedItem) {
			if (cachedItem instanceof Error) {
				return Promise.reject(cachedItem);
			}
			if (cachedItem instanceof Promise) {
				return cachedItem;
			}
			return Promise.resolve(cachedItem);
		}

		const documentFile = documentsManager.getDocumentFile(selectionManager.focusedDocumentId);
		const promise = configuredAssetConnector
			.getPreviewUrl(documentFile, 'web', remoteId)
			.then(previewUrl => getImageDataFromUrl(window.document, previewUrl));

		cachedImageByRemoteId[remoteId] = promise;
		promise.then(
			imageData => {
				cachedImageByRemoteId[remoteId] = imageData;
				return imageData;
			},
			error => {
				cachedImageByRemoteId[remoteId] = error;
				return error;
			}
		);

		return promise;
	}

	isItemErrored(remoteId) {
		return this.cachedFileByRemoteId[remoteId] instanceof Error;
	}
}

export default new ImageLoader();
