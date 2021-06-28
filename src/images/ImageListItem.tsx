import { Block, Icon, Label, ListItem, SpinnerIcon } from 'fds/components';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import FxImageLoader from 'fontoxml-fx/src/FxImageLoader';

import BlockImage from './BlockImage';

class ImageListItem extends Component {
	static defaultProps = {
		isDisabled: false,
		isSelected: false,
		onClick: (_item) => {},
		onDoubleClick: (_item) => {},
		onRef: (_domNode) => {},
	};

	static propTypes = {
		isDisabled: PropTypes.bool,
		isSelected: PropTypes.bool,
		item: PropTypes.shape({
			id: PropTypes.string.isRequired,
			icon: PropTypes.string,
			label: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired,
		}).isRequired,
		onClick: PropTypes.func,
		onDoubleClick: PropTypes.func,
		onRef: PropTypes.func,
		referrerDocumentId: PropTypes.string.isRequired,
	};

	wrapInListItem = (content, label) => {
		return (
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
	};

	render() {
		const { item } = this.props;

		if (item.type === 'folder') {
			return this.wrapInListItem(
				<Icon icon={item.icon || 'folder-o'} size="s" />,
				<Label>{item.label}</Label>
			);
		}

		return (
			<FxImageLoader
				remoteId={item.id}
				referrerDocumentId={this.props.referrerDocumentId}
				type="thumbnail"
			>
				{({ isErrored, isLoading, imageData }) => {
					if (isErrored) {
						return this.wrapInListItem(
							<Icon
								colorName="icon-s-error-color"
								icon={item.icon || 'file-image-o'}
								size="s"
							/>,
							<Label colorName="text-muted-color">
								{item.label}
							</Label>
						);
					}

					if (isLoading) {
						return this.wrapInListItem(
							<SpinnerIcon size="s" />,
							<Label>{item.label}</Label>
						);
					}

					return this.wrapInListItem(
						<Block
							applyCss={{ width: '.875rem', height: '.875rem' }}
						>
							<BlockImage
								src={imageData.dataUrl}
								width={imageData.width || 150}
							/>
						</Block>,
						<Label>{item.label}</Label>
					);
				}}
			</FxImageLoader>
		);
	}
}

export default ImageListItem;
