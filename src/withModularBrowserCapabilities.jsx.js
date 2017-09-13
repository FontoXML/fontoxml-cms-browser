import React, { Component } from 'react';

import dataProviders from './dataProviders';

export default function withModularBrowserCapabilities(
	WrappedComponent,
	Loader = null,
	initialViewMode = null
) {
	return class ModularBrowser extends Component {
		dataProvider = dataProviders.get(this.props.data.dataProviderName);
		initialSelectedItemId = null;
		isMountedInDOM = false;

		loader = Loader && new Loader();

		state = {
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
			viewMode: initialViewMode
		};

		isItemErrored = item => this.loader && this.loader.isItemErrored(item.id);

		// Used by any component to change the currently selected item
		onItemSelect = item => {
			if (this.isMountedInDOM) {
				this.setState({ selectedItem: item });

				if (item && item.id !== this.initialSelectedItemId && item.type !== 'folder') {
					// An other item (that is not a folder) was selected so the initialSelectedItemId is no longer cached
					this.initialSelectedItemId = null;
				}
			}
		};

		// Used to set the initialSelectedItemId
		onInitialSelectedItemIdChange = itemId => {
			if (this.isMountedInDOM) {
				this.initialSelectedItemId = itemId;
			}
		};

		// Used to update the items with a browse callback
		refreshItems = (browseContextDocumentId, folderToLoad, noCache) => {
			this.isMountedInDOM && this.setState({ request: { type: 'browse', busy: true } });

			return this.dataProvider
				.getFolderContents(browseContextDocumentId, folderToLoad, {
					hierarchyItems: this.state.hierarchyItems,
					noCache
				})
				.then(
					result => {
						if (!this.isMountedInDOM) {
							return;
						}
						// Because of jump in the tree with browse context document id,
						// the folder that is actually loaded could be different from the folderToLoad.
						let newSelectedItem =
							result.hierarchyItems[result.hierarchyItems.length - 1] || folderToLoad;

						// If the rootFolder is the folder to load, the newSelectedItem is null
						newSelectedItem = newSelectedItem.id === null ? null : newSelectedItem;

						if (this.initialSelectedItemId) {
							// If the initial selected item is in this folder, it should be selected
							newSelectedItem =
								result.items.find(item => item.id === this.initialSelectedItemId) ||
								null;
						}

						this.setState({
							selectedItem: newSelectedItem,
							items: result.items,
							hierarchyItems: result.hierarchyItems,
							request: {}
						});

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
					}
				);
		};

		onUploadFileSelect = (browseContextDocumentId, selectedFiles, uploadErrorMessages) => {
			const { hierarchyItems } = this.state;

			if (!this.isMountedInDOM) {
				return;
			}

			// TODO: support multiple
			if (selectedFiles[0].size > this.dataProvider.getUploadOptions().maxFileSizeInBytes) {
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
					).then((items = []) => {
						this.onItemSelect(items.find(item => item.id === uploadedItem.id) || null);
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
		onViewModeChange = viewMode => this.isMountedInDOM && this.setState({ viewMode: viewMode });

		render() {
			const props = {
				...this.props,
				hierarchyItems: this.state.hierarchyItems,
				initialSelectedItemId: this.initialSelectedItemId,
				isItemErrored: this.isItemErrored,
				items: this.state.items,
				loadItem: this.loader ? this.loader.load : () => {},
				onItemSelect: this.onItemSelect,
				onInitialSelectedItemIdChange: this.onInitialSelectedItemIdChange,
				onUploadFileSelect: this.onUploadFileSelect,
				onViewModeChange: this.onViewModeChange,
				refreshItems: this.refreshItems,
				request: this.state.request,
				selectedItem: this.state.selectedItem,
				viewMode: this.state.viewMode
			};

			return <WrappedComponent {...props} />;
		}

		// TODO: shouldn't this be componentDidMount() ?
		// Yes it should. but than you can't guarantee that isMountedInDOM is true. Before ComponentDidMount in the modal is used
		componentWillMount() {
			this.isMountedInDOM = true;
		}

		componentWillUnmount() {
			this.isMountedInDOM = false;
		}
	};
}
