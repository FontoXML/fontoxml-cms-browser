import React, { Component } from 'react';

import {
	ContainedImage,
	Flex,
	Icon,
	Label,
	ListItem,
	SpinnerIcon
} from 'fontoxml-vendor-fds/components';

import withImagePreviewCapabilities from './withImagePreviewCapabilities.jsx';

class ImageListItem extends Component {
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

		if (this.props.isErrored) {
			return this.wrapInListItem(
				<Icon colorName="icon-s-error-color" icon={item.icon || 'file-image-o'} size="s" />,
				<Label colorName="text-muted-color">{item.label}</Label>
			);
		}

		if (item.type === 'folder') {
			return this.wrapInListItem(
				<Icon icon={item.icon || 'folder-o'} size="s" />,
				<Label>{item.label}</Label>
			);
		}

		if (this.props.isLoading) {
			return this.wrapInListItem(<SpinnerIcon size="s" />, <Label>{item.label}</Label>);
		}

		return this.wrapInListItem(
			<Flex applyCss={{ width: '.875rem', height: '.875rem' }}>
				<ContainedImage src={this.props.imageData.dataUrl} />
			</Flex>,
			<Label>{item.label}</Label>
		);
	}
}

ImageListItem = withImagePreviewCapabilities(ImageListItem);

export default ImageListItem;
