import type { ComponentProps } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import connectorsManager from 'fontoxml-configuration/src/connectorsManager';
import type { ConfigurationValueTypes } from 'fontoxml-configuration/src/types';
import type StandardAssetConnector from 'fontoxml-connectors-standard/src/StandardAssetConnector';
import type { BrowseResponseItem } from 'fontoxml-connectors-standard/src/types';
import type { SelectFileButton } from 'fontoxml-design-system/src/components';
import type { RemoteDocumentId } from 'fontoxml-remote-documents/src/types';

const configuredAssetConnector =
	connectorsManager.getConnector('asset-connector');

type UploadParams = Parameters<StandardAssetConnector['upload']>;
type UploadFileType = UploadParams[2];
type UploadMetadata = UploadParams[3];

export type UploadContext = {
	metadata: UploadMetadata;
	remoteDocumentId: RemoteDocumentId;
	targetFolder?: BrowseResponseItem;
};
export type UploadConfig = {
	errorMessages: {
		fileSizeTooLargeMessage: string;
		invalidFileTypeMessage: string;
		serverErrorMessage: string;
	};
	fileType: UploadFileType;
	maxFileSizeInBytes: ConfigurationValueTypes['cms-browser-upload-max-file-size-in-bytes'];
	mimeTypesToAccept: ConfigurationValueTypes['cms-browser-upload-mime-types-to-accept'];
};

type UploadCallback = ComponentProps<typeof SelectFileButton>['onSelect'];

type UploadRequestState =
	| { errorMessage: string; file: File; name: 'errored' }
	| { file: File; item: BrowseResponseItem; name: 'successful' }
	| { file: File; name: 'loading' }
	| { name: 'uninitialized' };

function isValidMimeType(
	selectedMimeType: string,
	mimeTypeGlob: string
): boolean {
	if (mimeTypeGlob === 'image/*') {
		return selectedMimeType.startsWith('image/');
	}
	// TODO: Do full mimetype checking: parse this glob and actually test
	// Not doing that right now because the only way to select something wrong is by consciously selecting rubbish in an upload modal.
	return true;
}

export default function useUpload(
	context: UploadContext,
	config: UploadConfig
): {
	uploadRequestState: UploadRequestState;
	upload: UploadCallback;
} {
	const [uploadRequestState, setUploadRequestState] =
		useState<UploadRequestState>({ name: 'uninitialized' });

	const isMountedInDOM = useRef(false);
	useEffect(() => {
		isMountedInDOM.current = true;

		return () => {
			isMountedInDOM.current = false;
		};
	}, []);

	const upload = useCallback(
		(files: FileList) => {
			if (!isMountedInDOM.current) {
				return;
			}

			// TODO: support multiple
			const file = files[0];

			if (file.size > config.maxFileSizeInBytes) {
				setUploadRequestState({
					file,
					errorMessage: config.errorMessages.fileSizeTooLargeMessage,
					name: 'errored',
				});
				return;
			}

			if (!isValidMimeType(file.type, config.mimeTypesToAccept)) {
				setUploadRequestState({
					file,
					errorMessage: config.errorMessages.invalidFileTypeMessage,
					name: 'errored',
				});
				return;
			}

			setUploadRequestState({ file, name: 'loading' });

			void configuredAssetConnector
				.upload(
					context.remoteDocumentId,
					files[0],
					config.fileType,
					context.metadata,
					context.targetFolder?.id || undefined
				)
				.then(
					(uploadedItem) => {
						if (!isMountedInDOM.current) {
							return;
						}

						setUploadRequestState({
							file,
							item: uploadedItem,
							name: 'successful',
						});
					},
					(error) => {
						if (!isMountedInDOM.current || !error) {
							return;
						}

						setUploadRequestState({
							file,
							errorMessage:
								config.errorMessages.serverErrorMessage,
							name: 'errored',
						});
					}
				);
		},
		[
			config.fileType,
			config.errorMessages.fileSizeTooLargeMessage,
			config.errorMessages.invalidFileTypeMessage,
			config.errorMessages.serverErrorMessage,
			config.maxFileSizeInBytes,
			config.mimeTypesToAccept,
			context.metadata,
			context.remoteDocumentId,
			context.targetFolder,
		]
	);

	return {
		upload,
		uploadRequestState,
	};
}
