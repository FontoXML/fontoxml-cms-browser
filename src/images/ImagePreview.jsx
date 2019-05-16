import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { merge } from 'glamor';

import {
	Flex,
	Heading,
	HorizontalSeparationLine,
	KeyValueList,
	SpinnerIcon,
	StateMessage
} from 'fds/components';
import { block } from 'fds/system';
import FxImageLoader from 'fontoxml-fx/src/FxImageLoader.jsx';

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

class ImagePreview extends Component {
	static propTypes = {
		stateLabels: PropTypes.shape({
			previewError: PropTypes.shape({
				title: PropTypes.string,
				message: PropTypes.string
			}).isRequired,
			loadingPreview: PropTypes.shape({
				title: PropTypes.string,
				message: PropTypes.string
			}).isRequired
		}).isRequired,
		selectedItem: PropTypes.object
	};

	render() {
		const { stateLabels, selectedItem } = this.props;

		return (
			<FxImageLoader remoteId={selectedItem.id} type="web">
				{({ isErrored, isLoading, imageData }) => {
					if (isErrored) {
						return (
							<StateMessage
								connotation="warning"
								paddingSize="m"
								visual="exclamation-triangle"
								{...stateLabels.previewError}
							/>
						);
					}

					if (isLoading) {
						return (
							<StateMessage
								paddingSize="m"
								visual={<SpinnerIcon />}
								{...stateLabels.loadingPreview}
							/>
						);
					}

					return (
						<Flex flex="auto" flexDirection="column">
							<Flex flex="auto" flexDirection="column" paddingSize="l" spaceSize="m">
								<Heading level="4">{selectedItem.label}</Heading>

								<Flex flex="auto">
									<img src={imageData.dataUrl} {...imageStyles} />
								</Flex>
							</Flex>

							{selectedItem.metadata && selectedItem.metadata.properties && (
								<Flex flex="none" flexDirection="column">
									<Flex paddingSize={{ horizontal: 'l' }}>
										<HorizontalSeparationLine />
									</Flex>

									<KeyValueList
										valueByKey={selectedItem.metadata.properties}
										scrollLimit={5}
										paddingSize="l"
									/>
								</Flex>
							)}
						</Flex>
					);
				}}
			</FxImageLoader>
		);
	}
}

export default ImagePreview;
