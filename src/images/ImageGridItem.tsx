import type { FC } from 'react';
import React, { useCallback } from 'react';

import {
	Flex,
	GridItem,
	Icon,
	Label,
	SpinnerIcon,
} from 'fontoxml-design-system/src/components';
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
	referrerDocumentId: string;
};

const ImageGridItem: FC<Props> = ({
	isDisabled,
	isSelected,
	item,
	onClick,
	onDoubleClick,
	referrerDocumentId,
}) => {
	const wrapInGridItem = useCallback(
		(content) => (
			<GridItem
				isSelected={isSelected}
				isDisabled={isDisabled}
				onClick={onClick}
				onDoubleClick={onDoubleClick}
			>
				{content}
			</GridItem>
		),
		[isDisabled, isSelected, onClick, onDoubleClick]
	);

	const { isErrored, isLoading, imageData } = useImageLoader(
		item.id,
		referrerDocumentId,
		'thumbnail'
	);

	if (item.type === 'folder') {
		return wrapInGridItem(
			<Flex alignItems="center" flexDirection="column">
				<Icon icon={item.icon || 'folder-o'} size="m" />
				<Label>{item.label}</Label>
			</Flex>
		);
	}

	if (isErrored) {
		return wrapInGridItem(
			<Flex alignItems="center" flex="1" flexDirection="column">
				<Icon
					colorName="icon-m-error-color"
					icon={item.icon || 'file-image-o'}
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
				<BlockImage
					src={imageData.dataUrl}
					width={imageData.width || 150}
					height={imageData.height}
				/>
			</Flex>
			<Label>{item.label}</Label>
		</Flex>
	);
};

ImageGridItem.defaultProps = {
	isDisabled: false,
	isSelected: false,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onClick: (_item) => {},
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onDoubleClick: (_item) => {},
};

export default ImageGridItem;
