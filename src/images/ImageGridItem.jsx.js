import PropTypes from 'prop-types';
import React, { Component } from 'react';

import {
	Block,
	ContainedImage,
	Flex,
	GridItem,
	Icon,
	Label,
	SpinnerIcon
} from 'fontoxml-vendor-fds/components';

import withImagePreviewCapabilities from './withImagePreviewCapabilities.jsx';

class ImageGridItem extends Component {
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

		// from withModularBrowserCapabilities for withImagePreviewCapabilities
		loadItem: PropTypes.func.isRequired
	};

	wrapInGridItem = content => {
		return (
			<GridItem
				isSelected={this.props.isSelected}
				isDisabled={this.props.isDisabled}
				onClick={this.props.onClick}
				onDoubleClick={this.props.onDoubleClick}
			>
				{content}
			</GridItem>
		);
	};

	render() {
		const { item } = this.props;

		if (this.props.isErrored) {
			return this.wrapInGridItem(
				<Flex alignItems="center" flex="1" flexDirection="column">
					<Icon
						colorName="icon-m-error-color"
						icon={item.icon || 'file-image-o'}
						size="m"
					/>
					<Label colorName="text-muted-color">{item.label}</Label>
				</Flex>
			);
		}

		if (item.type === 'folder') {
			return this.wrapInGridItem(
				<Flex alignItems="center" flexDirection="column">
					<Icon icon={item.icon || 'folder-o'} size="m" />
					<Label>{item.label}</Label>
				</Flex>
			);
		}

		if (this.props.isLoading) {
			return this.wrapInGridItem(
				<Flex alignItems="center" flex="1" flexDirection="column">
					<SpinnerIcon size="m" />
					<Label>{item.label}</Label>
				</Flex>
			);
		}

		return this.wrapInGridItem(
			<Flex alignItems="center" flex="1" flexDirection="column">
				<Block applyCss={{ height: '3rem' }}>
					<ContainedImage src={this.props.imageData.dataUrl} />
				</Block>
				<Label>{item.label}</Label>
			</Flex>
		);
	}
}

ImageGridItem = withImagePreviewCapabilities(ImageGridItem);

export default ImageGridItem;
