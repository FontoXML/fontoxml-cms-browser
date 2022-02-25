import { Block, SpinnerIcon, StateMessage } from 'fds/components';
import React, { Component } from 'react';

import readOnlyBlueprint from 'fontoxml-blueprints/src/readOnlyBlueprint';
import documentsManager from 'fontoxml-documents/src/documentsManager';
import getNodeId from 'fontoxml-dom-identification/src/getNodeId';
import FxDocumentLoader from 'fontoxml-fx/src/FxDocumentLoader';
import FxErroredTemplatedView from 'fontoxml-fx/src/FxErroredTemplatedView';
import _FxNodePreviewWithLinkSelector from 'fontoxml-fx/src/FxNodePreviewWithLinkSelector';
import evaluateXPathToBoolean from 'fontoxml-selectors/src/evaluateXPathToBoolean';

type Props = {
	linkableElementsQuery: string;
	onItemIsErrored?(...args: unknown[]): unknown;
	onItemSelect(...args: unknown[]): unknown;
	onLoadIsDone?(...args: unknown[]): unknown;
	selectedItem?: object;
	stateLabels: {
		loadingPreview: {
			title?: string;
			message?: string;
		};
	};
};

class DocumentWithLinkSelectorPreview extends Component<Props> {
	static defaultProps = {
		onItemIsErrored: (_item) => {},
		onLoadIsDone: (_documentId) => {},
		selectedItem: null,
	};

	// When a item is selected we want to initially select the root node of the document. We do this
	// once when the preview is loaded.
	handleLoadIsDone = (documentId) => {
		const newSelectedItem = { ...this.props.selectedItem, documentId };

		// Select the documentElement initially as nodeId if it validates against the linkableElementsQuery
		const node =
			documentsManager.getDocumentNode(documentId).documentElement;
		if (
			!newSelectedItem.nodeId &&
			node &&
			evaluateXPathToBoolean(
				`let $selectableNodes := ${this.props.linkableElementsQuery} return some $node in $selectableNodes satisfies . is $node`,
				node,
				readOnlyBlueprint
			)
		) {
			newSelectedItem.nodeId = getNodeId(node);
		}

		this.props.onItemSelect(newSelectedItem);
		this.props.onLoadIsDone(documentId);
	};

	handleSelectedNodeChange = (nodeId) =>
		this.props.onItemSelect({ ...this.props.selectedItem, nodeId });

	render() {
		const { linkableElementsQuery, stateLabels, selectedItem } = this.props;

		return (
			<FxDocumentLoader
				remoteId={selectedItem.id}
				onError={this.props.onItemIsErrored}
				onLoadIsDone={this.handleLoadIsDone}
			>
				{({
					isErrored,
					isLoading,
					documentId,
					error,
					retryLoadDocument,
				}) => {
					if (isErrored) {
						return (
							<Block flex="1" paddingSize="l" isScrollContainer>
								<FxErroredTemplatedView
									error={error}
									retryLoadDocument={retryLoadDocument}
								/>
							</Block>
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
						<_FxNodePreviewWithLinkSelector
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
