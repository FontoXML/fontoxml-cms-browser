import React from 'react';

import { merge } from 'glamor';

import FxTemplatedView from 'fontoxml-templated-views/FxTemplatedView.jsx';

import { block } from 'fontoxml-vendor-fds/system';

const styles = merge(
	block,
	{ flex: 'auto', overflowY: 'auto' }
);

const FxDocumentPreview = ({ documentId }) => (
	<fx-document-preview { ...styles }>
		<FxTemplatedView
			documentId={ documentId }
			flags={ { readonly: true } }
			mode='preview'
			overrideMode=''
			stylesheetName='content'
			viewName='document-preview'
		/>
	</fx-document-preview>
);

export default FxDocumentPreview;
