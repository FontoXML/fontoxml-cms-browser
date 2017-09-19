# Add-on fontoxml-cms-browsers

This add-on exposes five operations for opening cms related browsers. These browsers allow the user to browse documents and images present on the used CMS.

## Getting started

This add-on can be added to an editor by selecting it in the list of add-ons available on the SDK portal. This can then be installed as usual.

---

## Usage of open-document-with-link-selector-browser-modal

The {@link operation/open-document-with-link-selector-browser-modal} operation is used to open the document with link selector browser. This browser allows the user to select an element in a document.

This browser can be used by adding the following operation step to your operation:

```
{
    "type": "operation/open-document-with-link-selector-browser-modal"
}
```

The elements which should be selectable by the user can be set by providing a `linkableElementsQuery`. This is an {@link XPathQuery}.

When this browser is used to edit an existing link, the `documentId` and `nodeId` properties can be used to set the selection on the original document and element. In addition to these two properties, the browser title and primary button label can be set with the `modalTitle` and `modalPrimaryButtonLabel` respectively.

For more information, see the {@link operation/open-document-with-link-selector-browser-modal} operation.

---

## Usage of open-image-browser-modal

The {@link operation/open-image-browser-modal} operation is used to open the image browser. This browser allows the user to select an image. This, for example, can be used to insert an image in a document.

This browser can be used by adding the following operation step to your operation:

```
{
    "type": "operation/open-image-browser-modal"
}
```

When this browser is being used to edit a reference to an existing image, the `selectedImageId` property can be used to set the selection on the original image. In addition to this property, the browser title and primary button label can be set with the `modalTitle` and `modalPrimaryButtonLabel` respectively.

For more information, see the {@link operation/open-image-browser-modal} operation.

---

## Usage of open-document-browser-modal

The {@link operation/open-document-browser-modal} operation is used to open the document browser. This browser allows the user to select a document. This, for example, can be used to insert a document in a map.

This browser can be used by adding the following operation step to your operation:

```
{
    "type": "operation/open-document-browser-modal"
}
```

When this browser is being used to edit a reference to an existing document, the `documentId` property can be used to set the selection on the original document. In addition to this property, the browser title and primary button label can be set with the `modalTitle` and `modalPrimaryButtonLabel` respectively.

For more information, see the {@link operation/open-document-browser-modal} operation.

---

## Usage of open-open-or-create-document-browser-modal

The {@link operation/open-open-or-create-document-browser-modal} operation is used to open the open or create document browser. This browser allows the user to create a new document or open an existing document.

This browser can be used by adding the following operation step to your operation:

```
{
    "type": "open-open-or-create-document-browser-modal"
}
```

The only property to set for this browser is the `modalTitle`.

For more information, see the {@link operation/open-open-or-create-document-browser-modal} operation.

---

## Usage of open-create-document-form-modal

The {@link operation/open-create-document-form-modal} operation is used to open the create document form modal. This form allows the user to create a new document by choosing a template.

This browser can be used by adding the following operation step to your operation:

```
{
    "type": "operation/open-create-document-form-modal"
}
```

The only property to set for this form is the `modalTitle`.

For more information, see the {@link operation/open-create-document-form-modal} operation.
