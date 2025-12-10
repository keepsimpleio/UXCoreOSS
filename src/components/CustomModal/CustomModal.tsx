import { FC, useEffect, KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/router';
import cn from 'classnames';

import type { TRouter } from '@local-types/global';
import type { TagType } from '@local-types/data';
import { AddQuestion, ContactUs } from './contentTypes';
import customModalData from '@data/customModal';

import styles from './CustomModal.module.scss';

type ContentTypes = 'contactUs' | 'addQuestion';
type CustomModalProps = {
  isVisible: boolean;
  contentType: ContentTypes;
  tags: TagType[];
  onClose: () => void;
};

const CustomModal: FC<CustomModalProps> = ({
  isVisible,
  onClose,
  contentType,
  tags,
}) => {
  const router = useRouter();
  const { locale } = router as TRouter;
  const { titles } = customModalData[locale];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    // @ts-ignore
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      // @ts-ignore
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    // @ts-ignore
    const isChrome = !!window.chrome;
    const overflowDefaultValue = isChrome ? 'overlay' : 'auto';

    if (isVisible) {
      document.documentElement.style.overflowY = 'hidden';
    } else {
      document.documentElement.style.overflowY = overflowDefaultValue;
    }

    return () => {
      document.documentElement.style.overflowY = overflowDefaultValue;
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {createPortal(
        <div
          className={styles.ModalOverlay}
          onClick={onClose}
          data-cy={'custom-modal-close'}
        >
          <div
            data-cy={'custom-modal-content'}
            className={cn(styles.Modal, {
              [styles.hyLang]: locale === 'hy',
            })}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.ModalHeader}>
              <div className={styles.ModalHeaderBody}>
                {titles[contentType]}
              </div>
              <div className={styles.ModalHeaderCloseButtonContainer}>
                <div className={styles.ModalHeaderCloseButton}>
                  <img
                    src="/assets/biases/cross.svg"
                    onClick={onClose}
                    alt="modal close button"
                  />
                </div>
              </div>
            </div>
            <div className={styles.ModalBody}>
              {contentType === 'addQuestion' && (
                <AddQuestion closeModal={onClose} tags={tags} />
              )}
              {contentType === 'contactUs' && (
                <ContactUs closeModal={onClose} />
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

export default CustomModal;
