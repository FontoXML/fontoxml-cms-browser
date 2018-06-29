import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { ModalBodyToolbar, TextLink } from 'fds/components';

import t from 'fontoxml-localization/t';

class ModalBrowserPagination extends Component {
	static propTypes = {
		handlePageBackward: PropTypes.func,
		handlePageForward: PropTypes.func
	};

	render() {
		const { handlePageBackward, handlePageForward } = this.props;

		if (!handlePageBackward && !handlePageForward) {
			return null;
		}

		if (handlePageBackward && handlePageForward) {
			return (
				<ModalBodyToolbar justifyContent="space-between">
					<TextLink label={t('Previous')} onClick={handlePageBackward} />
					<TextLink label={t('Next')} onClick={handlePageForward} />
				</ModalBodyToolbar>
			);
		}

		if (handlePageForward) {
			return (
				<ModalBodyToolbar justifyContent="flex-end">
					<TextLink label={t('Next')} onClick={handlePageForward} />
				</ModalBodyToolbar>
			);
		}

		return (
			<ModalBodyToolbar>
				<TextLink label={t('Previous')} onClick={handlePageBackward} />
			</ModalBodyToolbar>
		);
	}
}

export default ModalBrowserPagination;
