import PropTypes from 'prop-types';
import React, { Component } from 'react';

import {
	Button,
	ButtonGroup,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader
} from 'fontoxml-vendor-fds/components';

import FxDocumentBrowser from '../../browsers/documents/FxDocumentBrowser.jsx';
import FxCreateDocumentForm from '../../forms/create-document/FxCreateDocumentForm.jsx';

class FxOpenOrCreateDocumentModal extends Component {
	static propTypes = {
		openSelectFolderBrowserModal: PropTypes.func.isRequired,
		openSelectDocumentTemplateBrowserModal: PropTypes.func.isRequired,
		onTabSwitch: PropTypes.func,
		onModalSubmit: PropTypes.func.isRequired,
		selectedFolder: PropTypes.object,
		selectedDocumentTemplate: PropTypes.object
	};

	tabs = [
		{
			tabId: 'create',
			label: this.props.createTabLabels.tabButtonLabel,
			icon: 'plus',
			modalSize: 's',
			submitButtonLabel: this.props.createTabLabels.submitButtonLabel
		},
		{
			tabId: 'open',
			label: this.props.openTabLabels.tabButtonLabel,
			icon: 'folder-open-o',
			modalSize: 'm',
			submitButtonLabel: this.props.openTabLabels.submitButtonLabel
		}
	];

	initialState = {
		activeTab: this.tabs[1],
		documentTitle: '',
		isSubmitting: false,
		selectedDocument: null,
		viewMode: 'list'
	};

	state = this.initialState;

	handleItemClick = item => {
		this.setState({ ...this.initialState, activeTab: item });

		this.props.onTabSwitch();
	};

	handleDocumentTitleChange = documentTitle => this.setState({ documentTitle });

	handleDocumentSelect = selectedDocument => this.setState({ selectedDocument });

	submit = document => {
		const { activeTab, documentTitle } = this.state;
		const { onModalSubmit, selectedFolder, selectedDocumentTemplate } = this.props;

		this.setState({ isSubmitting: true }, () => {
			onModalSubmit({
				activeTabId: activeTab.tabId,
				documentTitle,
				selectedFolder,
				selectedDocumentTemplate,
				selectedDocument: document
			});
		});
	};

	handleDocumentOpen = openedDocument => this.submit(openedDocument);

	handleViewModeChange = viewMode => this.setState({ viewMode });

	isSubmitPossible = () => {
		const { activeTab, documentTitle, selectedDocument } = this.state;

		if (activeTab.tabId === 'create') {
			return (
				documentTitle.trim().length > 0 &&
				this.props.selectedFolder !== null &&
				this.props.selectedDocumentTemplate !== null
			);
		}

		if (activeTab.tabId === 'open') {
			return selectedDocument !== null;
		}
	};

	handleSubmitButton = () => this.submit(this.state.selectedDocument);

	render() {
		const { activeTab, documentTitle, isSubmitting, viewMode } = this.state;

		return (
			<Modal size={activeTab.modalSize}>
				<ModalHeader title={this.props.title} />

				<ModalBody paddingSize="l">
					<ButtonGroup
						items={this.tabs}
						selectedItem={activeTab}
						onItemClick={this.handleItemClick}
					/>

					{activeTab.tabId === 'create' &&
						<FxCreateDocumentForm
							labels={this.props.createTabLabels}
							documentTitle={documentTitle}
							onDocumentTitleChange={this.handleDocumentTitleChange}
							openSelectFolderBrowserModal={this.props.openSelectFolderBrowserModal}
							openSelectDocumentTemplateBrowserModal={
								this.props.openSelectDocumentTemplateBrowserModal
							}
							selectedFolder={this.props.selectedFolder}
							selectedDocumentTemplate={this.props.selectedDocumentTemplate}
						/>}

					{activeTab.tabId === 'open' &&
						<FxDocumentBrowser
							dataProviderName={this.props.dataProviderName}
							labels={this.props.openTabLabels}
							onDocumentSelect={this.handleDocumentSelect}
							onDocumentOpen={this.handleDocumentOpen}
							onViewModeChange={this.handleViewModeChange}
							viewMode={viewMode}
						/>}
				</ModalBody>

				<ModalFooter>
					<Button
						type="primary"
						label={activeTab.submitButtonLabel}
						iconAfter={isSubmitting ? 'spinner' : ''}
						isDisabled={!this.isSubmitPossible() || isSubmitting}
						onClick={this.handleSubmitButton}
					/>
				</ModalFooter>
			</Modal>
		);
	}
}

export default FxOpenOrCreateDocumentModal;
