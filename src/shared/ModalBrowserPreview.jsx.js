import React, { Component } from 'react';

import { SpinnerIcon, StateMessage } from 'fontoxml-vendor-fds/components';

class ModalBrowserPreview extends Component {
	state = { isLoading: true, imageData: null };

	setStateIfMounted = state => {
		if (this.isComponentMounted) {
			this.setState(state);
		}
	};
	handleLoadImage = imageData => {
		this.setStateIfMounted({ isLoading: false, imageData: imageData });
	};
	handleLoadError = _error => {
		this.setStateIfMounted({ isLoading: false, imageData: null });
	};

	componentWillReceiveProps(nextProps) {
		if (this.props.selectedItem.id === nextProps.selectedItem.id) {
			return;
		}

		this.setState({ isLoading: true });

		nextProps
			.loadImage(nextProps.selectedItem.id)
			.then(this.handleLoadImage, this.handleLoadError);
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
		this.isComponentMounted = true;

		this.props
			.loadImage(this.props.selectedItem.id)
			.then(this.handleLoadImage, this.handleLoadError);
	}

	componentWillUnmount() {
		this.isComponentMounted = false;
	}
}

export default ModalBrowserPreview;
