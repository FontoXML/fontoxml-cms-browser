import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Flex, HorizontalSeparationLine, SpinnerIcon, StateMessage, Text } from 'fds/components';
import FxDocumentLoader from 'fontoxml-fx/FxDocumentLoader.jsx';
import FxNodePreview from 'fontoxml-fx/FxNodePreview.jsx';

const maxHeightStyles = { maxHeight: '50%' };

class DocumentPreview extends Component {
	static defaultProps = {
		selectedItem: null
	};

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
			<FxDocumentLoader remoteId={selectedItem.id}>
				{({ isErrored, isLoading, documentId }) => {
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
						<Flex flex="1" flexDirection="column">
							<Flex flex="1" flexDirection="column" isScrollContainer>
								<FxNodePreview documentId={documentId} />
							</Flex>

							{selectedItem.description &&
								selectedItem.description.trim().length !== 0 && (
									<Flex
										applyCss={maxHeightStyles}
										flex="none"
										flexDirection="column"
									>
										<Flex paddingSize={{ horizontal: 'l' }}>
											<HorizontalSeparationLine />
										</Flex>

										<Flex
											flex="1"
											flexDirection="column"
											isScrollContainer
											paddingSize="l"
										>
											<Text>{selectedItem.description}</Text>
										</Flex>
									</Flex>
								)}
						</Flex>
					);
				}}
			</FxDocumentLoader>
		);
	}
}

export default DocumentPreview;
