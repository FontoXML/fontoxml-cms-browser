import * as React from 'react';

import readOnlyBlueprint from 'fontoxml-blueprints/src/readOnlyBlueprint';
import {
	Block,
	SpinnerIcon,
	StateMessage,
} from 'fontoxml-design-system/src/components';
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
	// TODO: the implementation assumes this is required... bug waiting to happen...
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

const DocumentWithLinkSelectorPreview: React.FC<Props> = ({
	linkableElementsQuery,
	onItemSelect,
	onItemIsErrored = (_item) => undefined,
	onLoadIsDone = (_documentId) => undefined,
	selectedItem,
	stateLabels,
}) => {
	// used to prevent infinite updates > handleLoadIsDone depends on selectedItem
	// but also changes selectedItem (via onItemSelect) > useEffect() is called again
	const lastSelectedItem = React.useRef<{
		id: RemoteDocumentId;
		documentId: DocumentId;
		nodeId: NodeId;
	} | null>(null);

	// When a item is selected we want to initially select the root node of the document. We do this
	// once when the preview is loaded.
	const handleLoadIsDone = React.useCallback(
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

	const handleSelectedNodeChange = React.useCallback(
		(nodeId) => onItemSelect({ ...selectedItem, documentId, nodeId }),
		[documentId, onItemSelect, selectedItem]
	);

	React.useEffect(() => {
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

export default DocumentWithLinkSelectorPreview;
