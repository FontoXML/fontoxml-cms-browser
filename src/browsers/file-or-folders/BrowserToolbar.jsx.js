import React from 'react';

import { merge } from 'glamor';

import { borderBottom, color, flex, padding, spaceHorizontal } from 'fontoxml-vendor-fds/system';

const styles = merge(
	flex('horizontal'),
	padding('m'),
	spaceHorizontal('m'),
	borderBottom(color('border')),
	{ flex: 'none' }
);

const BrowserToolbar = ({ children }) => (
	<fds-browser-toolbar { ...styles }>
		{ children }
	</fds-browser-toolbar>
);

export default BrowserToolbar;
