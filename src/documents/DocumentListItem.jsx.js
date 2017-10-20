import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Icon, Label, ListItem, SpinnerIcon } from 'fds/components';

import DocumentLoader from './DocumentLoader.jsx';

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
		isSelected: PropTypes.bool,
		item: PropTypes.shape({
			id: PropTypes.string.isRequired,
			icon: PropTypes.string,
			label: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired
		}).isRequired,
		onClick: PropTypes.func,
		onDoubleClick: PropTypes.func,
		// @see TODO in DocumentGridItem.jsx
		onRef: PropTypes.func
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

		return (
			<DocumentLoader remoteId={item.id}>
				{({ isErrored, isLoading }) => {
					if (isErrored) {
						return this.wrapInListItem(
							<Icon
								colorName="icon-s-error-color"
								icon={item.icon || 'file-text-o'}
								size="s"
							/>,
							<Label colorName="text-muted-color">{item.label}</Label>
						);
					}

					if (isLoading) {
						return this.wrapInListItem(
							<SpinnerIcon size="s" />,
							<Label>{item.label}</Label>
						);
					}

					return this.wrapInListItem(
						<Icon icon={item.icon || 'file-text-o'} size="s" />,
						<Label>{item.label}</Label>
					);
				}}
			</DocumentLoader>
		);
	}
}

export default DocumentListItem;
