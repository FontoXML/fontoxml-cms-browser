import PropTypes from 'prop-types';
import React, { Component } from 'react';

import {
	ContainedImage,
	Flex,
	Heading,
	HorizontalSeparationLine,
	KeyValueList,
	SpinnerIcon,
	StateMessage
} from 'fds/components';
import FxImageLoader from 'fontoxml-fx/FxImageLoader.jsx';

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

								<ContainedImage src={imageData.dataUrl} />
							</Flex>

							{selectedItem.metadata &&
								selectedItem.metadata.properties && (
									<Flex flex="none" flexDirection="column">
										<Flex paddingSize={{ horizontal: 'l' }}>
											<HorizontalSeparationLine />
										</Flex>

										<KeyValueList
											items={selectedItem.metadata.properties}
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
