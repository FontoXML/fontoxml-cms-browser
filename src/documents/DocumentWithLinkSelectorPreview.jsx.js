import PropTypes from 'prop-types';
import React, { Component } from 'react';

import readOnlyBlueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import documentsManager from 'fontoxml-documents/documentsManager';
import getNodeId from 'fontoxml-dom-identification/getNodeId';
import evaluateXPathToBoolean from 'fontoxml-selectors/evaluateXPathToBoolean';
import NodePreviewWithLinkSelector from 'fontoxml-fx/NodePreviewWithLinkSelector.jsx';

import { SpinnerIcon, StateMessage } from 'fontoxml-vendor-fds/components';

class DocumentWithLinkSelectorPreview extends Component {
	static defaultProps = {
		initialNodeId: null,
		initialSelectedItemId: null,
		selectedItem: null
	};

	static propTypes = {
		linkableElementsQuery: PropTypes.string.isRequired,
		initialNodeId: PropTypes.string,
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
		initialSelectedItemId: PropTypes.string,
		loadItem: PropTypes.func.isRequired,
		onItemSelect: PropTypes.func.isRequired,
		selectedItem: PropTypes.object
	};

	isMountedInDOM = false;

	state = { isErrored: false, isLoading: true };

	handleLoadDocumentId = (documentId, idBeingLoaded) => {
		if (!this.isMountedInDOM || idBeingLoaded !== this.props.selectedItem.id) {
			return;
		}

		const node = documentsManager.getDocumentNode(documentId).documentElement;
		if (
			this.props.initialNodeId !== null &&
			this.props.initialSelectedItemId === this.props.selectedItem.id
		) {
			this.props.onItemSelect({
				...this.props.selectedItem,
				documentId,
				nodeId: this.props.initialNodeId
			});
		} else if (
			node &&
			evaluateXPathToBoolean(
				'let $selectableNodes := ' +
					this.props.linkableElementsQuery +
					' return . = $selectableNodes',
				node,
				readOnlyBlueprint
			)
		) {
			this.props.onItemSelect({
				...this.props.selectedItem,
				documentId,
				nodeId: getNodeId(node)
			});
		} else {
			this.props.onItemSelect({ ...this.props.selectedItem, documentId });
		}

		this.setState({ isErrored: false, isLoading: false });
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

	handleSelectedNodeChange = nodeId =>
		this.props.onItemSelect({ ...this.props.selectedItem, nodeId });

	render() {
		const { linkableElementsQuery, selectedItem, stateLabels } = this.props;

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

		return (
			<NodePreviewWithLinkSelector
				documentId={selectedItem.documentId}
				onSelectedNodeChange={this.handleSelectedNodeChange}
				selector={linkableElementsQuery}
				selectedNodeId={selectedItem.nodeId}
			/>
		);
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

export default DocumentWithLinkSelectorPreview;
