import type { Dispatch, FC, SetStateAction } from 'react';

import {
	Block,
	SpinnerIcon,
	StateMessage,
} from 'fontoxml-design-system/src/components';
import type { DocumentId } from 'fontoxml-documents/src/types';
import type { NodeId } from 'fontoxml-dom-identification/src/types';
import FxNodePreviewErrorPlaceholder from 'fontoxml-fx/src/FxNodePreviewErrorPlaceholder';
import FxNodePreviewWithLinkSelector from 'fontoxml-fx/src/FxNodePreviewWithLinkSelector';
import type { RemoteDocumentId } from 'fontoxml-remote-documents/src/types';

type Props = {
	linkableElementsQuery: string;
	documentId: DocumentId | null;
	error: Error | null;
	isErrored: boolean;
	isLoading: boolean;
	nodeId?: NodeId;
	remoteDocumentId: RemoteDocumentId;
	retryLoadDocument: (this: void) => void;
	setNodeId: Dispatch<SetStateAction<NodeId | null>>;
	stateLabels: {
		loadingPreview: {
			title?: string;
			message?: string;
		};
	};
};

const DocumentWithLinkSelectorPreview: FC<Props> = ({
	documentId,
	error,
	isLoading,
	linkableElementsQuery,
	nodeId,
	remoteDocumentId,
	retryLoadDocument,
	setNodeId,
	stateLabels,
}) => {
	if (error) {
		return (
			<Block flex="1" paddingSize="l" isScrollContainer>
				<FxNodePreviewErrorPlaceholder
					error={error}
					retryLoadDocument={retryLoadDocument}
					remoteDocumentId={remoteDocumentId}
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

	if (!documentId) {
		return null;
	}

	return (
		<FxNodePreviewWithLinkSelector
			documentId={documentId}
			onSelectedNodeChange={setNodeId}
			selector={linkableElementsQuery}
			selectedNodeId={nodeId}
		/>
	);
};

export default DocumentWithLinkSelectorPreview;
