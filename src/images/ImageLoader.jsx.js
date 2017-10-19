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
		// TODO: this has no idBeingLoaded check, do we need it here as well? or remove it in DocumentLoader instead
		if (this.isMountedInDOM) {
			this.setState({ isErrored: false, isLoading: false, imageData });
		}
	};

	handleLoadError = _error => {
		// TODO: this has no idBeingLoaded check, do we need it here as well? or remove it in DocumentLoader instead
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
		if (remoteId === this.props.remoteId) {
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

		this.imageLoader
			.loadItem(this.props.remoteId, this.props.type)
			.then(this.handleLoadImage, this.handleLoadError);
	}

	componentWillUnmount() {
		this.isMountedInDOM = false;
	}
}

export default ImageLoader;
