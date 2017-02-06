import React from 'react';

import { merge } from 'glamor';

import { color, flex } from 'fontoxml-vendor-fds/system';

const styles = merge(
	flex('horizontal'),
	{
		flex: 'auto',
		backgroundColor: color('white'),

		// Prevent flashing by giving this an approximate min-height of a state message
		// with a single line title and message (188px = 11.75rem), which is most commonly used here
		// This also prevents nested flex-box vs overflow-y auto issues in Firefox:
		// @see http://stackoverflow.com/questions/28636832/firefox-overflow-y-not-working-with-nested-flexbox
		minHeight: '11.75rem'
	}
);

const BrowserContent = ({ children }) => (
	<fds-browser-content { ...styles }>
		{ children }
	</fds-browser-content>
);

export default BrowserContent;
