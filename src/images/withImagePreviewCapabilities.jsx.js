import React, { Component } from 'react';

export default function withImagePreviewCapabilities(WrappedComponent) {
	return class ImageItem extends Component {
		isComponentMounted = false;

		state = {
			isErrored: false,
			isLoading: true,
			imageData: null
		};

		handleLoadImage = imageData => {
			if (this.isComponentMounted) {
				this.setState({ isErrored: false, isLoading: false, imageData: imageData });
			}
		};
		handleLoadError = _error => {
			if (this.isComponentMounted) {
				this.setState({ isErrored: true, isLoading: false, imageData: null });
			}
		};

		componentWillReceiveProps(nextProps) {
			const { item } = this.props;

			if (item.id === nextProps.item.id || item.type === 'folder') {
				return;
			}

			this.setState({ isLoading: true });

			this.props.loadImage(item.id).then(this.handleLoadImage, this.handleLoadError);
		}

		render() {
			const props = {
				...this.props,
				...this.state
			};

			return <WrappedComponent {...props} />;
		}

		componentDidMount() {
			this.isComponentMounted = true;

			if (this.props.item.type === 'folder') {
				return;
			}

			this.props
				.loadImage(this.props.item.id)
				.then(this.handleLoadImage, this.handleLoadError);
		}

		componentWillUnmount() {
			this.isComponentMounted = false;
		}
	};
}
