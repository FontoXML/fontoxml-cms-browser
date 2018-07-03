import React, { Component } from 'react';

import dataProviders from './dataProviders';

export default function withModularBrowserCapabilities(initialViewMode = null) {
	return function wrapWithModularBrowserCapabilities(WrappedComponent) {
		return class ModularBrowser extends Component {
			dataProvider = dataProviders.get(this.props.data.dataProviderName);
			initialSelectedItem = {};
			isMountedInDOM = true;

			state = {
				// Errors that occurred when loading a item, for if the items are only loaded in the preview.
				cachedErrorByRemoteId: {},

				// The currently set contextNodeId, if any.
				currentBrowseContextNodeId: null,

				// Contains the items that the user can choose from
				hierarchyItems: [],

				// Contains the items that the user can choose from
				items: [],

				// The zero-based offset or index from which to return the next
				// "this.props.data.loadMoreLimit" amount of items. Eg. offset=0, limit=3 would
				// return the items indexed as item 0, 1 and 2. offset=3, limit=3 would return
				// item 3, 4 and 5.
				loadMoreOffset: 0,

				// the total number of items as reported by the CMS. Used with loadMoreOffset and
				// "this.props.data.loadMoreLimit" to determine the visibilty of the load more
				// button when a loadMoreLimit > 0 is set (otherwise it is never rendered).
				loadMoreTotalItems: null,

				// Contains information on the current/last known request
				// { type: fileLoad|search|browse|upload, ?query, ?error, ?resultCount }
				request: {},

				// The item that is previewed and would be submitted if the user continues
				selectedItem: null,

				//
				uploadedItems: [],

				// Contains information for the viewMode, for example list or grid
				viewMode: initialViewMode
			};

			isItemErrored = item => !!this.state.cachedErrorByRemoteId[item.id];

			loadMore = () => {
				const { hierarchyItems, currentBrowseContextNodeId } = this.state;
				const currentFolder = hierarchyItems[hierarchyItems.length - 1];

				// Refresh the items of the current folder (uses the new offset internally)
				this.refreshItems(
					currentBrowseContextNodeId,
					currentFolder,
					undefined,
					this.state.loadMoreOffset + this.props.data.loadMoreLimit
				);
			};

			handleItemIsErrored = (remoteId, error) => {
				if (this.isMountedInDOM) {
					const cachedErrorByRemoteId = this.state.cachedErrorByRemoteId;
					cachedErrorByRemoteId[remoteId] = error;
					this.setState({ cachedErrorByRemoteId });
				}
			};

			onItemIsLoaded = remoteId => {
				if (this.isMountedInDOM) {
					this.setState(({ cachedErrorByRemoteId }) => {
						if (!cachedErrorByRemoteId[remoteId]) {
							return null;
						}

						const updatedCachedErrorByRemoteId = { ...cachedErrorByRemoteId };
						delete updatedCachedErrorByRemoteId[remoteId];
						return {
							cachedErrorByRemoteId: updatedCachedErrorByRemoteId
						};
					});
				}
			};

			// Used by any component to change the currently selected item
			handleItemSelect = item => {
				const { determineAndHandleSubmitButtonDisabledState } = this.props;

				if (this.isMountedInDOM) {
					this.setState({
						selectedItem: item
					});

					if (determineAndHandleSubmitButtonDisabledState) {
						determineAndHandleSubmitButtonDisabledState(item);
					}

					if (item && item.type !== 'folder' && item.id !== this.initialSelectedItem.id) {
						// An other item (that is not a folder) was selected so the initialSelectedItem is no longer cached
						this.initialSelectedItem = {};
					}
				}
			};

			// Used to set the initialSelectedItem
			handleInitialSelectedItemIdChange = item => {
				if (this.isMountedInDOM) {
					this.initialSelectedItem = item;
				}
			};

			// Used to update the items with a browse callback
<<<<<<< HEAD
			refreshItems = (browseContextDocumentId, folderToLoad, noCache) => {
				const { determineAndHandleSubmitButtonDisabledState } = this.props;
=======
			refreshItems = (browseContextDocumentId, folderToLoad, noCache, loadMoreOffset = 0) => {
				const { determineAndHandleSubmitButtonDisabledState } = this.props.data;
>>>>>>> Initial implementation done. Tested only for images. TODO: check/fix other browse modals.
				if (this.isMountedInDOM) {
					const newState = { request: { type: 'browse', busy: true } };
					if (loadMoreOffset === 0) {
						newState.uploadedItems = [];
					}
					this.setState(newState);
				}

				return this.dataProvider
					.getFolderContents(
						browseContextDocumentId,
						folderToLoad,
						noCache,
						this.state.hierarchyItems,
						this.props.data.loadMoreLimit,
						loadMoreOffset
					)
					.then(
						result => {
							if (!this.isMountedInDOM) {
								return [];
							}

							// Because of jump in the tree with browse context document id,
							// the folder that is actually loaded could be different from the folderToLoad.
							let newSelectedItem =
								result.hierarchyItems[result.hierarchyItems.length - 1] ||
								folderToLoad;

							// If the rootFolder is the folder to load, the newSelectedItem is null
							newSelectedItem = newSelectedItem.id === null ? null : newSelectedItem;

							if (this.initialSelectedItem.id) {
								// If the initial selected item is in this folder, it should be selected
								const initialSelectedResultItem = result.items.find(
									item => item.id === this.initialSelectedItem.id
								);
								newSelectedItem = initialSelectedResultItem
									? { ...initialSelectedResultItem, ...this.initialSelectedItem }
									: newSelectedItem;
							}

							// Do not change the selected item in any way if it was already set
							// before the refresh and the results of this refresh should be appended
							if (this.state.selectedItem && loadMoreOffset !== null) {
								newSelectedItem = this.state.selectedItem;
							}

							let newItems = result.items;
							if (newItems.length > 0 && loadMoreOffset > 0) {
								newItems = newItems.filter(
									newItem =>
										!this.state.uploadedItems.some(
											uploadedItem => uploadedItem.id === newItem.id
										)
								);

								// If the last load more only returns items that were uploaded before,
								// browse again with a higher offset and try again.
								if (newItems.length === 0) {
									return this.refreshItems(
										browseContextDocumentId,
										folderToLoad,
										noCache,
										loadMoreOffset + this.props.data.loadMoreLimit
									);
								}
							}

							this.setState({
								currentBrowseContextNodeId: browseContextDocumentId,
								hierarchyItems: result.hierarchyItems,
								items:
									loadMoreOffset > 0
										? this.state.items.concat(newItems)
										: newItems,
								loadMoreOffset,
								loadMoreTotalItems: result.totalItemCount,
								request: {},
								selectedItem: newSelectedItem
							});

							if (determineAndHandleSubmitButtonDisabledState) {
								determineAndHandleSubmitButtonDisabledState(newSelectedItem);
							}

							return result.items;
						},
						error => {
							if (!this.isMountedInDOM || !error) {
								// Modal is already closed or the old request was cancelled, wait for the newer one.
								return;
							}

							this.setState({
								// reset the loadMoreOffset to the previous offset before this
								// request errored if it was intended as a load more (append)
								loadMoreOffset: loadMoreOffset > 0 ? this.state.loadMoreOffset : 0,
								request: { type: 'browse', error },
								selectedItem: null
							});

							if (determineAndHandleSubmitButtonDisabledState) {
								determineAndHandleSubmitButtonDisabledState(null);
							}
						}
					);
			};

			handleUploadFileSelect = (selectedFiles, uploadErrorMessages) => {
				const { hierarchyItems } = this.state;

				if (!this.isMountedInDOM) {
					return;
				}

				// TODO: support multiple
				if (
					selectedFiles[0].size > this.dataProvider.getUploadOptions().maxFileSizeInBytes
				) {
					this.setState({
						request: {
							type: 'upload',
							error: uploadErrorMessages.fileSizeTooLargeMessage
						}
					});
					return;
				}

				this.setState({
					request: {
						type: 'upload',
						busy: true
					}
				});

				const folderWithUploadedFile = hierarchyItems[hierarchyItems.length - 1];

				this.dataProvider.upload(folderWithUploadedFile.id, selectedFiles).then(
					uploadedItem => {
						this.setState(
							({ items, loadMoreTotalItems, uploadedItems }) => ({
								items: [uploadedItem, ...items],
								loadMoreTotalItems: loadMoreTotalItems + 1,
								request: {},
								uploadedItems: [...uploadedItems, uploadedItem]
							}),
							() => {
								this.handleItemSelect(
									// ensure the newly uploaded item is always selected
									this.state.items.find(item => item.id === uploadedItem.id) ||
										uploadedItem ||
										null
								);
							}
						);
					},
					error => {
						if (!this.isMountedInDOM || !error) {
							return;
						}

						this.setState({
							request: {
								type: 'upload',
								error: uploadErrorMessages.serverErrorMessage
							}
						});
					}
				);
			};

			// Used to update the viewMode
			handleViewModeChange = viewMode =>
				this.isMountedInDOM && this.setState({ viewMode: viewMode });

			render() {
				const {
					hierarchyItems,
					items,
					loadMoreTotalItems,
					request,
					selectedItem,
					viewMode
				} = this.state;

				const props = {
					...this.props,
					hierarchyItems,
					initialSelectedItem: this.initialSelectedItem,
					isItemErrored: this.isItemErrored,
					items,
					loadMore: this.props.data.loadMoreLimit > 0 ? this.loadMore : null,
					loadMoreCurrentItems: items.length,
					loadMoreTotalItems: loadMoreTotalItems,
					onItemIsErrored: this.handleItemIsErrored,
					onItemIsLoaded: this.onItemIsLoaded,
					onItemSelect: this.handleItemSelect,
					onInitialSelectedItemIdChange: this.handleInitialSelectedItemIdChange,
					onUploadFileSelect: this.handleUploadFileSelect,
					onViewModeChange: this.handleViewModeChange,
					refreshItems: this.refreshItems,
					request,
					selectedItem,
					viewMode
				};

				return <WrappedComponent {...props} />;
			}

			componentWillUnmount() {
				this.isMountedInDOM = false;
			}
		};
	};
}
