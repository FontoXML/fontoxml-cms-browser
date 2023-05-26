import type { FC } from 'react';
import { useEffect, useRef } from 'react';

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

const DEFAULT_ON_ITEM_IS_ERRORED: Props['onItemIsErrored'] = (_item) =>
	undefined;
const DEFAULT_ON_LOAD_IS_DONE: Props['onLoadIsDone'] = (_documentId) =>
	undefined;

const DocumentPreview: FC<Props> = ({
	onItemIsErrored = DEFAULT_ON_ITEM_IS_ERRORED,
	onLoadIsDone = DEFAULT_ON_LOAD_IS_DONE,
	stateLabels,
	selectedItem,
}) => {
	const { isErrored, isLoading, documentId, error, retryLoadDocument } =
		useDocumentLoader(selectedItem.id);

	// To ensure the onItemIsErrored and onLoadIsDone callbacks are only called,
	// when isLoading is false and we either have an error or we don't
	// but not when the callback itself changes for some reason
	// (eg. when its dependencies change, which could include the id of a new
	// selected document even before it is loaded),
	// we use this "ugly" trickery with useRef and a separate useEffect so those
	// effects only invalidate when we want to.
	// Without this, onLoadIsDone would get called directly after we've loaded
	// at least 1 document successfully, and then select a different document.
	const onItemIsErroredRef = useRef(onItemIsErrored);
	onItemIsErroredRef.current = onItemIsErrored;

	const onLoadIsDoneRef = useRef(onLoadIsDone);
	onLoadIsDoneRef.current = onLoadIsDone;

	useEffect(() => {
		if (!isLoading && error && onItemIsErroredRef.current) {
			onItemIsErroredRef.current(selectedItem.id, error);
		}
	}, [error, isLoading, selectedItem.id]);

	useEffect(() => {
		if (!isLoading && !error && onLoadIsDoneRef.current) {
			onLoadIsDoneRef.current(documentId);
		}
	}, [documentId, error, isLoading]);

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
