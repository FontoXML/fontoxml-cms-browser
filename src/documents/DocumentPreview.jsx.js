import PropTypes from 'prop-types';
import React, { Component } from 'react';

import NodePreview from 'fontoxml-fx/NodePreview.jsx';

import { SpinnerIcon, StateMessage } from 'fontoxml-vendor-fds/components';

class DocumentPreview extends Component {
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
		loadItem: PropTypes.func.isRequired,
		onItemSelect: PropTypes.func.isRequired,
		selectedItem: PropTypes.object
	};

	isMountedInDOM = false;

	state = { isErrored: false, isLoading: true };

	handleLoadDocumentId = (documentId, idBeingLoaded) => {
		if (this.isMountedInDOM && idBeingLoaded === this.props.selectedItem.id) {
			this.props.onItemSelect({ ...this.props.selectedItem, documentId });
			this.setState({ isErrored: false, isLoading: false });
		}
	};

	handleLoadError = (error, idBeingLoaded) => {
		if (!error) {
			return;
		}

		if (this.isMountedInDOM && idBeingLoaded === this.props.selectedItem.id) {
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
			.loadItem(nextProps.selectedItem.id)
			.then(
				documentId => this.handleLoadDocumentId(documentId, nextProps.selectedItem.id),
				error => this.handleLoadError(error, nextProps.selectedItem.id)
			);
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

		return <NodePreview documentId={selectedItem.documentId} />;
	}

	componentDidMount() {
		this.isMountedInDOM = true;

		this.props
			.loadItem(this.props.selectedItem.id)
			.then(
				documentId => this.handleLoadDocumentId(documentId, this.props.selectedItem.id),
				error => this.handleLoadError(error, this.props.selectedItem.id)
			);
	}

	componentWillUnmount() {
		this.isMountedInDOM = false;
	}
}

export default DocumentPreview;
