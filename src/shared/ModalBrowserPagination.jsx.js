import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { ModalBodyToolbar, TextLink } from 'fds/components';

import t from 'fontoxml-localization/t';

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

		if (onPageBackward && onPageForward) {
			return (
				<ModalBodyToolbar justifyContent="space-between">
					<TextLink label={t('Previous')} onClick={onPageBackward} />
					<TextLink label={t('Next')} onClick={onPageForward} />
				</ModalBodyToolbar>
			);
		}

		if (onPageForward) {
			return (
				<ModalBodyToolbar justifyContent="flex-end">
					<TextLink label={t('Next')} onClick={onPageForward} />
				</ModalBodyToolbar>
			);
		}

		return (
			<ModalBodyToolbar>
				<TextLink label={t('Previous')} onClick={onPageBackward} />
			</ModalBodyToolbar>
		);
	}
}

export default ModalBrowserPagination;
