import type { FC } from 'react';
import { useCallback } from 'react';

import type { BrowseResponseItem } from 'fontoxml-connectors-standard/src/types';
import { Icon, Label, ListItem } from 'fontoxml-design-system/src/components';
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

const DocumentListItem: FC<Props> = ({
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

	const wrapInListItem = useCallback(
		(content: JSX.Element, label: JSX.Element) => (
			<ListItem
				isSelected={isSelected}
				isDisabled={isDisabled}
				onClick={onClick}
				onDoubleClick={handleDoubleClick}
			>
				{content}
				{label}
			</ListItem>
		),
		[handleDoubleClick, isDisabled, isSelected, onClick]
	);

	if (item.type === 'folder') {
		return wrapInListItem(
			<Icon icon={item.metadata?.icon || 'folder-o'} size="s" />,
			<Label>{item.label}</Label>
		);
	}

	if (isErrored) {
		return wrapInListItem(
			<Icon
				colorName="icon-s-error-color"
				icon={item.metadata?.icon || 'file-text-o'}
				size="s"
			/>,
			<Label colorName="text-muted-color">{item.label}</Label>
		);
	}

	return wrapInListItem(
		<Icon icon={item.metadata?.icon || 'file-text-o'} size="s" />,
		<Label>{item.label}</Label>
	);
};

export default DocumentListItem;
