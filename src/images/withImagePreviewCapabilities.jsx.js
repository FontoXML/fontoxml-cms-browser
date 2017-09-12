import React, { Component } from 'react';

export default function withImagePreviewCapabilities(WrappedComponent) {
	return class ImageItem extends Component {
		isMountedInDOM = false;

		state = {
			isErrored: false,
			isLoading: true,
			imageData: null
		};

		handleLoadImage = imageData => {
			if (this.isMountedInDOM) {
				this.setState({ isErrored: false, isLoading: false, imageData: imageData });
			}
		};
		handleLoadError = _error => {
			if (this.isMountedInDOM) {
				this.setState({ isErrored: true, isLoading: false, imageData: null });
			}
		};

		componentWillReceiveProps(nextProps) {
			const { item } = this.props;

			if (item.id === nextProps.item.id || item.type === 'folder') {
				return;
			}

			this.setState({ isLoading: true });

			this.props.loadItem(item.id).then(this.handleLoadImage, this.handleLoadError);
		}

		render() {
			const props = {
				...this.props,
				...this.state
			};

			return <WrappedComponent {...props} />;
		}

		componentDidMount() {
			this.isMountedInDOM = true;

			if (this.props.item.type === 'folder') {
				return;
			}

			this.props
				.loadItem(this.props.item.id)
				.then(this.handleLoadImage, this.handleLoadError);
		}

		componentWillUnmount() {
			this.isMountedInDOM = false;
		}
	};
}
