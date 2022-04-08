import { block } from 'fds/system';
import React from 'react';

import applyCss from 'fontoxml-styles/src/applyCss';

const imageStyles = applyCss([
	block,
	{ maxWidth: '100%', maxHeight: '100%', objectFit: 'scale-down'},
	{ userSelect: 'none' },
]);

// TODO: Use ContainedImage in fds instead of this when it accepts width and height
function BlockImage({ src, width, height }) {
	return <img {...imageStyles} src={src} width={width} height={height} />;
}

export default BlockImage;
