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

				// Paging option; The zero-based offset from on which to get results.
				offset: 0,

				// Contains information on the current/last known request
				// { type: fileLoad|search|browse|upload, ?query, ?error, ?resultCount }
				request: {},

				// The item that is previewed and would be submitted if the user continues
				selectedItem: null,

				// the total number of items available on the CMS
				totalItemCount: null,

				// Contains information for the viewMode, for example list or grid
				viewMode: initialViewMode
			};

			isItemErrored = item => !!this.state.cachedErrorByRemoteId[item.id];

			onItemIsErrored = (remoteId, error) => {
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
			onItemSelect = item => {
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
			onInitialSelectedItemIdChange = item => {
				if (this.isMountedInDOM) {
					this.initialSelectedItem = item;
				}
			};

			onPageBackward = () => {
				const { offset, items } = this.state;

				const nextOffset = this.state.offset - items.length;

				this.setState({
					offset: nextOffset > 0 ? nextOffset : 0,
				});
			};

			onPageForward = () => {
				const { offset, items } = this.state;

				this.setState({
					offset: offset + items.length,
				});
			};

			// Used to update the items with a browse callback
			refreshItems = (browseContextDocumentId, folderToLoad, noCache) => {
				const { determineAndHandleSubmitButtonDisabledState } = this.props;
				if (this.isMountedInDOM) {
					this.setState({ request: { type: 'browse', busy: true } });
				}

				return this.dataProvider
					.getFolderContents(
						browseContextDocumentId,
						folderToLoad,
						noCache,
						this.state.hierarchyItems,
						this.state.offset
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

							this.setState({
								currentBrowseContextNodeId: browseContextDocumentId,
								selectedItem: newSelectedItem,
								items: result.items,
								totalItemCount: result.totalItemCount,
								hierarchyItems: result.hierarchyItems,
								request: {}
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
								selectedItem: null,
								request: { type: 'browse', error: error }
							});

							if (determineAndHandleSubmitButtonDisabledState) {
								determineAndHandleSubmitButtonDisabledState(null);
							}
						}
					);
			};

			onUploadFileSelect = (browseContextDocumentId, selectedFiles, uploadErrorMessages) => {
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
						return this.refreshItems(
							browseContextDocumentId,
							folderWithUploadedFile,
							true
						).then(items => {
							this.onItemSelect(
								// ensure the newly uploaded item is always selected
								items.find(item => item.id === uploadedItem.id) || uploadedItem || null
							);
						});
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
			onViewModeChange = viewMode =>
				this.isMountedInDOM && this.setState({ viewMode: viewMode });

			render() {
				const {
					hierarchyItems,
					items,
					offset,
					request,
					selectedItem,
					totalItemCount,
					viewMode
				} = this.state;

				const props = {
					...this.props,
					hierarchyItems,
					initialSelectedItem: this.initialSelectedItem,
					isItemErrored: this.isItemErrored,
					items,
					onItemIsErrored: this.onItemIsErrored,
					onItemIsLoaded: this.onItemIsLoaded,
					onItemSelect: this.onItemSelect,
					onInitialSelectedItemIdChange: this.onInitialSelectedItemIdChange,
					onPageForward: offset + items.length < totalItemCount ? this.onPageForward : undefined,
					onPageBackward: offset > 0 ? this.onPageBackward : undefined,
					onUploadFileSelect: this.onUploadFileSelect,
					onViewModeChange: this.onViewModeChange,
					refreshItems: this.refreshItems,
					request,
					selectedItem,
					viewMode
				};

				return <WrappedComponent {...props} />;
			}

			componentDidUpdate(prevProps, prevState) {
				if (prevState.offset != this.state.offset) {
					// perform paging

					const { hierarchyItems, currentBrowseContextNodeId } = this.state;

					const currentFolder = hierarchyItems[hierarchyItems.length - 1];

					this.refreshItems(currentBrowseContextNodeId, currentFolder);
				}
			}

			componentWillUnmount() {
				this.isMountedInDOM = false;
			}
		};
	};
}
