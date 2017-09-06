import React, { Component } from 'react';

import { Flex, GridItem, Icon, Label } from 'fontoxml-vendor-fds/components';

class DocumentListItem extends Component {
	render() {
		const { item, isSelected, isDisabled, onClick, onDoubleClick } = this.props;

		if (this.props.cachedErrorsByRemoteId[item.id]) {
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

export default DocumentListItem;
