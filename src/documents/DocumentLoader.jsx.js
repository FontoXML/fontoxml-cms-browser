import documentLoader from 'fontoxml-remote-documents/documentLoader';

import Loader from '../loaders/Loader.jsx';

const loadItem = remoteId => {
	return documentLoader.loadDocument(remoteId);
};

export default new Loader(loadItem);
