import PropTypes from 'prop-types';
import { Component } from 'react';

import FxImageLoader from 'fontoxml-fx/FxImageLoader.jsx';

class ImageLoader extends Component {
	static propTypes = {
		children: PropTypes.func.isRequired,
		remoteId: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired
	};

	imageLoader = new FxImageLoader();
	isMountedInDOM = false;

	state = {
		imageData: null,
		isErrored: false,
		isLoading: true
	};

	handleLoadImage = imageData => {
		if (this.isMountedInDOM) {
			this.setState({ isErrored: false, isLoading: false, imageData });
		}
	};

	handleLoadError = _error => {
		if (this.isMountedInDOM) {
			this.setState({ isErrored: true, isLoading: false, imageData: null });
		}
	};

	loadImage = () => {
		this.imageLoader
			.loadItem(this.props.remoteId, this.props.type)
			.then(this.handleLoadImage, this.handleLoadError);
	};

	componentWillReceiveProps({ remoteId, type }) {
		if (remoteId === this.props.remoteId && type === this.props.type) {
			return;
		}

		this.setState({ isErrored: false, isLoading: true });

		this.loadImage();
	}

	render() {
		return this.props.children({
			imageData: this.state.imageData,
			isErrored: this.state.isErrored,
			isLoading: this.state.isLoading
		});
	}

	componentDidMount() {
		this.isMountedInDOM = true;

		this.loadImage();
	}

	componentWillUnmount() {
		this.isMountedInDOM = false;
	}
}

export default ImageLoader;
