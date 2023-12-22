import type { FC } from 'react';
import { useCallback } from 'react';

import type { BrowseResponseItem } from 'fontoxml-connectors-standard/src/types';
import {
	Block,
	ContainedImage,
	Icon,
	Label,
	ListItem,
	SpinnerIcon,
} from 'fontoxml-design-system/src/components';
import type {
	FdsOnClickCallback,
	FdsOnDoubleClickCallback,
	FdsOnItemDoubleClickCallback,
	FdsOnRefCallback,
} from 'fontoxml-design-system/src/types';
import useImageLoader from 'fontoxml-fx/src/useImageLoader';
import type { RemoteDocumentId } from 'fontoxml-remote-documents/src/types';

type Props = {
	isDisabled?: boolean;
	isSelected?: boolean;
	item: BrowseResponseItem;
	onClick?: FdsOnClickCallback;
	onItemDoubleClick?: FdsOnItemDoubleClickCallback;
	onRef?: FdsOnRefCallback;
	referrerDocumentId: RemoteDocumentId;
};

const DEFAULT_ON_CLICK: Props['onClick'] = (_event) => undefined;
const DEFAULT_ON_ITEM_DOUBLE_CLICK: Props['onItemDoubleClick'] = (_item) =>
	undefined;

const LoadableImageListItem: FC<Props> = ({
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

	const wrapInListItem = useCallback(
		(content, label) => {
			return (
				<ListItem
					isSelected={isSelected}
					isDisabled={isDisabled}
					onClick={onClick}
					onDoubleClick={handleDoubleClick}
				>
					{content}
					{label}
				</ListItem>
			);
		},
		[handleDoubleClick, isDisabled, isSelected, onClick]
	);

	const { isErrored, isLoading, imageData } = useImageLoader(
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
		item.id!,
		referrerDocumentId,
		'thumbnail'
	);

	if (isErrored) {
		return wrapInListItem(
			<Icon
				colorName="icon-s-error-color"
				icon={item.metadata?.icon || 'file-image-o'}
				size="s"
			/>,
			<Label colorName="text-muted-color">{item.label}</Label>
		);
	}

	if (isLoading) {
		return wrapInListItem(
			<SpinnerIcon size="s" />,
			<Label>{item.label}</Label>
		);
	}

	return wrapInListItem(
		<Block applyCss={{ width: '.875rem', height: '.875rem' }}>
			{/* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion */}
			<ContainedImage src={imageData!.dataUrl} />
		</Block>,
		<Label>{item.label}</Label>
	);
};

const ImageListItem: FC<Props> = ({
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
			<ListItem
				isSelected={isSelected}
				isDisabled={isDisabled}
				onClick={onClick}
				onDoubleClick={handleDoubleClick}
			>
				<Icon icon={item.metadata?.icon || 'folder-o'} size="s" />

				<Label>{item.label}</Label>
			</ListItem>
		);
	}

	return (
		<LoadableImageListItem
			isDisabled={isDisabled}
			isSelected={isSelected}
			item={item}
			onClick={onClick}
			onItemDoubleClick={onItemDoubleClick}
			referrerDocumentId={referrerDocumentId}
		/>
	);
};

export default ImageListItem;
