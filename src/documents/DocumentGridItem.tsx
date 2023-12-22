import type { FC } from 'react';
import { useCallback } from 'react';

import type { BrowseResponseItem } from 'fontoxml-connectors-standard/src/types';
import {
	Flex,
	GridItem,
	Icon,
	Label,
} from 'fontoxml-design-system/src/components';
import type {
	FdsOnClickCallback,
	FdsOnDoubleClickCallback,
	FdsOnItemDoubleClickCallback,
} from 'fontoxml-design-system/src/types';

type Props = {
	isDisabled?: boolean;
	isErrored?: boolean;
	isSelected?: boolean;
	item: BrowseResponseItem;
	onClick?: FdsOnClickCallback;
	onItemDoubleClick?: FdsOnItemDoubleClickCallback;
};

const DEFAULT_ON_CLICK: Props['onClick'] = (_event) => undefined;
const DEFAULT_ON_ITEM_DOUBLE_CLICK: Props['onItemDoubleClick'] = (_item) =>
	undefined;

const DocumentGridItem: FC<Props> = ({
	isDisabled = false,
	isErrored = false,
	isSelected = false,
	item,
	onClick = DEFAULT_ON_CLICK,
	onItemDoubleClick = DEFAULT_ON_ITEM_DOUBLE_CLICK,
}) => {
	const handleDoubleClick = useCallback<FdsOnDoubleClickCallback>(() => {
		onItemDoubleClick(item);
	}, [item, onItemDoubleClick]);

	const wrapInGridItem = useCallback(
		(content: JSX.Element) => (
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

	if (item.type === 'folder') {
		return wrapInGridItem(
			<Flex alignItems="center" flexDirection="column">
				<Icon icon={item.metadata?.icon || 'folder-o'} size="m" />
				<Label>{item.label}</Label>
			</Flex>
		);
	}

	if (isErrored) {
		return wrapInGridItem(
			<Flex alignItems="center" flex="1" flexDirection="column">
				<Icon
					colorName="icon-m-error-color"
					icon={item.metadata?.icon || 'file-text-o'}
					size="m"
				/>
				<Label colorName="text-muted-color">{item.label}</Label>
			</Flex>
		);
	}

	return wrapInGridItem(
		<Flex alignItems="center" flexDirection="column">
			<Icon icon={item.metadata?.icon || 'file-text-o'} size="m" />

			<Label>{item.label}</Label>
		</Flex>
	);
};

export default DocumentGridItem;
