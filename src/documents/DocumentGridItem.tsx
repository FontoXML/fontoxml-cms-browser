import { Flex, GridItem, Icon, Label } from 'fds/components';
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
};

class DocumentGridItem extends Component<Props> {
	static defaultProps = {
		isDisabled: false,
		isErrored: false,
		isSelected: false,
		onClick: (_item) => {},
		onDoubleClick: (_item) => {},
	};

	wrapInGridItem = (content) => (
		<GridItem
			isSelected={this.props.isSelected}
			isDisabled={this.props.isDisabled}
			onClick={this.props.onClick}
			onDoubleClick={this.props.onDoubleClick}
		>
			{content}
		</GridItem>
	);

	render() {
		const { item } = this.props;

		if (item.type === 'folder') {
			return this.wrapInGridItem(
				<Flex alignItems="center" flexDirection="column">
					<Icon icon={item.icon || 'folder-o'} size="m" />
					<Label>{item.label}</Label>
				</Flex>
			);
		}

		if (this.props.isErrored) {
			return this.wrapInGridItem(
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

		return this.wrapInGridItem(
			<Flex alignItems="center" flexDirection="column">
				<Icon icon={item.icon || 'file-text-o'} size="m" />

				<Label>{item.label}</Label>
			</Flex>
		);
	}
}

export default DocumentGridItem;
