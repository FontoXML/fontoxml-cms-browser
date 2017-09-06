import React from 'react';

import { merge } from 'glamor';

import { flex, padding } from 'fontoxml-vendor-fds/system';

const styles = merge(
	flex('horizontal'),
	padding('l'),
	{
		flex: 'auto',
		justifyContent: 'center',
		alignItems: 'center'
	}
);

const BrowserContentStateMessage = ({ children }) => (
	<fds-browser-content-state-message { ...styles }>
		{ children }
	</fds-browser-content-state-message>
);

export default BrowserContentStateMessage;
