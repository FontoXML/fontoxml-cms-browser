import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { SpinnerIcon, StateMessage } from 'fds/components';
import FxDocumentLoader from 'fontoxml-fx/FxDocumentLoader.jsx';
import FxNodePreviewWithLinkSelector from 'fontoxml-fx/FxNodePreviewWithLinkSelector.jsx';

class DocumentWithLinkSelectorPreview extends Component {
	static defaultProps = {
		selectedItem: null
	};

	static propTypes = {
		linkableElementsQuery: PropTypes.string.isRequired,
		onItemSelect: PropTypes.func.isRequired,
		selectedItem: PropTypes.object,
		stateLabels: PropTypes.shape({
			previewError: PropTypes.shape({
				title: PropTypes.string,
				message: PropTypes.string
			}).isRequired,
			loadingPreview: PropTypes.shape({
				title: PropTypes.string,
				message: PropTypes.string
			}).isRequired
		}).isRequired
	};

	handleSelectedNodeChange = (documentId, nodeId) =>
		this.props.onItemSelect({ ...this.props.selectedItem, documentId, nodeId });

	render() {
		const { linkableElementsQuery, stateLabels, selectedItem } = this.props;

		return (
			<FxDocumentLoader remoteId={selectedItem.id}>
				{({ isErrored, isLoading, documentId }) => {
					if (isErrored) {
						return (
							<StateMessage
								connotation="warning"
								paddingSize="m"
								visual="exclamation-triangle"
								{...stateLabels.previewError}
							/>
						);
					}

					if (isLoading) {
						return (
							<StateMessage
								paddingSize="m"
								visual={<SpinnerIcon />}
								{...stateLabels.loadingPreview}
							/>
						);
					}

					return (
						<FxNodePreviewWithLinkSelector
							documentId={documentId}
							onSelectedNodeChange={this.handleSelectedNodeChange}
							selector={linkableElementsQuery}
							selectedNodeId={selectedItem.nodeId}
						/>
					);
				}}
			</FxDocumentLoader>
		);
	}
}

export default DocumentWithLinkSelectorPreview;
