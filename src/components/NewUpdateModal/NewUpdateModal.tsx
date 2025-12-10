import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

import Modal from '@components/Modal';
import Button from '@components/Button';

import type { NewUpdateModalProps } from './NewUpdateModal.types';

import styles from './NewUpdateModal.module.scss';

const NewUpdateModal: FC<NewUpdateModalProps> = ({ data, onClose }) => {
  return (
    <Modal
      onClick={onClose}
      title={data?.title}
      blackTitle={true}
      hasBorder
      bodyClassName={styles['modalBody']}
    >
      <div>
        <Image
          src={`${process.env.NEXT_PUBLIC_STRAPI}${data?.image?.data.attributes.url}`}
          width={481}
          height={121}
          className={styles.img}
          alt={'New Update'}
        />
        <Link href={data?.socialMediaLink} target={'_blank'}>
          <Image
            src={'/assets/insta-icon.svg'}
            alt={'Insta Icon'}
            width={15}
            height={14}
            className={styles.instaIcon}
          />
        </Link>
      </div>
      <div className={styles.content}>
        <ReactMarkdown>{data?.description}</ReactMarkdown>
        <Button
          label={data?.buttonText}
          onClick={onClose}
          className={styles['closeBtn']}
        />
      </div>
    </Modal>
  );
};
export default NewUpdateModal;
