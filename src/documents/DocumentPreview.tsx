import {
	Block,
	Flex,
	HorizontalSeparationLine,
	SpinnerIcon,
	StateMessage,
	Text,
} from 'fds/components';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import FxDocumentLoader from 'fontoxml-fx/src/FxDocumentLoader';
import FxErroredTemplatedView from 'fontoxml-fx/src/FxErroredTemplatedView';
import FxNodePreview from 'fontoxml-fx/src/FxNodePreview';

const maxHeightStyles = { maxHeight: '50%' };

class DocumentPreview extends Component {
	static defaultProps = {
		onLoadIsDone: (_documentId) => {},
		onItemIsErrored: (_item) => {},
		selectedItem: null,
	};

	static propTypes = {
		onLoadIsDone: PropTypes.func,
		onItemIsErrored: PropTypes.func,
		stateLabels: PropTypes.shape({
			loadingPreview: PropTypes.shape({
				title: PropTypes.string,
				message: PropTypes.string,
			}).isRequired,
		}).isRequired,
		selectedItem: PropTypes.object,
	};

	render() {
		const { stateLabels, selectedItem } = this.props;

		return (
			<FxDocumentLoader
				remoteId={selectedItem.id}
				onError={this.props.onItemIsErrored}
				onLoadIsDone={this.props.onLoadIsDone}
			>
				{({
					isErrored,
					isLoading,
					documentId,
					error,
					retryLoadDocument,
				}) => {
					if (isErrored) {
						return (
							<Block flex="1" paddingSize="l" isScrollContainer>
								<FxErroredTemplatedView
									error={error}
									retryLoadDocument={retryLoadDocument}
								/>
							</Block>
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
							<Block flex="1" isScrollContainer>
								<FxNodePreview documentId={documentId} />
							</Block>

							{selectedItem.description &&
								selectedItem.description.trim().length !==
									0 && (
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
											<Text>
												{selectedItem.description}
											</Text>
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
