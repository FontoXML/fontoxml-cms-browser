import React, { Component } from 'react';

import t from 'fontoxml-localization/t';

import { ModalStack } from 'fontoxml-vendor-fds/components';

import reactToAngularModalBridge from '../../reactToAngularModalBridge';

import FxSelectFolderBrowserModal from '../folders/FxSelectFolderBrowserModal.jsx';

import FxOpenOrCreateDocumentModal from './FxOpenOrCreateDocumentModal.jsx';
import FxSelectDocumentTemplateBrowserModal from './FxSelectDocumentTemplateBrowserModal.jsx';

const getLabels = () => ({
	modalTitle: t('Open or create document'),
	createTab: {
		tabButtonLabel: t('Create new'),
		selectTemplateFormRowLabel: t('Template to start with'),
		selectTemplateButtonLabel: t('Select a template'),
		selectFolderFormRowLabel: t('Save in'),
		selectFolderButtonLabel: t('Select a folder'),
		titleFormRowLabel: t('Title'),
		submitButtonLabel: t('Create')
	},
	selectFolder: {
		modalTitle: t('Select a folder to save your documents in'),
		rootFolderLabel: t('My Drives'),
		states: {
			loading: {
				title: t('Loading folders…'),
				message: null
			},
			browseError: {
				title: t('Can’t open this folder'),
				message: null
			},
			empty: {
				title: t('No results'),
				message: null
			}
		},
		cancelButtonLabel: t('Cancel'),
		submitButtonLabel: t('Select')
	},
	selectTemplate: {
		modalTitle: t('Select a template for your document'),
		rootFolderLabel: t('Templates'),
		states: {
			loading: {
				title: t('Loading templates…'),
				message: null
			},
			browseError: {
				title: t('Can’t open this folder'),
				message: null
			},
			empty: {
				title: t('No results'),
				message: t('This folder does not contain files that can be opened with FontoXML.')
			},
			loadingPreview: {
				title: t('Loading template preview…'),
				message: null
			},
			previewError: {
				title: t('Can’t open this template'),
				message: t('FontoXML can’t open this template. You can try again, or try a different template.')
			}
		},
		cancelButtonLabel: t('Cancel'),
		submitButtonLabel: t('Select')
	},
	openTab: {
		tabButtonLabel: t('Open from'),
		rootFolderLabel: t('My Drives'),
		states: {
			loading: {
				title: t('Loading documents…'),
				message: null
			},
			browseError: {
				title: t('Can’t open this folder'),
				message: t('FontoXML can’t open this folder. You can try again, or try a different folder.')
			},
			empty: {
				title: t('No results'),
				message: t('This folder does not contain files that can be opened with FontoXML.')
			},
			loadingPreview: {
				title: t('Loading document preview…'),
				message: null
			},
			previewError: {
				title: t('Can’t open this document'),
				message: t('FontoXML can’t open this document. You can try again, or try a different document.')
			}
		},
		submitButtonLabel: t('Open')
	}
});

class FxOpenOrCreateDocumentModalStack extends Component {
	constructor (props) {
		super(props);

		this.initialState = {
			isSelectFolderModalOpen: false,
			isSelectDocumentTemplateModalOpen: false,

			selectedFolder: null,
			selectedDocumentTemplate: null
		};

		this.state = { ...this.initialState };

		this.labels = getLabels();
	}

	render () {
		const { isSelectFolderModalOpen, isSelectDocumentTemplateModalOpen, selectedFolder, selectedDocumentTemplate } = this.state;

		return (
			<ModalStack>
				<FxOpenOrCreateDocumentModal
					dataProviderName={ reactToAngularModalBridge.operationData.openDocumentDataProviderName }
					title={ this.labels.modalTitle }
					createTabLabels={ this.labels.createTab }
					openTabLabels={ this.labels.openTab }
					onTabSwitch={ () => this.setState(this.initialState) }
					onModalSubmit={ (modalData) => reactToAngularModalBridge.onModalSubmit(modalData) }
					openSelectFolderBrowserModal={ () => this.setState({ isSelectFolderModalOpen: true }) }
					openSelectDocumentTemplateBrowserModal={ () => this.setState({ isSelectDocumentTemplateModalOpen: true }) }
					selectedFolder={ selectedFolder }
					selectedDocumentTemplate={ selectedDocumentTemplate }
				/>

				{ isSelectFolderModalOpen &&
					<FxSelectFolderBrowserModal
						dataProviderName={ reactToAngularModalBridge.operationData.selectFolderDataProviderName }
						labels={ this.labels.selectFolder }
						closeModal={ () =>
							this.setState({ isSelectFolderModalOpen: false, selectedFolder: null }) }
						onModalSubmit={ (selectedFolder) =>
							this.setState({ isSelectFolderModalOpen: false, selectedFolder }) }
					/>
				}

				{ isSelectDocumentTemplateModalOpen &&
					<FxSelectDocumentTemplateBrowserModal
						dataProviderName={ reactToAngularModalBridge.operationData.selectDocumentTemplateDataProviderName }
						labels={ this.labels.selectTemplate }
						closeModal={ () =>
							this.setState({ isSelectDocumentTemplateModalOpen: false, selectedDocumentTemplate: null }) }
						onDocumentTemplateSelect={ (selectedDocumentTemplate) => this.setState({ selectedDocumentTemplate }) }
						onModalSubmit={ (selectedDocumentTemplate) =>
							this.setState({ isSelectDocumentTemplateModalOpen: false, selectedDocumentTemplate }) }
						selectedDocumentTemplate={ selectedDocumentTemplate }
					/>
				}
			</ModalStack>
		);
	}
}

export default FxOpenOrCreateDocumentModalStack;
