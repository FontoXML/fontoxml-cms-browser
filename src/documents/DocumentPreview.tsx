import {
	Block,
	Flex,
	HorizontalSeparationLine,
	SpinnerIcon,
	StateMessage,
	Text,
} from 'fds/components';
import React, { Component } from 'react';

import FxDocumentLoader from 'fontoxml-fx/src/FxDocumentLoader';
import FxErroredTemplatedView from 'fontoxml-fx/src/FxErroredTemplatedView';
import FxNodePreview from 'fontoxml-fx/src/FxNodePreview';

const maxHeightStyles = { maxHeight: '50%' };

type Props = {
	onLoadIsDone?(...args: unknown[]): unknown;
	onItemIsErrored?(...args: unknown[]): unknown;
	stateLabels: {
		loadingPreview: {
			title?: string;
			message?: string;
		};
	};
	selectedItem?: object;
};

class DocumentPreview extends Component<Props> {
	static defaultProps = {
		onLoadIsDone: (_documentId) => {},
		onItemIsErrored: (_item) => {},
		selectedItem: null,
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
