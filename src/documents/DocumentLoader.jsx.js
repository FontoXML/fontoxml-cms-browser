import PropTypes from 'prop-types';
import { Component } from 'react';

import FxDocumentLoader from 'fontoxml-fx/FxDocumentLoader.jsx';

class DocumentLoader extends Component {
	static propTypes = {
		children: PropTypes.func.isRequired,
		remoteId: PropTypes.string.isRequired
	};

	documentLoader = new FxDocumentLoader();
	isMountedInDOM = false;

	state = {
		documentId: null,
		isErrored: false,
		isLoading: true
	};

	handleLoadDocumentId = documentId => {
		if (this.isMountedInDOM) {
			this.setState({ isErrored: false, isLoading: false, documentId });
		}
	};

	handleLoadError = _error => {
		if (this.isMountedInDOM) {
			this.setState({ isErrored: true, isLoading: false, documentId: null });
		}
	};

	loadDocument = () => {
		this.documentLoader
			.loadItem(this.props.remoteId)
			.then(this.handleLoadDocumentId, this.handleLoadError);
	};

	componentWillReceiveProps({ remoteId, type }) {
		if (remoteId === this.props.remoteId && type === this.props.type) {
			return;
		}

		this.setState({ isErrored: false, isLoading: true });

		this.loadDocument();
	}

	render() {
		return this.props.children({
			documentId: this.state.documentId,
			isErrored: this.state.isErrored,
			isLoading: this.state.isLoading
		});
	}

	componentDidMount() {
		this.isMountedInDOM = true;

		this.loadDocument();
	}

	componentWillUnmount() {
		this.isMountedInDOM = false;
	}
}

export default DocumentLoader;
