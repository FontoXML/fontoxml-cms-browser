import documentLoader from 'fontoxml-remote-documents/documentLoader';

import Loader from '../loaders/Loader.jsx';

class DocumentLoader extends Loader {
	loadItem = remoteId => {
		return documentLoader.loadDocument(remoteId);
	};
}

export default new DocumentLoader();
