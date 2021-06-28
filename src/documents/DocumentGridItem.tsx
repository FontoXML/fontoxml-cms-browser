import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Flex, GridItem, Icon, Label } from 'fds/components';

class DocumentGridItem extends Component {
	static defaultProps = {
		isDisabled: false,
		isErrored: false,
		isSelected: false,
		onClick: (_item) => {},
		onDoubleClick: (_item) => {},
	};

	static propTypes = {
		isDisabled: PropTypes.bool,
		isErrored: PropTypes.bool,
		isSelected: PropTypes.bool,
		item: PropTypes.shape({
			id: PropTypes.string.isRequired,
			icon: PropTypes.string,
			label: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired,
		}).isRequired,
		onClick: PropTypes.func,
		onDoubleClick: PropTypes.func,
		// TODO: no onRef > FDS GridItem has no onRef (because fds-grid-row has onRef of VirtualList)
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
