import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { merge, style } from 'glamor';

import {
	BreadcrumbItemLink,
	Breadcrumbs,
	ButtonGroup,
	Icon,
	Label,
	List,
	ListItem,
	Grid,
	GridItem,
	SpinnerIcon,
	Toast,
	SelectFileButton
} from 'fontoxml-vendor-fds/components';
import {
	block,
	border,
	borderBottom,
	color,
	flex,
	onlyResolveLastPromise,
	padding,
	truncatedBreadcrumbItemLinkWidth
} from 'fontoxml-vendor-fds/system';

import BrowserContent from './BrowserContent.jsx';
import BrowserContentPreview from './BrowserContentPreview.jsx';
import BrowserContentStateMessage from './BrowserContentStateMessage.jsx';
import BrowserToolbar from './BrowserToolbar.jsx';
import BrowserToolbarAlignRight from './BrowserToolbarAlignRight.jsx';

const styles = merge(
	flex('vertical'),
	border(color('border')),
	{ flex: 'auto' },
	// Prevents nested flex-box vs overflow-y auto issues in Firefox:
	// @see http://stackoverflow.com/questions/28636832/firefox-overflow-y-not-working-with-nested-flexbox
	{ minHeight: 0 }
);

/* eslint-disable no-unused-vars */
// TODO: use this if no hierarchy is returned by getFolderContents
function updateFolderHierarchy (folderHierarchy, newLastFolderInHierarchy) {
	const updatedFolderHierarchy = folderHierarchy.slice();
	const newLastFolderIsInCurrentFolderHierarchy = folderHierarchy.some(folder => folder === newLastFolderInHierarchy);
	if (!newLastFolderIsInCurrentFolderHierarchy) {
		updatedFolderHierarchy.push(newLastFolderInHierarchy);
		return updatedFolderHierarchy;
	}

	let foundNewLastFolderInHierarchy = false;
	while (!foundNewLastFolderInHierarchy) {
		const removedFolder = updatedFolderHierarchy.pop();
		foundNewLastFolderInHierarchy = removedFolder === newLastFolderInHierarchy;
	}

	updatedFolderHierarchy.push(newLastFolderInHierarchy);

	return updatedFolderHierarchy;
}
/* eslint-enable no-unused-vars */

class FileOrFolderBrowser extends Component {
	constructor (props) {
		super(props);

		this.isComponentMounted = false;

		this.viewModes = [
			{ name: 'list', icon: 'list' },
			{ name: 'grid', icon: 'th' }
		];

		this.state = {
			folderContents: [],
			folderHierarchy: [],

			selectedFileOrFolder: null,

			showLoadingMessage: false,
			folderBeingLoaded: null,
			lastLoadedFolder: null,

			isUploading: false,

			lastBrowseError: null,
			lastUploadErrorMessage: null
		};

		this.loadingMessageTimeout = null;

		this.getFolderData = onlyResolveLastPromise((folderToLoad, noCache) => {
			const { getFolderContents } = this.props;
			return getFolderContents(folderToLoad, noCache);
		});
	}

	componentDidMount () {
		this.isComponentMounted = true;
	}

	refreshData (folderToLoad, noCache) {
		this.setState({ folderBeingLoaded: folderToLoad, hasError: false });

		this.loadingMessageTimeout = setTimeout(() => this.setState({ showLoadingMessage: true }), 500);

		return this.getFolderData(folderToLoad, noCache).then(
			(result) => {
				if (!this.isComponentMounted) {
					return;
				}

				const { selectedFileOrFolder } = this.state;
				if (selectedFileOrFolder && selectedFileOrFolder.type !== 'folder' && this.props.selectedFileOrFolderId === null) {
					// The previous selected item cannot be present if its not a folder after loading a folder.
					this.props.onFileOrFolderSelect(null);
				}

				clearTimeout(this.loadingMessageTimeout);

				// Because we use a browse context document id, the folder that is actually loaded could be different from the folderToLoad.
				const actualLoadedFolder = result.metadata.hierarchy[result.metadata.hierarchy.length - 1] || folderToLoad;

				this.setState({
					folderContents: result.items,
					folderHierarchy: result.metadata.hierarchy,

					selectedFileOrFolder: result.items.find((fileOrFolder) => fileOrFolder.id === this.props.selectedFileOrFolderId),

					showLoadingMessage: false,
					folderBeingLoaded: null,
					lastLoadedFolder: actualLoadedFolder,

					lastBrowseError: null
				});

				this.props.onFileOrFolderSelect(actualLoadedFolder);
			},
			(error) => {
				if (!this.isComponentMounted || !error) {
					// The component is unmounted or the old request was cancelled, wait for the newer one.
					return;
				}

				clearTimeout(this.loadingMessageTimeout);

				this.setState({ showLoadingMessage: false, folderBeingLoaded: null, lastBrowseError: error });
				// Keep using the last good state (with previous folderContents, folderHierarchy, selectedFileOrFolder and lastLoadedFolder)
			});
	}

