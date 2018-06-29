import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Button, Flex } from 'fds/components';
import { borderTop, color } from 'fds/system';

import t from 'fontoxml-localization/t';

// TODO: these styles and propsForFlex recreate a ModalContentToolbar, but with the border at the
// top instead of the bottom. Consider making that a prop on ModelContentToolbar in a next release.
const styles = [
	{ backgroundColor: color('modal-content-toolbar-background') },
	borderTop(color('modal-content-toolbar-border'))
];

const propsForFlex = {
	alignItems: 'center',
	applyCss: styles,
	flex: 'none',
	flexDirection: 'row',
	paddingSize: 'm'
};

class ModalBrowserPagination extends Component {
	static propTypes = {
		onPageBackward: PropTypes.func,
		onPageForward: PropTypes.func
	};

	render() {
		const { onPageBackward, onPageForward } = this.props;

		if (!onPageBackward && !onPageForward) {
			return null;
		}

		// Note: the Button components below have a key to ensure React does not reuse the Button
		// component and just updates the label. This would have the unwanted side effect of
		// retaining the (isFocused) state of the Button. Which would mean that after the first
		// click on the 'Next' button, that button would be retained by React, but would receive
		// the 'Previous' label (which is now the first Button in DOM order). It would still be
		// focused so if you were to press 'Enter', you would go backwards again.

		if (onPageBackward && onPageForward) {
			return (
				<Flex {...propsForFlex} justifyContent="space-between">
					<Button
						key="backward"
						icon="backward"
						label={t('Previous')}
						onClick={onPageBackward}
					/>
					<Button
						key="forward"
						icon="forward"
						label={t('Next')}
						onClick={onPageForward}
					/>
				</Flex>
			);
		}

		if (onPageForward) {
			return (
				<Flex {...propsForFlex} justifyContent="flex-end">
					<Button
						key="forward"
						icon="forward"
						label={t('Next')}
						onClick={onPageForward}
					/>
				</Flex>
			);
		}

		return (
			<Flex {...propsForFlex}>
				<Button
					key="backward"
					icon="backward"
					label={t('Previous')}
					onClick={onPageBackward}
				/>
			</Flex>
		);
	}
}

export default ModalBrowserPagination;
