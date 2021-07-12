import { Flex, GridItem, Icon, Label, SpinnerIcon } from 'fds/components';
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
	referrerDocumentId: string;
};

class ImageGridItem extends Component<Props> {
	static defaultProps = {
		isDisabled: false,
		isSelected: false,
		onClick: (_item) => {},
		onDoubleClick: (_item) => {},
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

		return (
			<FxImageLoader
				remoteId={item.id}
				referrerDocumentId={this.props.referrerDocumentId}
				type="thumbnail"
			>
				{({ isErrored, isLoading, imageData }) => {
					if (isErrored) {
						return this.wrapInGridItem(
							<Flex
								alignItems="center"
								flex="1"
								flexDirection="column"
							>
								<Icon
									colorName="icon-m-error-color"
									icon={item.icon || 'file-image-o'}
									size="m"
								/>
								<Label colorName="text-muted-color">
									{item.label}
								</Label>
							</Flex>
						);
					}

					if (isLoading) {
						return this.wrapInGridItem(
							<Flex
								alignItems="center"
								flex="1"
								flexDirection="column"
							>
								<SpinnerIcon size="m" />
								<Label>{item.label}</Label>
							</Flex>
						);
					}

					return this.wrapInGridItem(
						<Flex
							alignItems="center"
							flex="1"
							flexDirection="column"
						>
							<Flex
								alignItems="center"
								flex="none"
								flexDirection="row"
								applyCss={{ height: '3rem' }}
							>
								<BlockImage
									src={imageData.dataUrl}
									width={imageData.width || 150}
								/>
							</Flex>
							<Label>{item.label}</Label>
						</Flex>
					);
				}}
			</FxImageLoader>
		);
	}
}

export default ImageGridItem;
