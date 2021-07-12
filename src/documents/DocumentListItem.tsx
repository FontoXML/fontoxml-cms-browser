import { Icon, Label, ListItem } from 'fds/components';
import React, { Component } from 'react';

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
	onClick?(...args: unknown[]): unknown;
	onDoubleClick?(...args: unknown[]): unknown;
	onRef?(...args: unknown[]): unknown;
};

class DocumentListItem extends Component<Props> {
	static defaultProps = {
		isDisabled: false,
		isErrored: false,
		isSelected: false,
		onClick: (_item) => {},
		onDoubleClick: (_item) => {},
		onRef: (_domNode) => {},
	};

	wrapInListItem = (content, label) => (
		<ListItem
			isSelected={this.props.isSelected}
			isDisabled={this.props.isDisabled}
			onClick={this.props.onClick}
			onDoubleClick={this.props.onDoubleClick}
			onRef={this.props.onRef}
		>
			{content}
			{label}
		</ListItem>
	);

	render() {
		const { item } = this.props;

		if (item.type === 'folder') {
			return this.wrapInListItem(
				<Icon icon={item.icon || 'folder-o'} size="s" />,
				<Label>{item.label}</Label>
			);
		}

		if (this.props.isErrored) {
			return this.wrapInListItem(
				<Icon
					colorName="icon-s-error-color"
					icon={item.icon || 'file-text-o'}
					size="s"
				/>,
				<Label colorName="text-muted-color">{item.label}</Label>
			);
		}

		return this.wrapInListItem(
			<Icon icon={item.icon || 'file-text-o'} size="s" />,
			<Label>{item.label}</Label>
		);
	}
}

export default DocumentListItem;
