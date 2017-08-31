import React, { Component } from 'react';

import { merge } from 'glamor';

import documentsManager from 'fontoxml-documents/documentsManager';
import scrollIntoViewManager from 'fontoxml-scroll-into-view/scrollIntoViewManager';
import FxTemplatedView from 'fontoxml-templated-views/FxTemplatedView.jsx';

import { HorizontalSeparationLine } from 'fontoxml-vendor-fds/components';
import { block, flex, padding } from 'fontoxml-vendor-fds/system';

import FxLinkableElementDetails from './FxLinkableElementDetails.jsx';
import LinkSelectorOverlayView from './LinkSelectorOverlayView.jsx';

const styles = merge(
	flex('vertical'),
	// max-height required for Firefox, otherwise the overflow on fx-document-container isn't being triggered.
	{ flex: 'auto', maxHeight: '100%' }
);
const documentContainerStyles = merge(
	block,
	{ flex: 'auto', overflowY: 'auto' }
);
const footerStyles = merge(
	flex('vertical'),
	padding('l'),
	{ flex: 'none' }
);

class FxDocumentPreviewAndLinkSelector extends Component {
	render () {
		const { documentId, linkType, linkableElementsQuery, selectedLink, onSelectedLinkableElementChange } = this.props;

		return (
			<fx-document-preview-and-link-selector { ...styles }>
				<fx-document-container { ...documentContainerStyles }>
					<FxTemplatedView
						documentId={ documentId }
						flags={ { readonly: true } }
						mode='preview'
						overrideMode=''
						stylesheetName='content'
						viewName='content-preview'
						createOverlayViews={
							(viewRootNode, templatedView) => [
								new LinkSelectorOverlayView(viewRootNode, templatedView, linkableElementsQuery, selectedLink, onSelectedLinkableElementChange)
							]
						} />
				</fx-document-container>

				{ selectedLink.documentId !== null && <fx-document-preview-footer { ...footerStyles }>
					<HorizontalSeparationLine marginSizeBottom='l' />

					<FxLinkableElementDetails linkType={ linkType } documentId={ selectedLink.documentId } elementId={ selectedLink.nodeId } />
				</fx-document-preview-footer> }
			</fx-document-preview-and-link-selector>
		);
	}

	componentDidMount () {
		const { selectedLink } = this.props;
		if (!selectedLink || !selectedLink.nodeId) {
			return;
		}

		const selectedNode = documentsManager.getNodeById(selectedLink.nodeId);
		scrollIntoViewManager.scrollSourceNodeIntoView('content-preview', selectedNode, {
			alignTo: 'top',
			padding: 0
		});
	}
}

export default FxDocumentPreviewAndLinkSelector;
