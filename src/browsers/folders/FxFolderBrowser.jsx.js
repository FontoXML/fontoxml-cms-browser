import React, { Component, PropTypes } from 'react';

import { SpinnerIcon, StateMessage, TextLink } from 'fontoxml-vendor-fds/components';

import FileOrFolderBrowser from '../../browsers/file-or-folders/FileOrFolderBrowser.jsx';
import dataProviders from '../../data-providers/dataProviders';

class FxFolderBrowser extends Component {
	constructor (props) {
		super(props);

		this.state = { viewMode: 'list' };
	}

	render () {
		const { browseContextDocumentId, onFolderSelect, labels, dataProviderName } = this.props;
		const { viewMode } = this.state;

		const rootFolder = { label: labels.rootFolderLabel, type: 'folder', id: null };

		const dataProvider = dataProviders.get(dataProviderName);

		return (
			<FileOrFolderBrowser
				rootFolder={ rootFolder }
				getFolderContents={ (folder, noCache) => (
					dataProvider.getFolderContents(browseContextDocumentId, rootFolder, folder.id, noCache)
				) }
				onFileOrFolderSelect={ onFolderSelect }
				onViewModeChange={ (viewMode) => this.setState({ viewMode }) }
				renderLoadingMessage={ () => (
					<StateMessage visual={ <SpinnerIcon align='center' /> } { ...labels.states.loading } />
				) }
				renderBrowseErrorMessage={ () => (
					<StateMessage connotation='warning' visual='exclamation-triangle' { ...labels.states.browseError } />
				) }
				renderEmptyMessage={ () => <StateMessage visual='folder-open-o' { ...labels.states.empty } /> }
				renderGoToFolderLink={ (folder) => {
					return folder.externalUrl ?
						<TextLink icon='external-link' onClick={ () => window.open(folder.externalUrl) } /> :
						null;
				} }
				renderPreview={ () => null }
				showBreadcrumbs
				viewMode={ viewMode }
			/>
		);
	}
}

FxFolderBrowser.propTypes = {
	onFolderSelect: PropTypes.func.isRequired,
	browseContextDocumentId: PropTypes.string
};

FxFolderBrowser.defaultProps = {
	browseContextDocumentId: null
};

export default FxFolderBrowser;
