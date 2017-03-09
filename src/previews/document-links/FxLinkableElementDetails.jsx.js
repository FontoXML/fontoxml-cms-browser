import React from 'react';

import { after, before, merge } from 'glamor';

import documentsManager from 'fontoxml-documents/documentsManager';
import t from 'fontoxml-localization/t';
import getMarkupLabel from 'fontoxml-markup-documentation/getMarkupLabel';
import getTitleContent from 'fontoxml-markup-documentation/getTitleContent';
import domQuery from 'fontoxml-dom-utils/domQuery';
import truncator from 'fontoxml-utils/truncator';

import { Label } from 'fontoxml-vendor-fds/components';
import { block, fontSize, fontStack, spaceVertical } from 'fontoxml-vendor-fds/system';

const MAXIMUM_CHARACTERS = 140;

const styles = merge(
	block,
	spaceVertical('s')
);

const elementTextContentStyles = merge(
	fontStack('interface'),
	fontSize('m')
);
const quotedElementTextContentStyles = merge(
	fontStack('content'),
	// Values match ui-document-reference-popover which matches ui-review-cards.
	{ fontSize: '13px', lineHeight: '21px' },
	{ quotes: `'“' '”'` },
	before({ content: 'open-quote' }),
	after({ content: 'close-quote' })
);

const FxLinkableElementDetails = ({ documentId, elementId, linkTypeName }) => {
	const element = elementId ?
		documentsManager.getNodeById(elementId, documentId) :
		documentsManager.getDocumentNode(documentId).documentElement;

	const markupLabel = getMarkupLabel(element) || element.nodeName;

	let textContent = getTitleContent(element) || domQuery.getTextContent(element);
	const textContentIsLiteral = !!textContent;
	if (textContentIsLiteral) {
		textContent = truncator.truncateRight(textContent, MAXIMUM_CHARACTERS, false);
	}
	else {
		textContent = t('This {MARKUP_LABEL} does not contain any textual content.', { MARKUP_LABEL: markupLabel });
	}

	return (
		<fx-linkable-element-details { ...styles }>
			<Label colorName='text-muted-color' isFullWidth>
				{ t('{LINK_TYPE} to the {MARKUP_LABEL}:', { LINK_TYPE: linkTypeName, MARKUP_LABEL: markupLabel }) }
			</Label>

			<fx-linkable-element-text-content { ...(
				textContentIsLiteral ? quotedElementTextContentStyles : elementTextContentStyles
			) }>
				{ textContent }
			</fx-linkable-element-text-content>
		</fx-linkable-element-details>
	);
};

export default FxLinkableElementDetails;
