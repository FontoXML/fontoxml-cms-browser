import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Flex, HorizontalSeparationLine, SpinnerIcon, StateMessage, Text } from 'fds/components';
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

		// from withModularBrowserCapabilities
		loadItem: PropTypes.func.isRequired,
		onItemSelect: PropTypes.func.isRequired,
		selectedItem: PropTypes.object
	};

	isMountedInDOM = false;

	state = { isErrored: false, isLoading: true };

	handleLoadDocumentId = (documentId, idBeingLoaded) => {
		if (this.isMountedInDOM && idBeingLoaded === this.props.selectedItem.id) {
			this.props.onItemSelect({ ...this.props.selectedItem, documentId });
			this.setState({ isErrored: false, isLoading: false });
		}
	};

	handleLoadError = (error, idBeingLoaded) => {
		if (!error) {
			return;
		}

		if (this.isMountedInDOM && idBeingLoaded === this.props.selectedItem.id) {
			this.setState({ isErrored: true, isLoading: false });
		}
	};

	loadDocument = selectedItem => {
		this.props
			.loadItem(selectedItem.id)
			.then(
				documentId => this.handleLoadDocumentId(documentId, selectedItem.id),
				error => this.handleLoadError(error, selectedItem.id)
			);
	};

	componentWillReceiveProps(nextProps) {
		if (
			nextProps.selectedItem.id === this.props.selectedItem.id &&
			nextProps.selectedItem.documentId
		) {
			return;
		}

		this.setState({ isErrored: false, isLoading: true });

		this.loadDocument(nextProps.selectedItem);
	}

	render() {
		const { selectedItem, stateLabels } = this.props;

		if (this.state.isErrored) {
			return (
				<StateMessage
					connotation="warning"
					paddingSize="m"
					visual="exclamation-triangle"
					{...stateLabels.previewError}
				/>
			);
		}

		if (this.state.isLoading) {
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
					<FxNodePreview documentId={selectedItem.documentId} />
				</Flex>

				{selectedItem.description &&
				selectedItem.description.trim().length !== 0 && (
					<Flex applyCss={maxHeightStyles} flex="none" flexDirection="column">
						<Flex paddingSize={{ horizontal: 'l' }}>
							<HorizontalSeparationLine />
						</Flex>

						<Flex flex="1" flexDirection="column" isScrollContainer paddingSize="l">
							<Text>{selectedItem.description}</Text>
						</Flex>
					</Flex>
				)}
			</Flex>
		);
	}

	componentDidMount() {
		this.isMountedInDOM = true;

		this.loadDocument(this.props.selectedItem);
	}

	componentWillUnmount() {
		this.isMountedInDOM = false;
	}
}

export default DocumentPreview;
