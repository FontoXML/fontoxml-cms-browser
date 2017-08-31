import React, { Component } from 'react';

import documentLoader from 'fontoxml-remote-documents/documentLoader';
import onlyResolveLastPromise from 'fontoxml-utils/onlyResolveLastPromise';

import { SpinnerIcon } from 'fontoxml-vendor-fds/components';

class FxDocumentLoader extends Component {
	static defaultProps = {
		renderLoadingMessage: () => <SpinnerIcon align="center" />,
		onError: () => {},
		onLoadComplete: () => {}
	};

	state = { documentId: null, isLoading: false, lastError: null };

	loadDocument = onlyResolveLastPromise(remoteDocumentId =>
		documentLoader.loadDocument(remoteDocumentId)
	);

	refreshData(remoteDocumentId) {
		this.setState({ isLoading: true });

		this.loadDocument(remoteDocumentId).then(
			documentId => {
				if (!this.isComponentMounted) {
					return;
				}

				this.props.onLoadComplete(documentId);

				this.setState({ documentId, isLoading: false, lastError: null });
			},
			error => {
				if (error) {
					if (!this.isComponentMounted) {
						return;
					}

					console.error(error);
					this.props.onError(error);

					this.setState({ documentId: null, isLoading: false, lastError: error });
				}
			}
		);
	}

	componentWillMount() {
		const { remoteDocumentId } = this.props;

		this.refreshData(remoteDocumentId);
	}

	componentDidMount() {
		this.isComponentMounted = true;
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.remoteDocumentId !== this.props.remoteDocumentId) {
			this.refreshData(nextProps.remoteDocumentId);
		}
	}

	render() {
		const { documentId, isLoading, lastError } = this.state;
		const { renderLoadingMessage } = this.props;

		return isLoading ? renderLoadingMessage() : this.props.children(documentId, lastError);
	}

	componentWillUnmount() {
		this.isComponentMounted = false;
	}
}

export default FxDocumentLoader;
