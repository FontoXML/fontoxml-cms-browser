import React, { Component } from 'react';

import configuredAssetConnector from 'fontoxml-configuration/get!asset-connector';

import documentsManager from 'fontoxml-documents/documentsManager';
import getImageDataFromUrl from 'fontoxml-image-resolver/getImageDataFromUrl';
import selectionManager from 'fontoxml-selection/selectionManager';
import onlyResolveLastPromise from 'fontoxml-utils/onlyResolveLastPromise';

import { SpinnerIcon, StateMessage } from 'fontoxml-vendor-fds/components';

class FxImageLoader extends Component {
	constructor (props) {
		super(props);

		this.state = {
			isLoading: false,
			lastError: null
		};

		this.cachedImageDataByRemoteImageId = this.props.cache || {};

		this.loadImage = onlyResolveLastPromise(
			(remoteImageId) => {
				if (this.cachedImageDataByRemoteImageId[remoteImageId]) {
					return Promise.resolve(this.cachedImageDataByRemoteImageId[remoteImageId]);
				}

				const documentFile = documentsManager.getDocumentFile(selectionManager.focusedDocumentId);
				return configuredAssetConnector.getPreviewUrl(documentFile, 'web', remoteImageId)
					.then((previewUrl) => getImageDataFromUrl(window.document, previewUrl));
			}
		);
	}

	refreshData (remoteImageId) {
		this.setState({ isLoading: true });

		this.loadImage(remoteImageId)
			.then(
				(imageData) => {
					if (!this.isComponentMounted) {
						return;
					}

					this.props.onLoadComplete(imageData);

					this.cachedImageDataByRemoteImageId[remoteImageId] = imageData;

					this.setState({ isLoading: false, lastError: null });
				},
				(error) => {
					if (error) {
						if (!this.isComponentMounted) {
							return;
						}

						this.props.onError(error);

						delete this.cachedImageDataByRemoteImageId[remoteImageId];

						this.setState({ isLoading: false, lastError: error });
					}
				}
			);
	}

	componentWillMount () {
		const { remoteImageId } = this.props;

		this.refreshData(remoteImageId);
	}

	componentDidMount () {
		this.isComponentMounted = true;
	}

	componentWillReceiveProps (nextProps) {
		if (nextProps.remoteImageId !== this.props.remoteImageId) {
			this.refreshData(nextProps.remoteImageId);
		}
	}

	render () {
		const { isLoading, lastError } = this.state;
		const { remoteImageId, renderLoadingMessage } = this.props;

		return isLoading ?
			renderLoadingMessage() :
			this.props.children(this.cachedImageDataByRemoteImageId[remoteImageId], lastError);
	}

	componentWillUnmount () {
		this.isComponentMounted = false;
	}
}
FxImageLoader.defaultProps = {
	renderLoadingMessage: () => (
		<StateMessage
			visual={ <SpinnerIcon align='center' /> }
			title='Loading image…' />
	),
	onError: () => {},
	onLoadComplete: () => {}
};

export default FxImageLoader;
