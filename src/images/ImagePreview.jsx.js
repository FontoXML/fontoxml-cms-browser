import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { merge } from 'glamor';

import {
	Flex,
	Heading,
	HorizontalSeparationLine,
	KeyValueList,
	SpinnerIcon,
	StateMessage
} from 'fontoxml-vendor-fds/components';
import { block } from 'fontoxml-vendor-fds/system';

const imageStyles = merge(block, {
	position: 'absolute',
	maxWidth: '100%',
	maxHeight: '100%',
	width: 'auto',
	height: 'auto',
	top: '50%',
	left: '50%',
	transform: 'translateX(-50%) translateY(-50%)'
});

class ModalBrowserPreview extends Component {
	static defaultProps = {
		selectedItem: null
	};

	static propTypes = {
		stateLabels: PropTypes.shape({
			previewError: PropTypes.shape({
				title: PropTypes.string,
				message: PropTypes.string
			}).isRequired,
			loadingPreview: PropTypes.shape({
				title: PropTypes.string,
				message: PropTypes.string
			}).isRequired
		}).isRequired,

		// from withModularBrowserCapabilities
		loadImage: PropTypes.func.isRequired,
		selectedItem: PropTypes.object
	};

	isMountedInDOM = false;

	state = { isErrored: false, isLoading: true, imageData: null };

	tryToUpdateState = (idBeingLoaded, nextState) => {
		if (this.isMountedInDOM && idBeingLoaded === this.props.selectedItem.id) {
			this.setState(nextState);
		}
	};

	handleLoadImage = (imageData, idBeingLoaded) =>
		this.tryToUpdateState(idBeingLoaded, { isLoading: false, imageData });
	handleLoadError = (_error, idBeingLoaded) =>
		this.tryToUpdateState(idBeingLoaded, {
			isErrored: true,
			isLoading: false,
			imageData: null
		});

	loadImage(props) {
		this.setState({ isLoading: true });

		props
			.loadImage(props.selectedItem.id)
			.then(
				imageData => this.handleLoadImage(imageData, props.selectedItem.id),
				error => this.handleLoadError(error, props.selectedItem.id)
			);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.selectedItem.id === nextProps.selectedItem.id) {
			return;
		}

		this.loadImage(nextProps);
	}

	render() {
		const { stateLabels, selectedItem } = this.props;

		if (this.state.isErrored) {
			return (
				<StateMessage
					connotation="warning"
					paddingSize="m"
					visual="exclamation-triangle"
					{...stateLabels.previewError}
				/>
			);
		}

		if (this.state.isLoading) {
			return (
				<StateMessage
					paddingSize="m"
					visual={<SpinnerIcon />}
					{...stateLabels.loadingPreview}
				/>
			);
		}

		return (
			<Flex flex="auto" flexDirection="column">
				<Flex
					flex="auto"
					flexDirection="column"
					paddingSize={{ horizontal: 'l', top: 'l' }}
				>
					<Heading level="4">{selectedItem.label}</Heading>

					<Flex flex="auto">
						<img src={this.state.imageData.dataUrl} {...imageStyles} />
					</Flex>

					<HorizontalSeparationLine marginSizeTop="l" />
				</Flex>

				<KeyValueList
					items={selectedItem.metadata ? selectedItem.metadata.properties || {} : {}}
					scrollLimit={5}
					paddingSize="l"
				/>
			</Flex>
		);
	}

	componentDidMount() {
		this.isMountedInDOM = true;

		this.loadImage(this.props);
	}

	componentWillUnmount() {
		this.isMountedInDOM = false;
	}
}

export default ModalBrowserPreview;
