import React from 'react';

import { merge } from 'glamor';

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
	block,
	padding('l')
);

const FxDocumentPreviewAndLinkSelector = ({ documentId, linkType, linkableElementsQuery, selectedLink, onSelectedLinkableElementChange }) => (
	<fx-document-preview-and-link-selector { ...styles }>
		<fx-document-container { ...documentContainerStyles }>
			<FxTemplatedView
				documentId={ documentId }
				flags={ { readonly: true } }
				mode='preview'
				overrideMode=''
				stylesheetName='content'
				viewName='document-preview-and-link-selector'
				createOverlayViews={
					(viewRootNode, templatedView) => [
						new LinkSelectorOverlayView(viewRootNode, templatedView, linkableElementsQuery, selectedLink, onSelectedLinkableElementChange)
					]
				} />
		</fx-document-container>

		{ selectedLink && <fx-document-preview-footer { ...footerStyles }>
			<HorizontalSeparationLine marginSizeBottom='l' />

			<FxLinkableElementDetails linkType={ linkType } documentId={ selectedLink.documentId } elementId={ selectedLink.nodeId } />
		</fx-document-preview-footer> }
	</fx-document-preview-and-link-selector>
);

export default FxDocumentPreviewAndLinkSelector;
