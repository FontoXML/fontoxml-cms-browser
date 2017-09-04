import React, { Component } from 'react';

import { SpinnerIcon, StateMessage } from 'fontoxml-vendor-fds/components';

class ModalBrowserPreview extends Component {
	render() {
		const { labels, renderPreview, selectedItem } = this.props;

		if (this.props.cachedErrorByRemoteId[selectedItem.id]) {
			return (
				<StateMessage
					connotation="warning"
					message={labels.states.error.message}
					title={labels.states.error.title}
					visual="exclamation-triangle"
				/>
			);
		}

		if (!this.props.cachedFileByRemoteId[selectedItem.id]) {
			return (
				<StateMessage
					message={labels.states.loading.message}
					title={labels.states.loading.title}
					visual={<SpinnerIcon />}
				/>
			);
		}

		return renderPreview({
			dataUrl: this.props.cachedFileByRemoteId[this.props.selectedItem.id].dataUrl,
			heading: this.props.selectedItem.label,
			properties: this.props.selectedItem.metadata.properties
		});
	}
}

export default ModalBrowserPreview;
