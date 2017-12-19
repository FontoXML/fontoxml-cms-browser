import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { ContainedImage, Flex, GridItem, Icon, Label, SpinnerIcon } from 'fds/components';
import FxImageLoader from 'fontoxml-fx/FxImageLoader.jsx';

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
		onDoubleClick: PropTypes.func
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

		if (item.type === 'folder') {
			return this.wrapInGridItem(
				<Flex alignItems="center" flexDirection="column">
					<Icon icon={item.icon || 'folder-o'} size="m" />
					<Label>{item.label}</Label>
				</Flex>
			);
		}

		return (
			<FxImageLoader remoteId={item.id} type="thumbnail">
				{({ isErrored, isLoading, imageData }) => {
					if (isErrored) {
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

					if (isLoading) {
						return this.wrapInGridItem(
							<Flex alignItems="center" flex="1" flexDirection="column">
								<SpinnerIcon size="m" />
								<Label>{item.label}</Label>
							</Flex>
						);
					}

					return this.wrapInGridItem(
						<Flex alignItems="center" flex="1" flexDirection="column">
							<Flex
								alignItems="center"
								flex="1"
								flexDirection="row"
								applyCss={{ height: '3rem' }}
							>
								<ContainedImage src={imageData.dataUrl} />
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
