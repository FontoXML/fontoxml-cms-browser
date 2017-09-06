import React from 'react';

import { merge } from 'glamor';

import { Heading, KeyValueList, HorizontalSeparationLine } from 'fontoxml-vendor-fds/components';
import { block, flex, paddingHorizontal, paddingTop } from 'fontoxml-vendor-fds/system';

const styles = merge(
	flex('vertical'),
	{ flex: 'auto' }
);
const offsetContainerStyles = merge(
	styles,
	paddingHorizontal('l'),
	paddingTop('l')
);
const imageContainerStyles = merge(
	block,
	{ flex: 'auto' }
);
const imageStyles = merge(
	block,
	{
		position: 'absolute',
		maxWidth: '100%', maxHeight: '100%',
		width: 'auto', height: 'auto',
		top: '50%', left: '50%', transform: 'translateX(-50%) translateY(-50%)'
	}
);

const FxImagePreview = ({ heading, dataUrl, properties }) => (
	<fx-image-preview { ...styles }>
		<fx-image-preview-offset-container { ...offsetContainerStyles }>
			<Heading level='4'>{ heading }</Heading>

			<fx-image-container { ...imageContainerStyles }>
				<img src={ dataUrl } { ...imageStyles } />
			</fx-image-container>

			<HorizontalSeparationLine marginSizeTop='l' />
		</fx-image-preview-offset-container>

		<KeyValueList items={ properties } scrollLimit={ 5 } paddingSize='l' />
	</fx-image-preview>
);

export default FxImagePreview;
