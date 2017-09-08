import PropTypes from 'prop-types';
import React, { Component } from 'react';

import DocumentPreview from 'fontoxml-fx/DocumentPreview.jsx';

import { SpinnerIcon, StateMessage } from 'fontoxml-vendor-fds/components';

class DocumentModalPreview extends Component {
	static defaultProps = {
		selectedItem: null
	};

	static propTypes = {
		stateLabels: PropTypes.shape({
			previewError: PropTypes.shape({
				title: PropTypes.string,
				message: PropTypes.string
			}).isRequired,
			loadingPreview: PropTypes.shape({
				title: PropTypes.string,
				message: PropTypes.string
			}).isRequired
		}).isRequired,

		// from withModularBrowserCapabilities
		loadDocument: PropTypes.func.isRequired,
		onItemSelect: PropTypes.func.isRequired,
		selectedItem: PropTypes.object
	};

	isComponentMounted = false;

	state = { isErrored: false, isLoading: true };

	handleLoadDocumentId = documentId => {
		if (this.isComponentMounted) {
			this.props.onItemSelect({ ...this.props.selectedItem, documentId });
			this.setState({ isErrored: false, isLoading: false });
		}
	};

	handleLoadError = error => {
		if (!error) {
			return;
		}

		if (this.isComponentMounted) {
			this.setState({ isErrored: true, isLoading: false });
		}
	};

	componentWillReceiveProps(nextProps) {
		if (
			nextProps.selectedItem.id === this.props.selectedItem.id &&
			nextProps.selectedItem.documentId
		) {
			return;
		}

		this.setState({ isErrored: false, isLoading: true });

		this.props
			.loadDocument(nextProps.selectedItem.id)
			.then(this.handleLoadDocumentId, this.handleLoadError);
	}

	render() {
		const { selectedItem, stateLabels } = this.props;

		if (this.state.isErrored) {
			return (
				<StateMessage
					connotation="warning"
					paddingSize="m"
					visual="exclamation-triangle"
					{...stateLabels.previewError}
				/>
			);
		}

		if (this.state.isLoading) {
			return (
				<StateMessage
					paddingSize="m"
					visual={<SpinnerIcon />}
					{...stateLabels.loadingPreview}
				/>
			);
		}

		return <DocumentPreview documentId={selectedItem.documentId} />;
	}

	componentDidMount() {
		this.isComponentMounted = true;

		this.props
			.loadDocument(this.props.selectedItem.id)
			.then(this.handleLoadDocumentId, this.handleLoadError);
	}

	componentWillUnmount() {
		this.isComponentMounted = false;
	}
}

export default DocumentModalPreview;
