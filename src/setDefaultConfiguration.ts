import configurationManager from 'fontoxml-configuration/src/configurationManager';

export default function setDefaultConfiguration(): void {
	configurationManager.setDefault(
		'cms-browser-upload-mime-types-to-accept',
		'image/*'
	);

	configurationManager.setDefault(
		'cms-browser-upload-max-file-size-in-bytes',
		4194304
	);
}
