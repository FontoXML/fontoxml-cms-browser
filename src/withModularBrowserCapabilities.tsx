import type { ComponentType } from 'react';
import { Component } from 'react';

import type { ModalProps } from 'fontoxml-fx/src/types';

import dataProviders from './dataProviders';

function isValidMimeType(selectedMimeType, mimeTypeGlob) {
	if (mimeTypeGlob === 'image/*') {
		return selectedMimeType.startsWith('image/');
	}
	// TODO: Do full mimetype checking: parse this glob and actually test
	// Not doing that right now because the only way to select something wrong is by consciously selecting rubbish in an upload modal.
	return true;
}

type Props = ModalProps<{ dataProviderName: string }>;

export default function withModularBrowserCapabilities(
	initialViewMode: string | null = null
) {
	return function wrapWithModularBrowserCapabilities(
		WrappedComponent: ComponentType
	): ComponentType {
		return class ModularBrowser extends Component<Props> {
			private readonly dataProvider = dataProviders.get(
				this.props.data.dataProviderName
			);

			private initialSelectedItem = {};

			private isMountedInDOM = true;

			public override state = {
				// Errors that occured when loading a item, for if the items are only loaded in the preview.
				cachedErrorByRemoteId: {},

				// Contains the items that the user can choose from
				hierarchyItems: [],

				// Contains the items that the user can choose from
				items: [],

				// Contains information on the current/last known request
				// { type: fileLoad|search|browse|upload, ?query, ?error, ?resultCount }
				request: {},

				// The item that is previewed and would be submitted if the user continues
				selectedItem: null,

				// Contains information for the viewMode, for example list or grid
				viewMode: initialViewMode,
			};

			private readonly isItemErrored = (item) =>
				!!this.state.cachedErrorByRemoteId[item.id];

			private readonly onItemIsErrored = (remoteId, error) => {
				if (this.isMountedInDOM) {
					const cachedErrorByRemoteId =
						this.state.cachedErrorByRemoteId;
					cachedErrorByRemoteId[remoteId] = error;
					this.setState({ cachedErrorByRemoteId });
				}
			};

			private readonly onItemIsLoaded = (remoteId) => {
				if (this.isMountedInDOM) {
					this.setState(({ cachedErrorByRemoteId }) => {
						if (!cachedErrorByRemoteId[remoteId]) {
							return null;
						}

						const updatedCachedErrorByRemoteId = {
							...cachedErrorByRemoteId,
						};
						delete updatedCachedErrorByRemoteId[remoteId];
						return {
							cachedErrorByRemoteId: updatedCachedErrorByRemoteId,
						};
					});
				}
			};

			// Used by any component to change the currently selected item
			private readonly onItemSelect = (newSelectedItem) => {
				const { determineAndHandleSubmitButtonDisabledState } =
					this.props;

				if (this.isMountedInDOM) {
					this.setState({
						selectedItem: newSelectedItem,
					});

					if (determineAndHandleSubmitButtonDisabledState) {
						determineAndHandleSubmitButtonDisabledState(
							newSelectedItem
						);
					}

					if (
						newSelectedItem &&
						newSelectedItem.type !== 'folder' &&
						newSelectedItem.id !== this.initialSelectedItem.id
					) {
						// An other item (that is not a folder) was selected so the initialSelectedItem is no longer cached
						this.initialSelectedItem = {};
					}
				}
			};

			// Used to set the initialSelectedItem
			private readonly onInitialSelectedItemIdChange = (item) => {
				if (this.isMountedInDOM) {
					this.initialSelectedItem = item;
				}
			};

			// Used to update the items with a browse callback
			private readonly refreshItems = (
				browseContextDocumentId,
				folderToLoad,
				noCache,
				hierarchyItems = this.state.hierarchyItems
			) => {
				const { determineAndHandleSubmitButtonDisabledState, data } =
					this.props;
				if (this.isMountedInDOM) {
					this.setState({ request: { type: 'browse', busy: true } });
				}

				return this.dataProvider
					.getFolderContents(
						browseContextDocumentId,
						folderToLoad,
						noCache,
						hierarchyItems,
						data.query
					)
					.then(
						(result) => {
							if (!this.isMountedInDOM) {
								return [];
							}
							// Because of jump in the tree with browse context document id,
							// the folder that is actually loaded could be different from the folderToLoad.
							let newSelectedItem =
								result.hierarchyItems[
									result.hierarchyItems.length - 1
								] || folderToLoad;

							// If the rootFolder is the folder to load, the newSelectedItem is null
							newSelectedItem =
								newSelectedItem.id === null
									? null
									: newSelectedItem;

							if (this.initialSelectedItem.id) {
								// If the initial selected item is in this folder, it should be selected
								const initialSelectedResultItem =
									result.items.find(
										(item) =>
											item.id ===
											this.initialSelectedItem.id
									);
								newSelectedItem = initialSelectedResultItem
									? {
											...initialSelectedResultItem,
											...this.initialSelectedItem,
									  }
									: newSelectedItem;
							}

							this.setState({
								selectedItem: newSelectedItem,
								items: result.items,
								hierarchyItems: result.hierarchyItems,
								request: {},
							});

							if (determineAndHandleSubmitButtonDisabledState) {
								determineAndHandleSubmitButtonDisabledState(
									newSelectedItem
								);
							}

							return result.items;
						},
						(error) => {
							if (!this.isMountedInDOM || !error) {
								// Modal is already closed or the old request was cancelled, wait for the newer one.
								return;
							}

							if (error.status === 404) {
								this.refreshItems(
									browseContextDocumentId,
									this.dataProvider.getRootHierarchyItem(),
									false,
									[]
								);
								return;
							}

							this.setState({
								hierarchyItems: [
									this.dataProvider.getRootHierarchyItem(),
								],
								selectedItem: null,
								request: { type: 'browse', error },
							});

							if (determineAndHandleSubmitButtonDisabledState) {
								determineAndHandleSubmitButtonDisabledState(
									null
								);
							}
						}
					);
			};

			private readonly onUploadFileSelect = (
				browseContextDocumentId,
				selectedFiles,
				uploadErrorMessages
			) => {
				const { hierarchyItems } = this.state;

				if (!this.isMountedInDOM) {
					return;
				}

				// TODO: support multiple
				if (
					selectedFiles[0].size >
					this.dataProvider.getUploadOptions().maxFileSizeInBytes
				) {
					this.setState({
						request: {
							type: 'upload',
							error: uploadErrorMessages.fileSizeTooLargeMessage,
						},
					});
					return;
				}

				const selectedMimeType = selectedFiles[0].type;
				// Note: this is a glob. It can be 'image/*'
				const acceptableMimeType =
					this.dataProvider.getUploadOptions().mimeTypesToAccept;

				if (!isValidMimeType(selectedMimeType, acceptableMimeType)) {
					this.setState({
						request: {
							type: 'upload',
							error: uploadErrorMessages.invalidFileTypeMessage,
						},
					});
					return;
				}

				this.setState({
					request: {
						type: 'upload',
						busy: true,
					},
				});

				const folderWithUploadedFile =
					hierarchyItems[hierarchyItems.length - 1];

				this.dataProvider
					.upload(folderWithUploadedFile.id, selectedFiles)
					.then(
						(uploadedItem) => {
							return this.refreshItems(
								browseContextDocumentId,
								folderWithUploadedFile,
								true
							).then((_items) => {
								this.onItemSelect(uploadedItem);
							});
						},
						(error) => {
							if (!this.isMountedInDOM || !error) {
								return;
							}

							this.setState({
								request: {
									type: 'upload',
									error: uploadErrorMessages.serverErrorMessage,
								},
							});
						}
					);
			};

			// Used to update the viewMode
			private readonly onViewModeChange = (viewMode) => {
				if (this.isMountedInDOM) {
					this.setState({ viewMode });
				}
			};

			public override render() {
				const {
					hierarchyItems,
					items,
					request,
					selectedItem,
					viewMode,
				} = this.state;

				const props = {
					...this.props,
					hierarchyItems,
					initialSelectedItem: this.initialSelectedItem,
					isItemErrored: this.isItemErrored,
					items,
					lastOpenedState: this.dataProvider.getLastOpenedState(),
					onItemIsErrored: this.onItemIsErrored,
					onItemIsLoaded: this.onItemIsLoaded,
					onItemSelect: this.onItemSelect,
					onInitialSelectedItemIdChange:
						this.onInitialSelectedItemIdChange,
					onUploadFileSelect: this.onUploadFileSelect,
					onViewModeChange: this.onViewModeChange,
					refreshItems: this.refreshItems,
					request,
					selectedItem,
					viewMode,
				};

				return <WrappedComponent {...props} />;
			}

			public override componentWillUnmount() {
				this.isMountedInDOM = false;

				this.dataProvider.storeLastOpenedState(
					this.state.hierarchyItems,
					this.state.selectedItem
				);
			}
		};
	};
}
