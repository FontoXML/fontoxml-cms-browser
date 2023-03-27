import * as React from 'react';

import {
	Block,
	Flex,
	HorizontalSeparationLine,
	SpinnerIcon,
	StateMessage,
	Text,
} from 'fontoxml-design-system/src/components';
import FxNodePreview from 'fontoxml-fx/src/FxNodePreview';
import FxNodePreviewErrorPlaceholder from 'fontoxml-fx/src/FxNodePreviewErrorPlaceholder';
import useDocumentLoader from 'fontoxml-fx/src/useDocumentLoader';
import type { RemoteDocumentId } from 'fontoxml-remote-documents/src/types';

const maxHeightStyles = { maxHeight: '50%' };

type Props = {
	onLoadIsDone?(...args: unknown[]): unknown;
	onItemIsErrored?(...args: unknown[]): unknown;
	stateLabels: {
		loadingPreview: {
			title?: string;
			message?: string;
		};
	};
	// TODO: the implementation assumes this is required... bug waiting to happen...
	selectedItem?: {
		id: RemoteDocumentId;
		description: string;
	};
};

const DocumentPreview: React.FC<Props> = ({
	onItemIsErrored = (_item) => undefined,
	onLoadIsDone = (_documentId) => undefined,
	stateLabels,
	selectedItem,
}) => {
	const { isErrored, isLoading, documentId, error, retryLoadDocument } =
		useDocumentLoader(selectedItem.id);

	React.useEffect(() => {
		if (isLoading) {
			return;
		}

		if (error) {
			onItemIsErrored(selectedItem.id, error);
		} else {
			onLoadIsDone(documentId);
		}
	}, [
		documentId,
		error,
		isLoading,
		onItemIsErrored,
		onLoadIsDone,
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
		<Flex flex="1" flexDirection="column">
			<Block flex="1" isScrollContainer>
				<FxNodePreview documentId={documentId} />
			</Block>

			{selectedItem.description &&
				selectedItem.description.trim().length !== 0 && (
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
							<Text>{selectedItem.description}</Text>
						</Flex>
					</Flex>
				)}
		</Flex>
	);
};
export default DocumentPreview;
