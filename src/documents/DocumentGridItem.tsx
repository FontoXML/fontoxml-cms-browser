import * as React from 'react';

import {
	Flex,
	GridItem,
	Icon,
	Label,
} from 'fontoxml-design-system/src/components';
import type {
	FdsOnClickCallback,
	FdsOnDoubleClickCallback,
	FdsOnRefCallback,
} from 'fontoxml-design-system/src/types';

type Props = {
	isDisabled?: boolean;
	isErrored?: boolean;
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
};

const DEFAULT_ON_CLICK: Props['onClick'] = (_event) => undefined;
const DEFAULT_ON_DOUBLE_CLICK: Props['onDoubleClick'] = (_event) => undefined;
const DEFAULT_ON_REF: Props['onRef'] = (_domNode) => undefined;

const DocumentGridItem: React.FC<Props> = ({
	isDisabled = false,
	isErrored = false,
	isSelected = false,
	item,
	onClick = DEFAULT_ON_CLICK,
	onDoubleClick = DEFAULT_ON_DOUBLE_CLICK,
	onRef = DEFAULT_ON_REF,
}) => {
	const wrapInGridItem = React.useCallback(
		(content) => (
			<GridItem
				isSelected={isSelected}
				isDisabled={isDisabled}
				onClick={onClick}
				onDoubleClick={onDoubleClick}
				onRef={onRef}
			>
				{content}
			</GridItem>
		),
		[isDisabled, isSelected, onClick, onDoubleClick, onRef]
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
					icon={item.icon || 'file-text-o'}
					size="m"
				/>
				<Label colorName="text-muted-color">{item.label}</Label>
			</Flex>
		);
	}

	return wrapInGridItem(
		<Flex alignItems="center" flexDirection="column">
			<Icon icon={item.icon || 'file-text-o'} size="m" />

			<Label>{item.label}</Label>
		</Flex>
	);
};

export default DocumentGridItem;
