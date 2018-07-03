import React, { Component } from 'react';

import { Button, Flex, Label } from 'fds/components';

import t from 'fontoxml-localization/t';

const determineStyles = paddingVertical => ({
	paddingTop: paddingVertical,
	paddingBottom: paddingVertical
});

class ModalBrowserLoadMore extends Component {
	render() {
		const { currentItems, onButtonClick, paddingVertical, showButton, totalItems } = this.props;

		return (
			<Flex
				alignItems="center"
				applyCss={determineStyles(paddingVertical)}
				justifyContent="center"
				flex="none"
				flexDirection="column"
				spaceSize="s"
			>
				<Label colorName="text-muted-color">
					{t('Showing {CURRENT_ITEMS} of {TOTAL_ITEMS}', {
						CURRENT_ITEMS: currentItems,
						TOTAL_ITEMS: totalItems
					})}
				</Label>

				{showButton && (
					<Button type="primary" label={t('Show more…')} onClick={onButtonClick} />
				)}
			</Flex>
		);
	}
}

export default ModalBrowserLoadMore;
