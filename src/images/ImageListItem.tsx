import type { FC } from 'react';
import { useCallback } from 'react';

import {
	Block,
	Icon,
	Label,
	ListItem,
	SpinnerIcon,
} from 'fontoxml-design-system/src/components';
import type {
	FdsOnClickCallback,
	FdsOnDoubleClickCallback,
	FdsOnRefCallback,
} from 'fontoxml-design-system/src/types';
import useImageLoader from 'fontoxml-fx/src/useImageLoader';

import BlockImage from './BlockImage';

type Props = {
	isDisabled?: boolean;
	isSelected?: boolean;
	item: {
		id: string;
		icon?: string;
		label: string;
		type: string;
	};
	onClick?: FdsOnClickCallback;
	onDoubleClick?: FdsOnDoubleClickCallback;
	onRef?: FdsOnRefCallback;
	referrerDocumentId: string;
};

const DEFAULT_ON_CLICK: Props['onClick'] = (_event) => undefined;
const DEFAULT_ON_DOUBLE_CLICK: Props['onDoubleClick'] = (_event) => undefined;
const DEFAULT_ON_REF: Props['onRef'] = (_domNode) => undefined;

const LoadableImageListItem: FC<Props> = ({
	isDisabled = false,
	isSelected = false,
	item,
	onClick = DEFAULT_ON_CLICK,
	onDoubleClick = DEFAULT_ON_DOUBLE_CLICK,
	onRef = DEFAULT_ON_REF,
	referrerDocumentId,
}) => {
	const wrapInListItem = useCallback(
		(content, label) => {
			return (
				<ListItem
					isSelected={isSelected}
					isDisabled={isDisabled}
					onClick={onClick}
					onDoubleClick={onDoubleClick}
					onRef={onRef}
				>
					{content}
					{label}
				</ListItem>
			);
		},
		[isDisabled, isSelected, onClick, onDoubleClick, onRef]
	);

	const { isErrored, isLoading, imageData } = useImageLoader(
		item.id,
		referrerDocumentId,
		'thumbnail'
	);

	if (isErrored) {
		return wrapInListItem(
			<Icon
				colorName="icon-s-error-color"
				icon={item.icon || 'file-image-o'}
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
			<BlockImage
				src={imageData.dataUrl}
				width={imageData.width || 150}
				height={imageData.height}
			/>
		</Block>,
		<Label>{item.label}</Label>
	);
};

const ImageListItem: FC<Props> = ({
	isDisabled = false,
	isSelected = false,
	item,
	onClick = DEFAULT_ON_CLICK,
	onDoubleClick = DEFAULT_ON_DOUBLE_CLICK,
	onRef = DEFAULT_ON_REF,
	referrerDocumentId,
}) => {
	if (item.type === 'folder') {
		return (
			<ListItem
				isSelected={isSelected}
				isDisabled={isDisabled}
				onClick={onClick}
				onDoubleClick={onDoubleClick}
				onRef={onRef}
			>
				<Icon icon={item.icon || 'folder-o'} size="s" />

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
			onDoubleClick={onDoubleClick}
			onRef={onRef}
			referrerDocumentId={referrerDocumentId}
		/>
	);
};

export default ImageListItem;
