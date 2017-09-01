import React, { Component } from 'react';

import {
	ContainedImage,
	Flex,
	Icon,
	Label,
	ListItem,
	SpinnerIcon
} from 'fontoxml-vendor-fds/components';

import imageLoader from './imageLoader.jsx';

class ImageListItem extends Component {
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
				<ListItem
					key={key}
					isSelected={isSelected}
					isDisabled={isDisabled}
					onClick={onClick}
					onDoubleClick={onDoubleClick}
				>
					<Icon icon={item.icon || 'folder-o'} size="s" />
					<Label>{item.label}</Label>
				</ListItem>
			);
		}

		if (this.state.isLoading) {
			return (
				<ListItem
					key={key}
					isSelected={isSelected}
					isDisabled={isDisabled}
					onClick={onClick}
					onDoubleClick={onDoubleClick}
				>
					<SpinnerIcon size="s" />
					<Label>{item.label}</Label>
				</ListItem>
			);
		}

		if (this.props.cachedErrorByRemoteId[item.id]) {
			return (
				<ListItem
					key={key}
					isSelected={isSelected}
					isDisabled={isDisabled}
					onClick={onClick}
					onDoubleClick={onDoubleClick}
				>
					<Icon
						colorName="icon-s-error-color"
						icon={item.icon || 'file-image-o'}
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
			>
				<Flex applyCss={{ width: '.875rem', height: '.875rem' }}>
					<ContainedImage src={this.props.cachedFileByRemoteId[item.id].dataUrl} />
				</Flex>
				<Label>{item.label}</Label>
			</ListItem>
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

export default ImageListItem;
