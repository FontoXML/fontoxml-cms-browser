import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Button, ButtonGroup, Modal, ModalBody, ModalFooter, ModalHeader } from 'fontoxml-vendor-fds/components';

import FxDocumentBrowser from '../../browsers/documents/FxDocumentBrowser.jsx';
import FxCreateDocumentForm from '../../forms/create-document/FxCreateDocumentForm.jsx';

class FxOpenOrCreateDocumentModal extends Component {
	constructor (props) {
		super(props);

		const { createTabLabels, openTabLabels } = this.props;

		this.tabs = [
			{
				tabId: 'create',
				label: createTabLabels.tabButtonLabel,
				icon: 'plus',
				modalSize: 's',
				submitButtonLabel: createTabLabels.submitButtonLabel
			},
			{
				tabId: 'open',
				label: openTabLabels.tabButtonLabel,
				icon: 'folder-open-o',
				modalSize: 'm',
				submitButtonLabel: openTabLabels.submitButtonLabel
			}
		];

		this.initialState = {
			activeTab: this.tabs[1],
			documentTitle: '',
			isSubmitting: false,
			selectedDocument: null,
			viewMode: 'list'
		};

		this.state = this.initialState;
	}

	componentWillMount () {
		this.setState(this.initialState);
	}

	isSubmitPossible () {
		const { activeTab, documentTitle, selectedDocument } = this.state;
		const { selectedFolder, selectedDocumentTemplate } = this.props;

		if (activeTab.tabId === 'create') {
			return documentTitle.trim().length > 0 && selectedFolder !== null && selectedDocumentTemplate !== null;
		}

		if (activeTab.tabId === 'open') {
			return selectedDocument !== null;
		}
	}

	submit (document) {
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
	}

	render () {
		const { activeTab, documentTitle, isSubmitting, viewMode } = this.state;
		const {
			dataProviderName,
			openSelectFolderBrowserModal, openSelectDocumentTemplateBrowserModal,
			onTabSwitch,
			selectedFolder, selectedDocumentTemplate,
			title, createTabLabels, openTabLabels
		} = this.props;

		return (
			<Modal size={ activeTab.modalSize }>
				<ModalHeader title={ title } />

				<ModalBody paddingSize='l'>
					<ButtonGroup
						items={ this.tabs }
						selectedItem={ activeTab }
						onItemClick={ (item) => {
							this.setState({ ...this.initialState, activeTab: item });

							onTabSwitch();
						} }
					/>

					{ activeTab.tabId === 'create' &&
						<FxCreateDocumentForm
							labels={ createTabLabels }
							documentTitle={ documentTitle }
							onDocumentTitleChange={ (documentTitle) => this.setState({ documentTitle }) }
							openSelectFolderBrowserModal={ openSelectFolderBrowserModal }
							openSelectDocumentTemplateBrowserModal={ openSelectDocumentTemplateBrowserModal }
							selectedFolder={ selectedFolder }
							selectedDocumentTemplate={ selectedDocumentTemplate }
						/>
					}
					{ activeTab.tabId === 'open' &&
						<FxDocumentBrowser
							dataProviderName={ dataProviderName }
							labels={ openTabLabels }
							onDocumentSelect={ (selectedDocument) => this.setState({ selectedDocument }) }
							onDocumentOpen={ (openedDocument) => this.submit(openedDocument) }
							onViewModeChange={ (viewMode) => this.setState({ viewMode }) }
							viewMode={ viewMode }
						/>
					}
				</ModalBody>

				<ModalFooter>
					<Button
						type='primary'
						label={ activeTab.submitButtonLabel }
						iconAfter={ isSubmitting ? 'spinner' : '' }
						isDisabled={ !this.isSubmitPossible() || isSubmitting }
						onClick={ () => this.submit(this.state.selectedDocument) }
					/>
				</ModalFooter>
			</Modal>
		);
	}
}

FxOpenOrCreateDocumentModal.propTypes = {
	openSelectFolderBrowserModal: PropTypes.func.isRequired,
	openSelectDocumentTemplateBrowserModal: PropTypes.func.isRequired,
	onTabSwitch: PropTypes.func,
	onModalSubmit: PropTypes.func.isRequired,
	selectedFolder: PropTypes.object,
	selectedDocumentTemplate: PropTypes.object
};

export default FxOpenOrCreateDocumentModal;
