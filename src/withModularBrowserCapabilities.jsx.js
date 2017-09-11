import React, { Component } from 'react';

import configuredAssetConnector from 'fontoxml-configuration/get!asset-connector';
import documentLoader from 'fontoxml-remote-documents/documentLoader';
import documentsManager from 'fontoxml-documents/documentsManager';
import getImageDataFromUrl from 'fontoxml-image-resolver/getImageDataFromUrl';
import onlyResolveLastPromise from 'fontoxml-utils/onlyResolveLastPromise';
import selectionManager from 'fontoxml-selection/selectionManager';

export default function withModularBrowserCapabilities(WrappedComponent, initialViewMode = null) {
	return class ModularBrowser extends Component {
		// TODO: refactored by Thomas G.
		cachedFileByRemoteId = {};
		cachedErrorByRemoteId = {};

		initialSelectedItemId = null;
		// TODO: rename to isMountedInDOM / refactored by Thomas G.
		isComponentMounted = false;

		// TODO: delete / refactored by Thomas G.
		loadingFilesById = {};

		state = {
			// Contains information on the current/last known request
			// { type: fileLoad|search|browse|upload, ?query, ?error, ?resultCount }
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

		isItemErrored = item => !!this.cachedErrorByRemoteId[item.id];

		// Used by any component to change the currently selected item
		onItemSelect = item => this.isComponentMounted && this.setState({ selectedItem: item });

		onUpdateInitialSelectedItemId = itemId => {
			if (this.isComponentMounted) {
				this.initialSelectedItemId = itemId;
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

		onlyLoadLastDocument = onlyResolveLastPromise(remoteDocumentId =>
			documentLoader.loadDocument(remoteDocumentId)
		);

		loadDocument = remoteDocumentId => {
			if (this.cachedFileByRemoteId[remoteDocumentId]) {
				return Promise.resolve(this.cachedFileByRemoteId[remoteDocumentId]);
			}

			if (this.cachedErrorByRemoteId[remoteDocumentId]) {
				return Promise.reject(this.cachedErrorByRemoteId[remoteDocumentId]);
			}

			return this.onlyLoadLastDocument(remoteDocumentId).then(
				documentId => {
					delete this.cachedErrorByRemoteId[remoteDocumentId];
					this.cachedFileByRemoteId[remoteDocumentId] = documentId;
					return documentId;
				},
				error => {
					delete this.cachedFileByRemoteId[remoteDocumentId];
					this.cachedErrorByRemoteId[remoteDocumentId] = error;
					throw error;
				}
			);
		};

		render() {
			const props = {
				...this.props,
				// TODO: make this explicit (only 5 state properties anyway)
				...this.state,
				// Is this needed? What for?
				initialSelectedItemId: this.initialSelectedItemId,
				isItemErrored: this.isItemErrored,
				onItemSelect: this.onItemSelect,
				// TODO: rename to onInitialSelectedItemIdChange
				onUpdateInitialSelectedItemId: this.onUpdateInitialSelectedItemId,
				// TODO: rename to onItemsChange
				onUpdateItems: this.onUpdateItems,
				// TODO: rename to onRequestStateChange
				onUpdateRequest: this.onUpdateRequest,
				// TODO: rename to onViewModeChange
				onUpdateViewMode: this.onUpdateViewMode,

				// TODO: refactored by Thomas G.
				loadDocument: this.loadDocument,
				loadImage: this.loadImage
			};

			return <WrappedComponent {...props} />;
		}

		// TODO: shouldn't this be componentDidMount() ?
		componentWillMount() {
			this.isComponentMounted = true;
		}

		componentWillUnmount() {
			this.isComponentMounted = false;
		}
	};
}
