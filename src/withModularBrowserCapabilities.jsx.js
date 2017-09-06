import React, { Component } from 'react';

import configuredAssetConnector from 'fontoxml-configuration/get!asset-connector';
import documentsManager from 'fontoxml-documents/documentsManager';
import getImageDataFromUrl from 'fontoxml-image-resolver/getImageDataFromUrl';
import selectionManager from 'fontoxml-selection/selectionManager';

export default function withModularBrowserCapabilities(WrappedComponent, initialViewMode = null) {
	return class ModularBrowser extends Component {
		initialSelectedFileId = null;
		isComponentMounted = false;
		loadingFilesById = {};
		cachedFileByRemoteId = {};
		cachedErrorByRemoteId = {};

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
			viewMode: initialViewMode
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

		loadImage = remoteImageId => {
			if (this.cachedFileByRemoteId[remoteImageId]) {
				return Promise.resolve(this.cachedFileByRemoteId[remoteImageId]);
			}

			if (this.loadingFilesById[remoteImageId]) {
				return this.loadingFilesById[remoteImageId];
			}

			if (this.cachedErrorByRemoteId[remoteImageId]) {
				return Promise.reject(this.cachedErrorByRemoteId[remoteImageId]);
			}

			const documentFile = documentsManager.getDocumentFile(
				selectionManager.focusedDocumentId
			);
			const promise = configuredAssetConnector
				.getPreviewUrl(documentFile, 'web', remoteImageId)
				.then(previewUrl => getImageDataFromUrl(window.document, previewUrl));

			this.loadingFilesById[remoteImageId] = promise;
			promise.then(
				imageData => {
					delete this.loadingFilesById[remoteImageId];
					this.cachedFileByRemoteId[remoteImageId] = imageData;
					return imageData;
				},
				error => {
					if (!error) {
						return;
					}
					delete this.loadingFilesById[remoteImageId];
					this.cachedErrorByRemoteId[remoteImageId] = error;
					throw error;
				}
			);
			return promise;
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
				loadOnlyLastImage: this.loadOnlyLastImage,
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
