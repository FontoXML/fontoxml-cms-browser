import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Flex, GridItem, Icon, Label } from 'fds/components';

class DocumentGridItem extends Component {
	static defaultProps = {
		isDisabled: false,
		isSelected: false,
		onClick: _item => {},
		onDoubleClick: _item => {}
	};

	static propTypes = {
		isDisabled: PropTypes.bool,
		isSelected: PropTypes.bool,
		item: PropTypes.shape({
			id: PropTypes.string.isRequired,
			icon: PropTypes.string,
			label: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired
		}).isRequired,
		onClick: PropTypes.func,
		onDoubleClick: PropTypes.func,

		// from withModularBrowserCapabilities
		isItemErrored: PropTypes.func.isRequired
	};

	render() {
		const { isDisabled, isItemErrored, isSelected, item, onClick, onDoubleClick } = this.props;

		if (isItemErrored(item)) {
			return (
				<GridItem
					isSelected={isSelected}
					isDisabled={isDisabled}
					onClick={onClick}
					onDoubleClick={onDoubleClick}
				>
					<Flex alignItems="center" flexDirection="column">
						<Icon
							colorName="icon-m-error-color"
							icon={item.icon || 'file-text-o'}
							size="m"
						/>

						<Label colorName="text-muted-color">{item.label}</Label>
					</Flex>
				</GridItem>
			);
		}

		return (
			<GridItem
				isSelected={isSelected}
				isDisabled={isDisabled}
				onClick={onClick}
				onDoubleClick={onDoubleClick}
			>
				<Flex alignItems="center" flexDirection="column">
					<Icon
						icon={item.icon || (item.type === 'folder' ? 'folder-o' : 'file-text-o')}
						size="m"
					/>

					<Label>{item.label}</Label>
				</Flex>
			</GridItem>
		);
	}
}

export default DocumentGridItem;
