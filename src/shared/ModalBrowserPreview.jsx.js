import React, { Component } from 'react';

import { SpinnerIcon, StateMessage } from 'fontoxml-vendor-fds/components';

class ModalBrowserPreview extends Component {
	isMountedInDOM = false;

	state = { isLoading: true, imageData: null };

	tryToUpdateState = (idBeingLoaded, nextState) => {
		if (this.isMountedInDOM && idBeingLoaded === this.props.selectedItem.id) {
			this.setState(nextState);
		}
	};

	handleLoadImage = (imageData, idBeingLoaded) =>
		this.tryToUpdateState(idBeingLoaded, { isLoading: false, imageData });
	handleLoadError = (_error, idBeingLoaded) =>
		this.tryToUpdateState(idBeingLoaded, { isLoading: false, imageData: null });

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
		const { stateLabels, renderPreview, selectedItem } = this.props;

		if (this.state.imageData === null) {
			return (
				<StateMessage
					connotation="warning"
					visual="exclamation-triangle"
					{...stateLabels.previewError}
				/>
			);
		}

		if (this.state.isLoading) {
			return <StateMessage visual={<SpinnerIcon />} {...stateLabels.loadingPreview} />;
		}

		return renderPreview({
			dataUrl: this.state.imageData.dataUrl,
			heading: selectedItem.label,
			properties: selectedItem.metadata.properties
		});
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