	handleRenderBreadcrumbItem = ({ key, isDisabled, isLastItem, item }) => (
		<BreadcrumbItemLink
			key={ key }
			label={ item.label }
			isDisabled={ isDisabled }
			isLastItem={ isLastItem }
			onClick={ () => {
				this.props.onFileOrFolderSelect(item);
				this.refreshData(item, true);
			} }
		/>
	);

	componentWillMount () {
		const { rootFolder, onFileOrFolderSelect } = this.props;
		onFileOrFolderSelect(rootFolder);

		this.refreshData(rootFolder);
	}

	render () {
		const {
			onFileOrFolderSelect, onFileOpen, onViewModeChange,

			renderEmptyMessage, renderBrowseErrorMessage, renderLoadingMessage, renderPreview,
			renderListItem, renderGridItem,

			showBreadcrumbs,

			uploadOptions,

			viewMode
		} = this.props;
		const {
			folderContents, folderHierarchy,

			selectedFileOrFolder,

			showLoadingMessage, folderBeingLoaded, lastLoadedFolder,

			isUploading,

			lastBrowseError, lastUploadErrorMessage
		} = this.state;

		const listOrGridProps = {
			items: folderContents,
			selectedItem: selectedFileOrFolder,
			onItemClick: (item) => {
				if (this.state.selectedFileOrFolder === item) {
					return;
				}

				this.setState({ selectedFileOrFolder: item });

				onFileOrFolderSelect(item);
			},
			onItemDoubleClick: (item) => item.type === 'folder' ? this.refreshData(item) : onFileOpen(item)
		};

		const previewForSelectedFileOrFolder = selectedFileOrFolder && renderPreview && renderPreview(selectedFileOrFolder);

		return (
			<fds-browser { ...styles }>
				<BrowserToolbar>
					{ showBreadcrumbs && folderHierarchy.length > 0 &&
						<Breadcrumbs
							isDisabled={ isUploading || folderBeingLoaded !== null }
							items={ folderHierarchy }
							renderBreadcrumbItem={ this.handleRenderBreadcrumbItem }
							truncatedItemWidth={truncatedBreadcrumbItemLinkWidth} />
					}

					<BrowserToolbarAlignRight>
						{ uploadOptions && (
							<SelectFileButton
								label={ uploadOptions.buttonLabel }
								isDisabled={ isUploading || lastLoadedFolder === null || lastLoadedFolder.id === null || folderBeingLoaded !== null }
								mimeTypesToAccept={ uploadOptions.mimeTypesToAccept }
								icon='upload'
								iconAfter={ isUploading ? 'spinner' : null }
								onSelect={ (selectedFiles) => {
									// TODO: support multiple
									if (selectedFiles[0].size > uploadOptions.maxFileSizeInBytes) {
										this.setState({ lastUploadErrorMessage: uploadOptions.fileSizeTooLargeMessage });
										return;
									}

									this.setState({ isUploading: true });

									const folderWithUploadedFile = { ...lastLoadedFolder };

									uploadOptions.upload(folderWithUploadedFile.id, selectedFiles)
										.then(
											(uploadedItem) => {
												if (!this.isComponentMounted) {
													// "cancel" this promise to prevent any subsequent then() blocks from being called.
													return Promise.reject();
												}

												this.setState({ lastUploadErrorMessage: null });

												return uploadedItem;
											},
											(_error) => {
												if (!this.isComponentMounted) {
													// "cancel" this promise to prevent any subsequent then() blocks from being called.
													return Promise.reject();
												}

												this.setState({
													isUploading: false,
													lastUploadErrorMessage: uploadOptions.serverErrorMessage
												});
											}
										)
										.then((uploadedItem) => {
											return this.refreshData(folderWithUploadedFile, true)
												.then(() => uploadedItem);
										})
										.then((uploadedItem) => {
											const { folderContents: refreshedFolderContents } = this.state;

											const refreshedSelectedFileOrFolder = refreshedFolderContents
												.find(item => item.id === uploadedItem.id);

											this.setState({
												isUploading: false,
												selectedFileOrFolder: refreshedSelectedFileOrFolder
											});
											onFileOrFolderSelect(refreshedSelectedFileOrFolder);
										})
										.catch((_error) => {
											this.setState({
												isUploading: false,
												lastUploadErrorMessage: uploadOptions.serverErrorMessage
											});
										});
								} } />
						) }

						<ButtonGroup
							items={ this.viewModes }
							selectedItem={ this.viewModes.find((viewModeItem) => viewModeItem.name === viewMode) }
							onItemClick={ (selectedItem) => {
								this.setState({ viewMode: selectedItem });

								onViewModeChange(selectedItem.name);
							} } />
					</BrowserToolbarAlignRight>
				</BrowserToolbar>

				{ !!lastUploadErrorMessage && (
					<fds-browser-error
						{ ...block }
						{ ...borderBottom(color('border')) }
						{ ...padding('m') }
						{ ...style({ backgroundColor: color('inlay-background') }) }>
						<Toast connotation='error' icon='exclamation-triangle' content={ lastUploadErrorMessage } />
					</fds-browser-error>
				) }

				<BrowserContent>
					{ folderBeingLoaded && (
						<BrowserContentStateMessage style={ { visibility: showLoadingMessage ? 'visible' : 'hidden' } }>
							{ renderLoadingMessage() }
						</BrowserContentStateMessage>
					) }

					{ !folderBeingLoaded && lastBrowseError && (
						<BrowserContentStateMessage>
							{ renderBrowseErrorMessage(lastBrowseError) }
						</BrowserContentStateMessage>
					) }

					{ !folderBeingLoaded && !lastBrowseError && folderContents.length === 0 && (
						<BrowserContentStateMessage>
							{ renderEmptyMessage() }
						</BrowserContentStateMessage>
					) }

					{ !folderBeingLoaded && !lastBrowseError && folderContents.length > 0 && viewMode === 'list' && (
						<List { ...listOrGridProps } renderItem={ renderListItem } />
					) }
					{ !folderBeingLoaded && !lastBrowseError && folderContents.length > 0 && viewMode === 'grid' && (
						<Grid { ...listOrGridProps } renderItem={ renderGridItem } />
					) }

					{ previewForSelectedFileOrFolder && (
						<BrowserContentPreview>
							{ previewForSelectedFileOrFolder }
						</BrowserContentPreview>
					) }
				</BrowserContent>
			</fds-browser>
		);
	}

