import { Block, SpinnerIcon, StateMessage } from 'fds/components';
import type { FC } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';

import readOnlyBlueprint from 'fontoxml-blueprints/src/readOnlyBlueprint';
import documentsManager from 'fontoxml-documents/src/documentsManager';
import type { DocumentId } from 'fontoxml-documents/src/types';
import getNodeId from 'fontoxml-dom-identification/src/getNodeId';
import type { NodeId } from 'fontoxml-dom-identification/src/types';
import FxNodePreviewErrorPlaceholder from 'fontoxml-fx/src/FxNodePreviewErrorPlaceholder';
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
	// used to prevent infinite updates > handleLoadIsDone depends on selectedItem
	// but also changes selectedItem (via onItemSelect) > useEffect() is called again
	const lastSelectedItem = useRef<{
		id: RemoteDocumentId;
		documentId: DocumentId;
		nodeId: NodeId;
	}>(null);

	// When a item is selected we want to initially select the root node of the document. We do this
	// once when the preview is loaded.
	const handleLoadIsDone = useCallback(
		(documentId) => {
			const newSelectedItem = { ...selectedItem, documentId };

			if (!newSelectedItem.nodeId) {
				// Select the documentElement initially as nodeId if it validates against the linkableElementsQuery
				const node =
					documentsManager.getDocumentNode(
						documentId
					).documentElement;
				if (
					node &&
					evaluateXPathToBoolean(
						`let $selectableNodes := ${linkableElementsQuery} return some $node in $selectableNodes satisfies . is $node`,
						node,
						readOnlyBlueprint
					)
				) {
					newSelectedItem.nodeId = getNodeId(node);
				}
			}

			const hasChanged =
				!lastSelectedItem.current ||
				lastSelectedItem.current.nodeId !== newSelectedItem.nodeId ||
				lastSelectedItem.current.documentId !==
					newSelectedItem.documentId;
			if (hasChanged) {
				lastSelectedItem.current = newSelectedItem;
				onLoadIsDone(documentId);
				onItemSelect(newSelectedItem);
			}
		},
		[linkableElementsQuery, onItemSelect, onLoadIsDone, selectedItem]
	);

	const { isErrored, isLoading, documentId, error, retryLoadDocument } =
		useDocumentLoader(selectedItem.id);

	const handleSelectedNodeChange = useCallback(
		(nodeId) => onItemSelect({ ...selectedItem, documentId, nodeId }),
		[documentId, onItemSelect, selectedItem]
	);

	useEffect(() => {
		if (isLoading) {
			return;
		}

		if (error) {
			onItemIsErrored(selectedItem.id, error);
		} else {
			handleLoadIsDone(documentId);
		}
	}, [
		documentId,
		error,
		handleLoadIsDone,
		isLoading,
		onItemIsErrored,
		selectedItem.id,
	]);

	if (isErrored) {
		return (
			<Block flex="1" paddingSize="l" isScrollContainer>
				<FxNodePreviewErrorPlaceholder
					error={error}
					retryLoadDocument={retryLoadDocument}
					remoteDocumentId={selectedItem.id}
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
