import React, { Component } from 'react';

import {
	ContainedImage,
	Flex,
	GridItem,
	Icon,
	Label,
	SpinnerIcon
} from 'fontoxml-vendor-fds/components';

class ImageGridItem extends Component {
	isComponentMounted = false;

	state = { isLoading: false };

	handleLoadingIsFinished = () => {
		if (this.isComponentMounted) {
			this.setState({ isLoading: false });
		}
	};

	componentWillReceiveProps(nextProps) {
		const { item } = this.props;

		if (item.type !== 'folder' && nextProps.item.id !== item.id) {
			if (!this.props.cachedFilesByRemoteId[item.id]) {
				this.setState({ isLoading: true });

				this.props.loadImage(item.id, this.handleLoadingIsFinished);
			}
		}
	}

	componentWillMount() {
		const { item } = this.props;

		if (item.type !== 'folder' && !this.props.cachedFilesByRemoteId[item.id]) {
			this.setState({ isLoading: true });

			this.props.loadImage(item.id, this.handleLoadingIsFinished);
		}
	}

	render() {
		const { item, isSelected, isDisabled, onClick, onDoubleClick } = this.props;
		let GridItemContent = null;

		if (item.type === 'folder') {
			GridItemContent = (
				<Flex alignItems="center" flexDirection="column">
					<Icon icon={item.icon || 'folder-o'} size="m" />
					<Label>{item.label}</Label>
				</Flex>
			);
		} else if (this.state.isLoading) {
			GridItemContent = (
				<Flex alignItems="center" flex="1" flexDirection="column">
					<SpinnerIcon size="m" />
					<Label>{item.label}</Label>
				</Flex>
			);
		} else if (this.props.cachedErrorsByRemoteId[item.id]) {
			GridItemContent = (
				<Flex alignItems="center" flex="1" flexDirection="column">
					<Icon
						colorName="icon-m-error-color"
						icon={item.icon || 'file-image-o'}
						size="m"
					/>
					<Label colorName="text-muted-color">{item.label}</Label>
				</Flex>
			);
		} else {
			GridItemContent = (
				<Flex alignItems="center" flex="1" flexDirection="column">
					<Flex applyCss={{ height: '3rem' }}>
						<ContainedImage src={this.props.cachedFilesByRemoteId[item.id].dataUrl} />
					</Flex>
					<Label>{item.label}</Label>
				</Flex>
			);
		}

		return (
			<GridItem
				isSelected={isSelected}
				isDisabled={isDisabled}
				onClick={onClick}
				onDoubleClick={onDoubleClick}
			>
				{GridItemContent}
			</GridItem>
		);
	}

	componentDidMount() {
		this.isComponentMounted = true;
	}

	componentWillUnmount() {
		this.isComponentMounted = false;
	}
}

export default ImageGridItem;
