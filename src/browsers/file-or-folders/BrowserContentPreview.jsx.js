import React from 'react';

import { merge } from 'glamor';

import { borderLeft, color, flex } from 'fontoxml-vendor-fds/system';

const styles = merge(
	flex('vertical'),
	borderLeft(color('border')),
	{
		flex: 'none',
		width: '35rem',
		backgroundColor: color('inlay-background')
	}
);

const BrowserContentPreview = ({ children }) => (
	<fds-browser-content-preview { ...styles }>
		{ children }
	</fds-browser-content-preview>
);

export default BrowserContentPreview;
