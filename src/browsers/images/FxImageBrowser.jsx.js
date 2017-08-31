import PropTypes from 'prop-types';
import React, { Component } from 'react';

import {
	ContainedImage,
	Flex,
	GridItem,
	Icon,
	Label,
	ListItem,
	SpinnerIcon,
	StateMessage,
	TextLink
} from 'fontoxml-vendor-fds/components';

import FileOrFolderBrowser from '../../browsers/file-or-folders/FileOrFolderBrowser.jsx';
import dataProviders from '../../dataProviders';
import FxImageLoader from '../../loaders/images/FxImageLoader.jsx';
import FxImagePreview from '../../previews/images/FxImagePreview.jsx';

class FxImageBrowser extends Component {
	constructor (props) {
		super(props);

		this.state = { viewMode: 'grid' };

		// Not in state, this component's render method does not directly depend on it.
		this.cachedImageDataByRemoteImageId = {};
		this.cachedErrorByRemoteImageId = {};
	}

	render () {
		const { dataProviderName, browseContextDocumentId, onImageSelect, onImageOpen, selectedImageId, labels } = this.props;
		const { viewMode } = this.state;

		const rootFolder = { label: labels.rootFolderLabel, type: 'folder', id: null };

		const dataProvider = dataProviders.get(dataProviderName);
		const uploadOptions = dataProvider.getUploadOptions();

		return (
			<FileOrFolderBrowser
				rootFolder={ rootFolder }
				getFolderContents={ (folder, noCache) => (
					dataProvider.getFolderContents(browseContextDocumentId, rootFolder, folder.id, noCache)
				) }
				onFileOpen={ (file) => onImageOpen(file.id) }
				onFileOrFolderSelect={ (fileOrFolder) => {
					if (fileOrFolder === rootFolder && selectedImageId) {
						onImageSelect(selectedImageId);
					}
					else if (fileOrFolder && fileOrFolder.type !== 'folder' && fileOrFolder.id !== selectedImageId) {
						onImageSelect(fileOrFolder.id);
					}
					else {
						onImageSelect(null);
					}
				} }
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
				renderListItem={ ({ key, item, isSelected, isDisabled, onClick, onDoubleClick }) => {
					if (item.type === 'folder') {
						return (
							<ListItem key={ key } isSelected={ isSelected } isDisabled={ isDisabled } onClick={ onClick } onDoubleClick={ onDoubleClick }>
								<Icon icon={ item.icon || 'folder-o' } size='s' />
								<Label>{ item.label }</Label>
							</ListItem>
						);
					}

					return (
						<FxImageLoader
							key={ key }
							cache={ this.cachedImageDataByRemoteImageId }
							renderLoadingMessage={ () => (
								<ListItem isSelected={ isSelected } isDisabled={ isDisabled } onClick={ onClick }>
									<Icon icon={ item.icon || 'file-image-o' } size='s' />
									<Label>{ item.label }</Label>
								</ListItem>
							) }
							remoteImageId={ item.id }>
							{ (imageData, error) => {
								if (error) {
									return (
										<ListItem isSelected={ isSelected } onClick={ onClick }>
											<Icon icon={ item.icon || 'file-image-o' } colorName='icon-s-error-color' size='s' />
											<Label colorName='text-muted-color'>{ item.label }</Label>
										</ListItem>
									);
								}

								return (
									<ListItem isSelected={ isSelected } isDisabled={ isDisabled } onClick={ onClick } onDoubleClick={ onDoubleClick }>
										<Flex applyCss={{ width: '.875rem', height: '.875rem' }}>
											<ContainedImage src={ imageData.dataUrl } />
										</Flex>
										<Label>{ item.label }</Label>
									</ListItem>
								);
							} }
						</FxImageLoader>
					);
				} }
				renderGridItem={ ({ key, item, isSelected, isDisabled, onClick, onDoubleClick }) => {
					if (item.type === 'folder') {
						return (
							<GridItem key={ key } isSelected={ isSelected } isDisabled={ isDisabled } onClick={ onClick } onDoubleClick={ onDoubleClick }>
								<Icon icon={ item.icon || 'folder-o' } size='m' align='center' />
								<Label align='center' isFullWidth>{ item.label }</Label>
							</GridItem>
						);
					}

					return (
						<FxImageLoader
							key={ key }
							cache={ this.cachedImageDataByRemoteImageId }
							renderLoadingMessage={ () => (
								<GridItem isSelected={ isSelected } isDisabled={ isDisabled } onClick={ onClick }>
									<Icon icon={ item.icon || 'file-image-o' } size='m' align='center' />
									<Label align='center' isFullWidth>{ item.label }</Label>
								</GridItem>
							) }
							remoteImageId={ item.id }>
							{ (imageData, error) => {
								if (error) {
									return (
										<GridItem isSelected={ isSelected } onClick={ onClick }>
											<Icon icon={ item.icon || 'file-image-o' } colorName='icon-m-error-color' size='m' align='center' />
											<Label align='center' colorName='text-muted-color' isFullWidth>{ item.label }</Label>
										</GridItem>
									);
								}

								return (
									<GridItem isSelected={ isSelected } isDisabled={ isDisabled } onClick={ onClick } onDoubleClick={ onDoubleClick }>
										<Flex alignItems="center" applyCss={{ height: '3rem' }} justifyContent="center">
											<ContainedImage src={ imageData.dataUrl } />
										</Flex>
										<Label align='center' isFullWidth>{ item.label }</Label>
									</GridItem>
								);
							} }
						</FxImageLoader>
					);
				} }
				renderPreview={ (selectedFileOrFolder) => {
					if (selectedFileOrFolder.type === 'folder') {
						return null;
					}

					return (
						<FxImageLoader
							cache={ this.cachedImageDataByRemoteImageId }
							onError={ () => onImageSelect(null) }
							onLoadComplete={ () => onImageSelect(selectedFileOrFolder.id) }
							renderLoadingMessage={ () => (
								<StateMessage
									visual={ <SpinnerIcon align='center' /> }
									paddingSize='l'
									{ ...labels.states.loadingPreview }
								/>
							) }
							remoteImageId={ selectedFileOrFolder.id }>
							{ (imageData, error) => {
								if (error) {
									return (
										<StateMessage
											connotation='warning'
											visual='exclamation-triangle'
											paddingSize='l'
											{ ...labels.states.previewError }
										/>
									);
								}

								return (
									<FxImagePreview
										heading={ selectedFileOrFolder.label }
										dataUrl={ imageData.dataUrl }
										properties={ selectedFileOrFolder.metadata ?
											selectedFileOrFolder.metadata.properties || {} :
											{} }
									/>
								);
							} }
						</FxImageLoader>
					);
				} }
				selectedFileOrFolderId={ selectedImageId }
				showBreadcrumbs
				uploadOptions={ {
					upload: dataProvider.upload,

					mimeTypesToAccept: uploadOptions.mimeTypesToAccept,
					maxFileSizeInBytes: uploadOptions.maxFileSizeInBytes,

					buttonLabel: labels.upload.buttonLabel,
					fileSizeTooLargeMessage: labels.upload.fileSizeTooLargeMessage,
					serverErrorMessage: labels.upload.serverErrorMessage
				} }
				viewMode={ viewMode }
			/>
		);
	}
}

FxImageBrowser.propTypes = {
	onImageOpen: PropTypes.func.isRequired,
	onImageSelect: PropTypes.func.isRequired,
	browseContextDocumentId: PropTypes.string,
	selectedImageId: PropTypes.string
};

FxImageBrowser.defaultProps = {
	browseContextDocumentId: null,
	selectedImageId: null
};

export default FxImageBrowser;
