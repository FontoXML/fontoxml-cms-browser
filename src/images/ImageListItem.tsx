import { Block, Icon, Label, ListItem, SpinnerIcon } from 'fds/components';
import React, { Component } from 'react';

import FxImageLoader from 'fontoxml-fx/src/FxImageLoader';

import BlockImage from './BlockImage';

type Props = {
	isDisabled?: boolean;
	isSelected?: boolean;
	item: {
		id: string;
		icon?: string;
		label: string;
		type: string;
	};
	onClick?(...args: unknown[]): unknown;
	onDoubleClick?(...args: unknown[]): unknown;
	onRef?(...args: unknown[]): unknown;
	referrerDocumentId: string;
};

class ImageListItem extends Component<Props> {
	static defaultProps = {
		isDisabled: false,
		isSelected: false,
		onClick: (_item) => {},
		onDoubleClick: (_item) => {},
		onRef: (_domNode) => {},
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
