import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Button, Flex } from 'fds/components';
import { paddingTop } from 'fds/system';

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
				<Flex justifyContent='space-between' flex='0 0 auto' applyCss={[paddingTop('m')]}>
					<Button icon='chevron-left' label={t('Previous')} onClick={handlePageBackward} />
					<Button iconAfter='chevron-right' label={t('Next')} onClick={handlePageForward} />
				</Flex>
			);
		}

		if (handlePageForward) {
			return (
				<Flex justifyContent='flex-end' flex='0 0 auto' applyCss={[paddingTop('m')]}>
					<Button iconAfter='chevron-right' label={t('Next')} onClick={handlePageForward} />
				</Flex>
			);
		}

		return (
			<Flex justifyContent='flex-start' flex='0 0 auto' applyCss={[paddingTop('m')]}>
				<Button icon='chevron-left' label={t('Previous')} onClick={handlePageBackward} />
			</Flex>
		);
	}
}

export default ModalBrowserPagination;