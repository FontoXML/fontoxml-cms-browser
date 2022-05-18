import { Block, Icon, Label, ListItem, SpinnerIcon } from 'fds/components';
import type { FC } from 'react';
import React, { useCallback } from 'react';

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
	onClick?(...args: unknown[]): unknown;
	onDoubleClick?(...args: unknown[]): unknown;
	onRef?(...args: unknown[]): unknown;
	referrerDocumentId: string;
};

const ImageListItem: FC<Props> = ({
	isDisabled,
	isSelected,
	item,
	onClick,
	onDoubleClick,
	onRef,
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
		referrerDocumentId,
		item.id,
		'thumbnail'
	);

	if (item.type === 'folder') {
		return wrapInListItem(
			<Icon icon={item.icon || 'folder-o'} size="s" />,
			<Label>{item.label}</Label>
		);
	}

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

ImageListItem.defaultProps = {
	isDisabled: false,
	isSelected: false,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onClick: (_item) => {},
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onDoubleClick: (_item) => {},
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onRef: (_domNode) => {},
};

export default ImageListItem;
