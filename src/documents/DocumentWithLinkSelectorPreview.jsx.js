import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { SpinnerIcon, StateMessage } from 'fds/components';
import documentsManager from 'fontoxml-documents/documentsManager';
import evaluateXPathToBoolean from 'fontoxml-selectors/evaluateXPathToBoolean';
import FxDocumentLoader from 'fontoxml-fx/FxDocumentLoader.jsx';
import FxNodePreviewWithLinkSelector from 'fontoxml-fx/FxNodePreviewWithLinkSelector.jsx';
import getNodeId from 'fontoxml-dom-identification/getNodeId';
import readOnlyBlueprint from 'fontoxml-blueprints/readOnlyBlueprint';

class DocumentWithLinkSelectorPreview extends Component {
	static defaultProps = {
		onItemIsErrored: _item => {},
		selectedItem: null
	};

	static propTypes = {
		linkableElementsQuery: PropTypes.string.isRequired,
		onItemIsErrored: PropTypes.func,
		onItemSelect: PropTypes.func.isRequired,
		selectedItem: PropTypes.object,
		stateLabels: PropTypes.shape({
			previewError: PropTypes.shape({
				title: PropTypes.string,
				message: PropTypes.string
			}).isRequired,
			loadingPreview: PropTypes.shape({
				title: PropTypes.string,
				message: PropTypes.string
			}).isRequired
		}).isRequired
	};

	// When a item is selected we want to initially select the root node of the document. We do this
	// once when the preview is loaded.
	handleLoadIsDone = documentId => {
		const newSelectedItem = { ...this.props.selectedItem, documentId };

		// Select the documentElement initially as nodeId if it validates against the linkableElementsQuery
		const node = documentsManager.getDocumentNode(documentId).documentElement;
		if (
			!newSelectedItem.nodeId &&
			node &&
			evaluateXPathToBoolean(
				'let $selectableNodes := ' +
					this.props.linkableElementsQuery +
					' return some $node in $selectableNodes satisfies . is $node',
				node,
				readOnlyBlueprint
			)
		) {
			newSelectedItem.nodeId = getNodeId(node);
		}

		this.props.onItemSelect(newSelectedItem);
	};

	handleSelectedNodeChange = nodeId =>
		this.props.onItemSelect({ ...this.props.selectedItem, nodeId });

	render() {
		const { linkableElementsQuery, stateLabels, selectedItem } = this.props;

		return (
			<FxDocumentLoader
				remoteId={selectedItem.id}
				onError={this.props.onItemIsErrored}
				onLoadIsDone={this.handleLoadIsDone}
			>
				{({ isErrored, isLoading, documentId }) => {
					if (isErrored) {
						return (
							<StateMessage
								connotation="warning"
								paddingSize="m"
								visual="exclamation-triangle"
								{...stateLabels.previewError}
							/>
						);
					}

					if (isLoading) {
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
							documentId={documentId}
							onSelectedNodeChange={this.handleSelectedNodeChange}
							selector={linkableElementsQuery}
							selectedNodeId={selectedItem.nodeId}
						/>
					);
				}}
			</FxDocumentLoader>
		);
	}
}

export default DocumentWithLinkSelectorPreview;
