import React, { Component } from 'react';

import { SpinnerIcon, StateMessage } from 'fontoxml-vendor-fds/components';

class ModalBrowserPreview extends Component {
	render() {
		const { stateLabels, renderPreview, selectedItem } = this.props;

		if (this.props.cachedErrorsByRemoteId[selectedItem.id]) {
			return (
				<StateMessage
					connotation="warning"
					visual="exclamation-triangle"
					{...stateLabels.previewError}
				/>
			);
		}

		if (!this.props.cachedFilesByRemoteId[selectedItem.id]) {
			return <StateMessage visual={<SpinnerIcon />} {...stateLabels.loadingPreview} />;
		}

		return renderPreview({
			dataUrl: this.props.cachedFilesByRemoteId[this.props.selectedItem.id].dataUrl,
			heading: this.props.selectedItem.label,
			properties: this.props.selectedItem.metadata.properties
		});
	}
}

export default ModalBrowserPreview;
