import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { SpinnerIcon, StateMessage } from 'fds/components';
import readOnlyBlueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import documentsManager from 'fontoxml-documents/documentsManager';
import getNodeId from 'fontoxml-dom-identification/getNodeId';
import evaluateXPathToBoolean from 'fontoxml-selectors/evaluateXPathToBoolean';
import FxNodePreviewWithLinkSelector from 'fontoxml-fx/FxNodePreviewWithLinkSelector.jsx';

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
					' return some $node in $selectableNodes satisfies . is $node',
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

	loadDocument = selectedItem => {
		this.props
			.loadItem(selectedItem.id)
			.then(
				documentId => this.handleLoadDocumentId(documentId, selectedItem.id),
				error => this.handleLoadError(error, selectedItem.id)
			);
	};

	componentWillReceiveProps(nextProps) {
		if (
			nextProps.selectedItem.id === this.props.selectedItem.id &&
			nextProps.selectedItem.documentId
		) {
			return;
		}

		this.setState({ isErrored: false, isLoading: true });

		this.loadDocument(nextProps.selectedItem);
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
			<FxNodePreviewWithLinkSelector
				documentId={selectedItem.documentId}
				onSelectedNodeChange={this.handleSelectedNodeChange}
				selector={linkableElementsQuery}
				selectedNodeId={selectedItem.nodeId}
			/>
		);
	}

	componentDidMount() {
		this.isMountedInDOM = true;

		this.loadDocument(this.props.selectedItem);
	}

	componentWillUnmount() {
		this.isMountedInDOM = false;
	}
}

export default DocumentWithLinkSelectorPreview;
