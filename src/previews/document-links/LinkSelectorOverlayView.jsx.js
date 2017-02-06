import readOnlyBlueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import getNodeId from 'fontoxml-dom-identification/getNodeId';
import domQuery from 'fontoxml-dom-utils/domQuery';
import evaluateXPathToNodes from 'fontoxml-selectors/evaluateXPathToNodes';
import View from 'fontoxml-views/View';

const LINKABLE_ELEMENT_ATTRIBUTE_NAME = 'cv-is-linkable-element';
const SELECTED_LINKABLE_ELEMENT_ATTRIBUTE_NAME = 'cv-is-linkable-element-and-selected';

function LinkSelectorOverlayView (viewRootNode, templatedView, linkableElementsQuery, initialSelectedLink, onSelectedLinkableElementChange) {
	View.call(this);

	this._templatedView = templatedView;
	this._linkableElementsQuery = linkableElementsQuery;
	this._initialSelectedLink = initialSelectedLink;

	this._initialSelectedLinkProcessed = false;
	this._linkableElementsViewNodes = [];
	this._selectedLinkableElementViewNode = null;

	this._updateLinkableElements = () => {
		templatedView.mutationLock.unlock(() => {
			const document = templatedView.getDocument();
			const documentElement = document.dom.documentNode.documentElement;

			const linkableElements = linkableElementsQuery ?
				evaluateXPathToNodes(linkableElementsQuery, documentElement, readOnlyBlueprint) :
				[ documentElement ];

			const linkableElementsViewNodes = linkableElements
				.map((linkableElement) => viewRootNode.querySelector(`[node-id="${getNodeId(linkableElement)}"]`))
				.filter((viewNodeOrNull) => !!viewNodeOrNull);

			linkableElementsViewNodes.forEach((viewNode) => {
				const isOld = this._linkableElementsViewNodes
					.some((oldViewNode) => oldViewNode.getAttribute('node-id') === viewNode.getAttribute('node-id'));
				if (isOld) {
					viewNode.removeAttribute(LINKABLE_ELEMENT_ATTRIBUTE_NAME);
				}
				else {
					viewNode.setAttribute(LINKABLE_ELEMENT_ATTRIBUTE_NAME, '');
				}
			});

			this._linkableElementsViewNodes = linkableElementsViewNodes;

			if (this._initialSelectedLinkProcessed) {
				return;
			}
			this._initialSelectedLinkProcessed = true;

			let initialSelectedLinkNodeId = null;
			if (this._initialSelectedLink && this._initialSelectedLink.nodeId) {
				initialSelectedLinkNodeId = this._initialSelectedLink.nodeId;
			}
			else if (!this._linkableElementsQuery || linkableElements.includes(documentElement)) {
				initialSelectedLinkNodeId = getNodeId(documentElement);
			}

			if (!initialSelectedLinkNodeId) {
				return;
			}

			this._selectedLinkableElementViewNode = this._linkableElementsViewNodes
				.find((viewNode) => viewNode.getAttribute('node-id') === initialSelectedLinkNodeId);
			if (this._selectedLinkableElementViewNode) {
				this._selectedLinkableElementViewNode.setAttribute(SELECTED_LINKABLE_ELEMENT_ATTRIBUTE_NAME, '');

				onSelectedLinkableElementChange(initialSelectedLinkNodeId);
			}
		});
	};

	this._handleLinkableElementClick = (event) => {
		event.stopPropagation();

		templatedView.mutationLock.unlock(() => {
			const newSelectedLinkableElementViewNode = domQuery.findClosestAncestor(
				event.target,
				(element) => element.getAttribute && element.getAttribute(LINKABLE_ELEMENT_ATTRIBUTE_NAME) !== null
			);

			if (!newSelectedLinkableElementViewNode ||
				newSelectedLinkableElementViewNode === this._selectedLinkableElementViewNode) {
				return;
			}

			if (this._selectedLinkableElementViewNode) {
				this._selectedLinkableElementViewNode.removeAttribute(SELECTED_LINKABLE_ELEMENT_ATTRIBUTE_NAME);
			}

			this._selectedLinkableElementViewNode = newSelectedLinkableElementViewNode;
			this._selectedLinkableElementViewNode.setAttribute(SELECTED_LINKABLE_ELEMENT_ATTRIBUTE_NAME, '');

			onSelectedLinkableElementChange(this._selectedLinkableElementViewNode.getAttribute('node-id'));
		});
	};
	viewRootNode.addEventListener('click', this._handleLinkableElementClick);
}

LinkSelectorOverlayView.prototype = Object.create(View.prototype);
LinkSelectorOverlayView.prototype.constructor = LinkSelectorOverlayView;

LinkSelectorOverlayView.prototype.loadDocument = function (documentController) {
	View.prototype.loadDocument.call(this, documentController);

	this._updateLinkableElements();
};

LinkSelectorOverlayView.prototype.unloadDocument = function () {
	this._linkableElementsViewNodes = [];
	this._selectedLinkableElementViewNode = null;

	View.prototype.unloadDocument.call(this);
};

LinkSelectorOverlayView.prototype.update = function () {
	this._updateLinkableElements();
};

LinkSelectorOverlayView.prototype.destroy = function () {
	this._linkableElementsViewNodes = [];
	this._selectedLinkableElementViewNode = null;

	View.prototype.destroy.call(this);
};

export default LinkSelectorOverlayView;
