import configuredAssetConnector from 'fontoxml-configuration/get!asset-connector';
import documentsManager from 'fontoxml-documents/documentsManager';
import getImageDataFromUrl from 'fontoxml-image-resolver/getImageDataFromUrl';
import selectionManager from 'fontoxml-selection/selectionManager';

import { onlyResolveLastPromise } from 'fontoxml-vendor-fds/system';

const loadImage = onlyResolveLastPromise((remoteImageId, props) => {
	if (props.cachedFileByRemoteId[remoteImageId]) {
		return Promise.resolve(props.cachedFileByRemoteId[remoteImageId]);
	}

	const documentFile = documentsManager.getDocumentFile(selectionManager.focusedDocumentId);
	return configuredAssetConnector
		.getPreviewUrl(documentFile, 'web', remoteImageId)
		.then(previewUrl => getImageDataFromUrl(window.document, previewUrl));
});

export default function imageLoader(remoteImageId, props, onImageisFinishedLoading = () => {}) {
	loadImage(remoteImageId, props).then(
		imageData => {
			props.addCachedFileByRemoteId[remoteImageId] = imageData;
			onImageisFinishedLoading();
		},
		error => {
			this.props.deleteCachedFileByRemoteId(remoteImageId.id);
			this.props.addCachedErrorByRemoteId(remoteImageId.id, error);
			onImageisFinishedLoading();
		}
	);
}
