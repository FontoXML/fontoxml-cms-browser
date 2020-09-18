import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Flex, SpinnerIcon, StateMessage } from 'fds/components';
import documentsManager from 'fontoxml-documents/src/documentsManager.js';
import evaluateXPathToBoolean from 'fontoxml-selectors/src/evaluateXPathToBoolean.js';
import FxDocumentLoader from 'fontoxml-fx/src/FxDocumentLoader.jsx';
import FxErroredTemplatedView from 'fontoxml-fx/src/FxErroredTemplatedView.jsx';
import FxNodePreviewWithLinkSelector from 'fontoxml-fx/src/FxNodePreviewWithLinkSelector.jsx';
import getNodeId from 'fontoxml-dom-identification/src/getNodeId.js';
import readOnlyBlueprint from 'fontoxml-blueprints/src/readOnlyBlueprint.js';

class DocumentWithLinkSelectorPreview extends Component {
	static defaultProps = {
		onItemIsErrored: _item => {},
		onLoadIsDone: _documentId => {},
		selectedItem: null
	};

	static propTypes = {
		linkableElementsQuery: PropTypes.string.isRequired,
		onItemIsErrored: PropTypes.func,
		onItemSelect: PropTypes.func.isRequired,
		onLoadIsDone: PropTypes.func,
		selectedItem: PropTypes.object,
		stateLabels: PropTypes.shape({
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
		this.props.onLoadIsDone(documentId);
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
				{({ isErrored, isLoading, documentId, error, retryLoadDocument }) => {
					if (isErrored) {
						return (
							<Flex flex="1" paddingSize="l" isScrollContainer>
								<FxErroredTemplatedView
									error={error}
									retryLoadDocument={retryLoadDocument}
								/>
							</Flex>
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
