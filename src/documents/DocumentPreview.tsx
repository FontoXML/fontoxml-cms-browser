import type { FC } from 'react';
import React from 'react';

import {
	Block,
	Flex,
	HorizontalSeparationLine,
	SpinnerIcon,
	StateMessage,
	Text,
} from 'fontoxml-design-system/src/components';
import FxErroredTemplatedView from 'fontoxml-fx/src/FxErroredTemplatedView';
import FxNodePreview from 'fontoxml-fx/src/FxNodePreview';
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
	selectedItem?: {
		id: RemoteDocumentId;
		description: string;
	};
};

const DocumentPreview: FC<Props> = ({
	onItemIsErrored,
	onLoadIsDone,
	stateLabels,
	selectedItem,
}) => {
	const { isErrored, isLoading, documentId, error, retryLoadDocument } =
		useDocumentLoader(selectedItem.id, onLoadIsDone, onItemIsErrored);

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

DocumentPreview.defaultProps = {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onLoadIsDone: (_documentId) => {},
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onItemIsErrored: (_item) => {},
	selectedItem: null,
};

export default DocumentPreview;
