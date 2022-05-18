import { Block, SpinnerIcon, StateMessage } from 'fds/components';
import type { FC } from 'react';
import React, { useCallback } from 'react';

import readOnlyBlueprint from 'fontoxml-blueprints/src/readOnlyBlueprint';
import documentsManager from 'fontoxml-documents/src/documentsManager';
import getNodeId from 'fontoxml-dom-identification/src/getNodeId';
import type { NodeId } from 'fontoxml-dom-identification/src/types';
import FxErroredTemplatedView from 'fontoxml-fx/src/FxErroredTemplatedView';
import _FxNodePreviewWithLinkSelector from 'fontoxml-fx/src/FxNodePreviewWithLinkSelector';
import useDocumentLoader from 'fontoxml-fx/src/useDocumentLoader';
import type { RemoteDocumentId } from 'fontoxml-remote-documents/src/types';
import evaluateXPathToBoolean from 'fontoxml-selectors/src/evaluateXPathToBoolean';

type Props = {
	linkableElementsQuery: string;
	onItemIsErrored?(...args: unknown[]): unknown;
	onItemSelect(...args: unknown[]): unknown;
	onLoadIsDone?(...args: unknown[]): unknown;
	selectedItem?: {
		id: RemoteDocumentId;
		description: string;
		nodeId: NodeId;
	};
	stateLabels: {
		loadingPreview: {
			title?: string;
			message?: string;
		};
	};
};

const DocumentWithLinkSelectorPreview: FC<Props> = ({
	linkableElementsQuery,
	onItemSelect,
	onItemIsErrored,
	onLoadIsDone,
	selectedItem,
	stateLabels,
}) => {
	// When a item is selected we want to initially select the root node of the document. We do this
	// once when the preview is loaded.
	const handleLoadIsDone = useCallback(
		(documentId) => {
			const newSelectedItem = { ...selectedItem, documentId };

			// Select the documentElement initially as nodeId if it validates against the linkableElementsQuery
			const node =
				documentsManager.getDocumentNode(documentId).documentElement;
			if (
				!newSelectedItem.nodeId &&
				node &&
				evaluateXPathToBoolean(
					`let $selectableNodes := ${linkableElementsQuery} return some $node in $selectableNodes satisfies . is $node`,
					node,
					readOnlyBlueprint
				)
			) {
				newSelectedItem.nodeId = getNodeId(node);
			}

			onItemSelect(newSelectedItem);
			onLoadIsDone(documentId);
		},
		[linkableElementsQuery, onItemSelect, onLoadIsDone, selectedItem]
	);

	const handleSelectedNodeChange = useCallback(
		(nodeId) => onItemSelect({ ...selectedItem, nodeId }),
		[onItemSelect, selectedItem]
	);

	const { isErrored, isLoading, documentId, error, retryLoadDocument } =
		useDocumentLoader(selectedItem.id, handleLoadIsDone, onItemIsErrored);

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
			onSelectedNodeChange={handleSelectedNodeChange}
			selector={linkableElementsQuery}
			selectedNodeId={selectedItem.nodeId}
		/>
	);
};

DocumentWithLinkSelectorPreview.defaultProps = {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onItemIsErrored: (_item) => {},
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onLoadIsDone: (_documentId) => {},
	selectedItem: null,
};

export default DocumentWithLinkSelectorPreview;
