import type { FC } from 'react';
import { useCallback } from 'react';

import { Icon, Label, ListItem } from 'fontoxml-design-system/src/components';
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

const DocumentListItem: FC<Props> = ({
	isDisabled = false,
	isErrored = false,
	isSelected = false,
	item,
	onClick = DEFAULT_ON_CLICK,
	onDoubleClick = DEFAULT_ON_DOUBLE_CLICK,
	onRef = DEFAULT_ON_REF,
}) => {
	const wrapInListItem = useCallback(
		(content, label) => (
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
		),
		[isDisabled, isSelected, onClick, onDoubleClick, onRef]
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
				icon={item.icon || 'file-text-o'}
				size="s"
			/>,
			<Label colorName="text-muted-color">{item.label}</Label>
		);
	}

	return wrapInListItem(
		<Icon icon={item.icon || 'file-text-o'} size="s" />,
		<Label>{item.label}</Label>
	);
};

export default DocumentListItem;
