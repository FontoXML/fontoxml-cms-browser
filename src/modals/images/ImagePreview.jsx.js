import React, { PureComponent } from 'react';

import { merge } from 'glamor';

import {
	Flex,
	Heading,
	KeyValueList,
	HorizontalSeparationLine
} from 'fontoxml-vendor-fds/components';
import { block } from 'fontoxml-vendor-fds/system';

const imageStyles = merge(block, {
	position: 'absolute',
	maxWidth: '100%',
	maxHeight: '100%',
	width: 'auto',
	height: 'auto',
	top: '50%',
	left: '50%',
	transform: 'translateX(-50%) translateY(-50%)'
});

class ImagePreview extends PureComponent {
	render() {
		const { dataUrl, heading, properties } = this.props;
		return (
			<Flex flex="auto" flexDirection="column">
				<Flex
					flex="auto"
					flexDirection="column"
					paddingSize={{ horizontal: 'l', top: 'l' }}
				>
					<Heading level="4">{heading}</Heading>

					<Flex flex="auto">
						<img src={dataUrl} {...imageStyles} />
					</Flex>

					<HorizontalSeparationLine marginSizeTop="l" />
				</Flex>

				<KeyValueList items={properties} scrollLimit={5} paddingSize="l" />
			</Flex>
		);
	}
}

export default ImagePreview;
