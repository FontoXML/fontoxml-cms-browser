import type { FC } from 'react';

import {
	Block,
	Flex,
	HorizontalSeparationLine,
	SpinnerIcon,
	StateMessage,
	Text,
} from 'fontoxml-design-system/src/components';
import type { DocumentId } from 'fontoxml-documents/src/types';
import FxNodePreview from 'fontoxml-fx/src/FxNodePreview';
import FxNodePreviewErrorPlaceholder from 'fontoxml-fx/src/FxNodePreviewErrorPlaceholder';
import type { RemoteDocumentId } from 'fontoxml-remote-documents/src/types';

const maxHeightStyles = { maxHeight: '50%' };

type Props = {
	description?: string;
	documentId: DocumentId | null;
	error: Error | null;
	isErrored: boolean;
	isLoading: boolean;
	remoteDocumentId: RemoteDocumentId;
	retryLoadDocument: (this: void) => void;
	stateLabels: {
		loadingPreview: {
			title?: string;
		};
	};
};

const DocumentPreview: FC<Props> = ({
	description,
	documentId,
	error,
	isErrored,
	isLoading,
	remoteDocumentId,
	retryLoadDocument,
	stateLabels,
}) => {
	if (isErrored && error) {
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
		<Flex flex="1" flexDirection="column">
			<Block flex="1" isScrollContainer>
				<FxNodePreview documentId={documentId} />
			</Block>

			{description && description.trim().length !== 0 && (
				<Flex
					applyCss={maxHeightStyles}
					flex="none"
					flexDirection="column"
				>
					<Flex paddingSize={{ horizontal: 'l' }}>
						<HorizontalSeparationLine />
					</Flex>

					<Flex
						flex="1"
						flexDirection="column"
						isScrollContainer
						paddingSize="l"
					>
						<Text>{description}</Text>
					</Flex>
				</Flex>
			)}
		</Flex>
	);
};
export default DocumentPreview;
