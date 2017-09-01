import React, { Component } from 'react';

import {
	ContainedImage,
	Flex,
	GridItem,
	Icon,
	Label,
	SpinnerIcon
} from 'fontoxml-vendor-fds/components';

import imageLoader from './imageLoader.jsx';

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

		if (nextProps.item.id !== item.id) {
			if (!this.props.cachedFileByRemoteId[item.id]) {
				this.setState({ isLoading: true });

				imageLoader(item.id, this.props, this.handleLoadingIsFinished);
			}
		}
	}

	render() {
		const { key, item, isSelected, isDisabled, onClick, onDoubleClick } = this.props;
		if (item === 'folder') {
			return (
				<GridItem
					key={key}
					isSelected={isSelected}
					isDisabled={isDisabled}
					onClick={onClick}
					onDoubleClick={onDoubleClick}
				>
					<Icon align="center" icon={item.icon || 'folder-o'} size="m" />
					<Label align="center" flex="1">{item.label}</Label>
				</GridItem>
			);
		}

		if (this.state.isLoading) {
			return (
				<GridItem
					key={key}
					isSelected={isSelected}
					isDisabled={isDisabled}
					onClick={onClick}
					onDoubleClick={onDoubleClick}
				>
					<SpinnerIcon align="center" size="m" />
					<Label align="center" flex="1">{item.label}</Label>
				</GridItem>
			);
		}

		if (this.props.cachedErrorByRemoteId[item.id]) {
			return (
				<GridItem
					key={key}
					isSelected={isSelected}
					isDisabled={isDisabled}
					onClick={onClick}
					onDoubleClick={onDoubleClick}
				>
					<Icon
						align="center"
						colorName="icon-m-error-color"
						icon={item.icon || 'file-image-o'}
						size="m"
					/>
					<Label align="center" flex="1" colorName="text-muted-color">{item.label}</Label>
				</GridItem>
			);
		}

		return (
			<GridItem
				isSelected={isSelected}
				isDisabled={isDisabled}
				onClick={onClick}
				onDoubleClick={onDoubleClick}
			>
				<Flex alignItems="center" applyCss={{ height: '3rem' }} justifyContent="center">
					<ContainedImage src={this.props.cachedFileByRemoteId[item.id].dataUrl} />
				</Flex>
				<Label align="center" flex="1">{item.label}</Label>
			</GridItem>
		);
	}

	componentDidMount() {
		const { item } = this.props;
		this.isComponentMounted = true;

		if (!this.props.cachedFileByRemoteId[item.id]) {
			this.setState({ isLoading: true });

			imageLoader(item.id, this.props, this.handleLoadingIsFinished);
		}
	}

	componentWillUnmount() {
		this.isComponentMounted = false;
	}
}

export default ImageGridItem;
