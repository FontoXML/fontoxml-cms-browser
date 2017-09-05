import React, { Component } from 'react';

import configuredAssetConnector from 'fontoxml-configuration/get!asset-connector';
import documentsManager from 'fontoxml-documents/documentsManager';
import getImageDataFromUrl from 'fontoxml-image-resolver/getImageDataFromUrl';
import selectionManager from 'fontoxml-selection/selectionManager';

export default function withModularBrowserCapabilities(WrappedComponent, initialViewMode = null) {
	return class ModularBrowser extends Component {
		initialSelectedFileId = null;
		isComponentMounted = false;

		state = {
			// Contains information on the current/last known request
			// { type: initial|search|browse|upload, ?query, ?error, ?resultCount }
			request: {},

			// Contains the items that the user can choose from
			breadcrumbItems: [],

			// Contains the items that the user can choose from
			items: [],

			// The item that is previewed and would be submitted if the user continues
			selectedItem: null,

			// Contains information for the viewMode, for example list or grid
			viewMode: initialViewMode,

			// Contains the already loaded files
			cachedFilesByRemoteId: {},

			// Contains the files which failed to load
			cachedErrorsByRemoteId: {}
		};

		addCachedFileByRemoteId = (id, file) => {
			const map = this.state.cachedFilesByRemoteId;
			map[id] = file;
			this.setState({ cachedFileByRemoteId: map });
		};

		addCachedErrorByRemoteId = (id, error) => {
			const map = this.state.cachedErrorsByRemoteId;
			map[id] = error;
			this.setState({ cachedErrorByRemoteId: map });
		};

		deleteCachedFileByRemoteId = id => {
			const map = this.state.cachedFilesByRemoteId;
			delete map[id];
			this.setState({ cachedFileByRemoteId: map });
		};

		deleteCachedErrorByRemoteId = id => {
			const map = this.state.cachedErrorsByRemoteId;
			delete map[id];
			this.setState({ cachedErrorByRemoteId: map });
		};

		// Used by any component to change the currently selected item
		onItemSelect = item => {
			if (this.isComponentMounted) {
				this.setState({
					selectedItem: item
				});
			}
		};

		onUpdateInitialSelectedFileId = fileId => {
			if (this.isComponentMounted) {
				this.initialSelectedFileId = fileId;
			}
		};

		// Used by components that changes the visible items
		onUpdateItems = (items, breadcrumbItems, request = this.state.request) => {
			if (this.isComponentMounted) {
				this.setState({
					breadcrumbItems: breadcrumbItems,
					items: items,
					request: request
				});
			}
		};

		// Used by any component that initiates a request
		onUpdateRequest = request => {
			if (this.isComponentMounted) {
				this.setState({
					request: request
				});
			}
		};

		// Used to update the viewMode
		onUpdateViewMode = viewMode => {
			if (this.isComponentMounted) {
				this.setState({
					viewMode: viewMode
				});
			}
		};

		loadImage = (remoteImageId, onImageisFinishedLoading) => {
			const documentFile = documentsManager.getDocumentFile(
				selectionManager.focusedDocumentId
			);
			return configuredAssetConnector
				.getPreviewUrl(documentFile, 'web', remoteImageId)
				.then(previewUrl => getImageDataFromUrl(window.document, previewUrl))
				.then(
					imageData => {
						this.addCachedFileByRemoteId(remoteImageId, imageData);
						onImageisFinishedLoading && onImageisFinishedLoading();
					},
					error => {
						if (!error) {
							return;
						}
						this.deleteCachedFileByRemoteId(remoteImageId);
						this.addCachedErrorByRemoteId(remoteImageId);
						onImageisFinishedLoading && onImageisFinishedLoading();
					}
				);
		};

		render() {
			const props = {
				...this.props,
				...this.state,
				initialSelectedFileId: this.initialSelectedFileId,
				onItemSelect: this.onItemSelect,
				onUpdateInitialSelectedFileId: this.onUpdateInitialSelectedFileId,
				onUpdateItems: this.onUpdateItems,
				onUpdateRequest: this.onUpdateRequest,
				onUpdateViewMode: this.onUpdateViewMode,
				loadImage: this.loadImage
			};

			return <WrappedComponent {...props} />;
		}

		componentWillMount() {
			this.isComponentMounted = true;
		}

		componentWillUnmount() {
			this.isComponentMounted = false;
		}
	};
}
