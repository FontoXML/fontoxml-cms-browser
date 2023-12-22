import type { FC } from 'react';

import type { ConfigurationValueTypes } from 'fontoxml-configuration/src/types';
import { SelectFileButton } from 'fontoxml-design-system/src/components';
import t from 'fontoxml-localization/src/t';

import type useBrowse from './useBrowse';
import type useUpload from './useUpload';

type Props = {
	browseRequest: ReturnType<typeof useBrowse>['browseRequestState'];
	mimeTypesToAccept?: ConfigurationValueTypes['cms-browser-upload-mime-types-to-accept'];
	uploadRequest: ReturnType<typeof useUpload>['uploadRequestState'];
	uploadSelectedFiles: ReturnType<typeof useUpload>['upload'];
};

const ModalBrowserUploadButton: FC<Props> = ({
	browseRequest,
	mimeTypesToAccept,
	uploadRequest,
	uploadSelectedFiles,
}) => {
	return (
		<SelectFileButton
			label={t('Upload')}
			isDisabled={
				browseRequest.name === 'loading' ||
				uploadRequest.name === 'loading'
			}
			mimeTypesToAccept={mimeTypesToAccept}
			icon="upload"
			iconAfter={uploadRequest.name === 'loading' ? 'spinner' : undefined}
			onSelect={uploadSelectedFiles}
		/>
	);
};

export default ModalBrowserUploadButton;
