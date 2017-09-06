import React, { Component } from 'react';

import { Icon, Label, ListItem } from 'fontoxml-vendor-fds/components';

class DocumentListItem extends Component {
	render() {
		const { item, isSelected, isDisabled, onClick, onDoubleClick, onRef } = this.props;

		if (this.props.isItemErrored(item)) {
			return (
				<ListItem
					isSelected={isSelected}
					isDisabled={isDisabled}
					onClick={onClick}
					onDoubleClick={onDoubleClick}
					onRef={onRef}
				>
					<Icon
						colorName="icon-s-error-color"
						icon={item.icon || 'file-text-o'}
						size="s"
					/>
					<Label colorName="text-muted-color">{item.label}</Label>
				</ListItem>
			);
		}

		return (
			<ListItem
				isSelected={isSelected}
				isDisabled={isDisabled}
				onClick={onClick}
				onDoubleClick={onDoubleClick}
				onRef={onRef}
			>
				<Icon
					icon={item.icon || (item.type === 'folder' ? 'folder-o' : 'file-text-o')}
					size="s"
				/>
				<Label>{item.label}</Label>
			</ListItem>
		);
	}
}

export default DocumentListItem;
