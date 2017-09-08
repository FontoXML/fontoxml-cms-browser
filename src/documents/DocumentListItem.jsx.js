import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Icon, Label, ListItem } from 'fontoxml-vendor-fds/components';

class DocumentListItem extends Component {
	static defaultProps = {
		isDisabled: false,
		isSelected: false,
		onClick: _item => {},
		onDoubleClick: _item => {},
		onRef: _domNode => {}
	};

	static propTypes = {
		isDisabled: PropTypes.bool,
		isItemErrored: PropTypes.func.isRequired,
		isSelected: PropTypes.bool,
		item: PropTypes.shape({
			id: PropTypes.string.isRequired,
			icon: PropTypes.string,
			label: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired
		}).isRequired,
		onClick: PropTypes.func,
		onDoubleClick: PropTypes.func,
		onRef: PropTypes.func
	};

	render() {
		const {
			isDisabled,
			isItemErrored,
			isSelected,
			item,
			onClick,
			onDoubleClick,
			onRef
		} = this.props;

		if (isItemErrored(item)) {
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
