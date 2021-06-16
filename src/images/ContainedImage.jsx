import { block } from 'fds/system';
import React from 'react';

import applyCss from 'fontoxml-styles/src/applyCss.js';

const imageStyles = applyCss([
	block,
	{ maxWidth: '100%', maxHeight: '100%' },
	{ userSelect: 'none' }
]);

// TODO: Use ContainedImage in fds instead of this when it accepts width and height
function ContainedImage({ src, width, height }) {
	return <img {...imageStyles} src={src} width={width} height={height} />;
}

export default ContainedImage;
