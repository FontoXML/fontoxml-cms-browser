import type { FC } from 'react';
import { useCallback } from 'react';

import type { BrowseResponseItem } from 'fontoxml-connectors-standard/src/types';
import {
	ContainedImage,
	Flex,
	GridItem,
	Icon,
	Label,
	SpinnerIcon,
} from 'fontoxml-design-system/src/components';
import type {
	FdsOnClickCallback,
	FdsOnDoubleClickCallback,
	FdsOnItemDoubleClickCallback,
} from 'fontoxml-design-system/src/types';
import useImageLoader from 'fontoxml-fx/src/useImageLoader';
import type { RemoteDocumentId } from 'fontoxml-remote-documents/src/types';

type Props = {
	isDisabled?: boolean;
	isSelected?: boolean;
	item: BrowseResponseItem;
	onClick?: FdsOnClickCallback;
	onItemDoubleClick?: FdsOnItemDoubleClickCallback;
	referrerDocumentId: RemoteDocumentId;
};

const DEFAULT_ON_CLICK: Props['onClick'] = (_event) => undefined;
const DEFAULT_ON_ITEM_DOUBLE_CLICK: Props['onItemDoubleClick'] = (_item) =>
	undefined;

const LoadableImageGridItem: FC<Props> = ({
	isDisabled = false,
	isSelected = false,
	item,
	onClick = DEFAULT_ON_CLICK,
	onItemDoubleClick = DEFAULT_ON_ITEM_DOUBLE_CLICK,
	referrerDocumentId,
}) => {
	const handleDoubleClick = useCallback<FdsOnDoubleClickCallback>(() => {
		onItemDoubleClick(item);
	}, [item, onItemDoubleClick]);

	const wrapInGridItem = useCallback(
		(content) => (
			<GridItem
				isSelected={isSelected}
				isDisabled={isDisabled}
				onClick={onClick}
				onDoubleClick={handleDoubleClick}
			>
				{content}
			</GridItem>
		),
		[handleDoubleClick, isDisabled, isSelected, onClick]
	);

	const { isErrored, isLoading, imageData } = useImageLoader(
		item.id,
		referrerDocumentId,
		'thumbnail'
	);

	if (isErrored) {
		return wrapInGridItem(
			<Flex alignItems="center" flex="1" flexDirection="column">
				<Icon
					colorName="icon-m-error-color"
					icon={item.metadata?.icon || 'file-image-o'}
					size="m"
				/>

				<Label colorName="text-muted-color">{item.label}</Label>
			</Flex>
		);
	}

	if (isLoading) {
		return wrapInGridItem(
			<Flex alignItems="center" flex="1" flexDirection="column">
				<SpinnerIcon size="m" />

				<Label>{item.label}</Label>
			</Flex>
		);
	}

	return wrapInGridItem(
		<Flex alignItems="center" flex="1" flexDirection="column">
			<Flex
				alignItems="center"
				flex="none"
				flexDirection="row"
				applyCss={{ height: '3rem' }}
			>
				{/* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion */}
				<ContainedImage src={imageData!.dataUrl} />
			</Flex>

			<Label>{item.label}</Label>
		</Flex>
	);
};

const ImageGridItem: FC<Props> = ({
	isDisabled = false,
	isSelected = false,
	item,
	onClick = DEFAULT_ON_CLICK,
	onItemDoubleClick = DEFAULT_ON_ITEM_DOUBLE_CLICK,
	referrerDocumentId,
}) => {
	const handleDoubleClick = useCallback<FdsOnDoubleClickCallback>(() => {
		onItemDoubleClick(item);
	}, [item, onItemDoubleClick]);

	if (item.type === 'folder') {
		return (
			<GridItem
				isSelected={isSelected}
				isDisabled={isDisabled}
				onClick={onClick}
				onDoubleClick={handleDoubleClick}
			>
				<Flex alignItems="center" flexDirection="column">
					<Icon icon={item.metadata?.icon || 'folder-o'} size="m" />

					<Label>{item.label}</Label>
				</Flex>
			</GridItem>
		);
	}

	return (
		<LoadableImageGridItem
			isDisabled={isDisabled}
			isSelected={isSelected}
			item={item}
			onClick={onClick}
			onItemDoubleClick={onItemDoubleClick}
			referrerDocumentId={referrerDocumentId}
		/>
	);
};

export default ImageGridItem;
