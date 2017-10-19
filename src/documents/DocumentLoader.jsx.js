import PropTypes from 'prop-types';
import { Component } from 'react';

import FxDocumentLoader from 'fontoxml-fx/FxDocumentLoader.jsx';

class ImageLoader extends Component {
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

	handleLoadDocumentId = (documentId, idBeingLoaded) => {
		if (this.isMountedInDOM && idBeingLoaded === this.props.selectedItem.id) {
			this.setState({ isErrored: false, isLoading: false, documentId });
		}
	};

	handleLoadError = (error, idBeingLoaded) => {
		if (!error) {
			return;
		}

		if (this.isMountedInDOM && idBeingLoaded === this.props.selectedItem.id) {
			this.setState({ isErrored: true, isLoading: false, documentId: null });
		}
	};

	loadDocument = () => {
		this.documentLoader
			.loadItem(this.props.remoteId)
			.then(
				documentId => this.handleLoadDocumentId(documentId, selectedItem.id),
				error => this.handleLoadError(error, selectedItem.id)
			);
	};

	componentWillReceiveProps({ remoteId }) {
		if (remoteId === this.props.remoteId) {
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

		this.documentLoader
			.loadItem(this.props.remoteId)
			.then(this.handleLoadImage, this.handleLoadError);
	}

	componentWillUnmount() {
		this.isMountedInDOM = false;
	}
}

export default ImageLoader;
