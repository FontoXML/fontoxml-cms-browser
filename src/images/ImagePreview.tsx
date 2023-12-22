import type { ComponentProps, FC } from 'react';

import type { AssetId } from 'fontoxml-connectors-standard/src/types';
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
import type { RemoteDocumentId } from 'fontoxml-remote-documents/src/types';

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
	heading: string;
	properties?: ComponentProps<typeof KeyValueList>['valueByKey'];
	referrerDocumentId: RemoteDocumentId;
	remoteImageId: AssetId;
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
};

const ImagePreview: FC<Props> = ({
	heading,
	properties,
	referrerDocumentId,
	remoteImageId,
	stateLabels,
}) => {
	const { isErrored, isLoading, imageData } = useImageLoader(
		remoteImageId,
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
				<Heading level="4">{heading}</Heading>

				<Flex flex="auto">
					<img
						{...imageStyles}
						// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
						src={imageData!.dataUrl}
						// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
						width={imageData!.width || 150}
					/>
				</Flex>
			</Flex>

			{properties && (
				<Flex flex="none" flexDirection="column">
					<Flex paddingSize={{ horizontal: 'l' }}>
						<HorizontalSeparationLine />
					</Flex>

					<KeyValueList
						valueByKey={properties}
						scrollLimit={5}
						paddingSize="l"
					/>
				</Flex>
			)}
		</Flex>
	);
};

export default ImagePreview;
