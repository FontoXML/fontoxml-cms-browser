import React, { Component } from 'react';

import dataProviders from './dataProviders';

export default function withModularBrowserCapabilities(initialViewMode = null) {
	return function wrapWithModularBrowserCapabilities(WrappedComponent) {
		return class ModularBrowser extends Component {
			dataProvider = dataProviders.get(this.props.data.dataProviderName);
			initialSelectedItem = {};
			isMountedInDOM = true;

			state = {
				// Errors that occured when loading a item, for if the items are only loaded in the preview.
				cachedErrorByRemoteId: {},

				// Contains the items that the user can choose from
				hierarchyItems: [],

				// Contains the items that the user can choose from
				items: [],

				// Contains information on the current/last known request
				// { type: fileLoad|search|browse|upload, ?query, ?error, ?resultCount }
				request: {},

				// Contains the parameters as set by search
				searchParameters: null,

				// The item that is previewed and would be submitted if the user continues
				selectedItem: null,

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

			// Used to update the items with a browse callback
			refreshItems = (browseContextDocumentId, folderToLoad, noCache) => {
				const { determineAndHandleSubmitButtonDisabledState } = this.props;
				if (this.isMountedInDOM) {
					this.setState({
						request: { type: 'browse', busy: true },
						searchParameters: null
					});
				}

				return this.dataProvider
					.getFolderContents(
						browseContextDocumentId,
						folderToLoad,
						noCache,
						this.state.hierarchyItems
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
								selectedItem: newSelectedItem,
								items: result.items,
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
								items: [],
								request: { type: 'browse', error: error },
								selectedItem: null
							});

							if (determineAndHandleSubmitButtonDisabledState) {
								determineAndHandleSubmitButtonDisabledState(null);
							}
						}
					);
			};

			onSearchRequest = (browseContextDocumentId, searchParameters) => {
				const { determineAndHandleSubmitButtonDisabledState } = this.props;
				if (this.isMountedInDOM) {
					this.setState({
						request: { type: 'search', busy: true },
						searchParameters: searchParameters || null
					});
				}

				return this.dataProvider
					.getFolderContents(
						browseContextDocumentId,
						{ id: null },
						true,
						[],
						searchParameters
					)
					.then(
						result => {
							if (!this.isMountedInDOM) {
								return [];
							}

							let newSelectedItem = null;

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
								hierarchyItems: result.hierarchyItems,
								items: result.items,
								request: {},
								selectedItem: newSelectedItem
							});

							if (determineAndHandleSubmitButtonDisabledState) {
								determineAndHandleSubmitButtonDisabledState(null);
							}
						},
						error => {
							if (!this.isMountedInDOM || !error) {
								// Modal is already closed or the old request was cancelled, wait for the newer one.
								return;
							}

							this.setState({
								items: [],
								request: { type: 'search', error: error },
								selectedItem: null
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
								items.find(item => item.id === uploadedItem.id) || null
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
					request,
					searchParameters,
					selectedItem,
					viewMode
				} = this.state;

				const props = {
					...this.props,
					hierarchyItems,
					initialSelectedItem: this.initialSelectedItem,
					isItemErrored: this.isItemErrored,
					items,
					onItemIsErrored: this.onItemIsErrored,
					onItemSelect: this.onItemSelect,
					onInitialSelectedItemIdChange: this.onInitialSelectedItemIdChange,
					onSearchRequest: this.onSearchRequest,
					onUploadFileSelect: this.onUploadFileSelect,
					onViewModeChange: this.onViewModeChange,
					refreshItems: this.refreshItems,
					request,
					searchParameters,
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
