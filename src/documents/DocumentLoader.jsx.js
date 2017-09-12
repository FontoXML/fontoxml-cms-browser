import documentLoader from 'fontoxml-remote-documents/documentLoader';

const cachedDocumentByRemoteId = {};

class DocumentLoader {
	load(remoteId) {
		const cachedItem = cachedDocumentByRemoteId[remoteId];
		if (cachedItem) {
			if (cachedItem instanceof Error) {
				return Promise.reject(cachedItem);
			}
			if (cachedItem instanceof Promise) {
				return cachedItem;
			}
			return Promise.resolve(cachedItem);
		}

		const promise = documentLoader.loadDocument(remoteId);
		cachedDocumentByRemoteId[remoteId] = promise;
		promise.then(
			documentId => {
				cachedDocumentByRemoteId[remoteId] = documentId;
				return documentId;
			},
			error => {
				cachedDocumentByRemoteId[remoteId] = error;
				return error;
			}
		);

		return promise;
	}

	isItemErrored(remoteId) {
		return cachedDocumentByRemoteId[remoteId] instanceof Error;
	}
}

export default new DocumentLoader();