	componentWillUnmount () {
		clearTimeout(this.loadingMessageTimeout);
		this.isComponentMounted = false;
	}
}

FileOrFolderBrowser.propTypes = {
	rootFolder: PropTypes.object.isRequired,

	// Should return a Promise when called
	getFolderContents: PropTypes.func.isRequired,
	upload: PropTypes.func,

	onFileOpen: PropTypes.func,
	onFileOrFolderSelect: PropTypes.func,

	onViewModeChange: PropTypes.func,

	renderEmptyMessage: PropTypes.func.isRequired,
	renderBrowseErrorMessage: PropTypes.func.isRequired,
	renderLoadingMessage: PropTypes.func,
	renderPreview: PropTypes.func.isRequired,
	renderListItem: PropTypes.func,
	renderGridItem: PropTypes.func,

	selectedFileOrFolderId: PropTypes.string,
	showBreadcrumbs: PropTypes.bool,

	uploadOptions: PropTypes.object,
	// TODO: specify these uploadOptions properties using PropTypes
		// fileSizeTooLargeMessage: PropTypes.string.isRequired,
		// maxFileSizeInBytes: PropTypes.number.isRequired,
		// mimeTypesToAccept: PropTypes.string.isRequired,
		// serverErrorMessage: PropTypes.string.isRequired,
		// buttonLabel: PropTypes.string.isRequired,
		// upload: PropTypes.func.isRequired, () => Promise.resolve(),

	viewModeName: PropTypes.string
};

FileOrFolderBrowser.defaultProps = {
	// These prevent null checks in the component.
	onFileOpen: () => {},
	onFileOrFolderSelect: () => {},
	onViewModeChange: () => {},
	renderLoadingMessage: () => (
		<SpinnerIcon align='center' />
	),
	renderListItem: ({ key, item, isSelected, isDisabled, isInvalid, onClick, onDoubleClick }) => (
		<ListItem key={ key } isSelected={ isSelected } isDisabled={ isDisabled } isInvalid={ isInvalid } onClick={ onClick } onDoubleClick={ onDoubleClick }>
			<Icon icon={ item.icon || 'file-text-o' } size='s' />
			<Label>{ item.label }</Label>
		</ListItem>
	),
	renderGridItem: ({ key, item, isSelected, isDisabled, isInvalid, onClick, onDoubleClick }) => (
		<GridItem key={ key } isSelected={ isSelected } isDisabled={ isDisabled } isInvalid={ isInvalid } onClick={ onClick } onDoubleClick={ onDoubleClick }>
			<Icon icon={ item.icon || 'folder-o' } size='m' align='center' />
			<Label align='center' isFullWidth>{ item.label }</Label>
		</GridItem>
	),
	selectedFileOrFolderId: null,
	showBreadcrumbs: false,
	viewMode: 'list'
};

export default FileOrFolderBrowser;
