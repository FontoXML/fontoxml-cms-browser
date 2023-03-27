import * as React from 'react';

import { applyCss, block } from 'fontoxml-design-system/src/system';

const imageStyles = applyCss([
	block,
	{ maxWidth: '100%', maxHeight: '100%', objectFit: 'scale-down' },
	{ userSelect: 'none' },
]);

type Props = {
	src: string;
	width: React.CSSProperties['width'];
	height: React.CSSProperties['height'];
};
// TODO: Use ContainedImage in fds instead of this when it accepts width and height
const BlockImage: React.FC<Props> = ({ src, width, height }) => {
	return <img {...imageStyles} src={src} width={width} height={height} />;
};

export default BlockImage;
