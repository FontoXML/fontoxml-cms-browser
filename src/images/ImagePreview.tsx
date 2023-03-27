import * as React from 'react';

import {
	Flex,
	Heading,
	HorizontalSeparationLine,
	KeyValueList,
	SpinnerIcon,
	StateMessage,
} from 'fontoxml-design-system/src/components';
import { applyCss, block } from 'fontoxml-design-system/src/system';
import useImageLoader from 'fontoxml-fx/src/useImageLoader';

const imageStyles = applyCss([
	block,
	{
		position: 'absolute',
		maxWidth: '100%',
		maxHeight: '100%',
		width: 'auto',
		height: 'auto',
		top: '50%',
		left: '50%',
		transform: 'translateX(-50%) translateY(-50%)',
	},
]);

type Props = {
	stateLabels: {
		previewError: {
			title?: string;
			message?: string;
		};
		loadingPreview: {
			title?: string;
			message?: string;
		};
	};
	// TODO: required by implementation, optional according to type ... bug waiting to happen ...
	selectedItem?: {
		id: string;
		label: string;
		metadata: {
			properties: { [key: string]: React.ReactNode };
		};
	};
	referrerDocumentId: string;
};

const ImagePreview: React.FC<Props> = ({
	stateLabels,
	selectedItem,
	referrerDocumentId,
}) => {
	const { isErrored, isLoading, imageData } = useImageLoader(
		selectedItem.id,
		referrerDocumentId,
		'web'
	);

	if (isErrored) {
		return (
			<StateMessage
				connotation="warning"
				paddingSize="m"
				visual="exclamation-triangle"
				{...stateLabels.previewError}
			/>
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
		<Flex flex="auto" flexDirection="column">
			<Flex
				flex="auto"
				flexDirection="column"
				paddingSize="l"
				spaceSize="m"
			>
				<Heading level="4">{selectedItem.label}</Heading>

				<Flex flex="auto">
					<img
						src={imageData.dataUrl}
						{...imageStyles}
						width={imageData.width || 150}
					/>
				</Flex>
			</Flex>

			{selectedItem.metadata && selectedItem.metadata.properties && (
				<Flex flex="none" flexDirection="column">
					<Flex paddingSize={{ horizontal: 'l' }}>
						<HorizontalSeparationLine />
					</Flex>

					<KeyValueList
						valueByKey={selectedItem.metadata.properties}
						scrollLimit={5}
						paddingSize="l"
					/>
				</Flex>
			)}
		</Flex>
	);
};

export default ImagePreview;
