import React from 'react';

import { merge } from 'glamor';

import { block, spaceHorizontal } from 'fontoxml-vendor-fds/system';

const styles = merge(
	block,
	spaceHorizontal('m'),
	{
		flex: 'none',
		marginLeft: 'auto'
	}
);

const BrowserToolbarAlignRight = ({ children }) => (
	<fds-browser-toolbar-align-right { ...styles }>
		{ children }
	</fds-browser-toolbar-align-right>
);

export default BrowserToolbarAlignRight;
