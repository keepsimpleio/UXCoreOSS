import { FC, Fragment, useState } from 'react';
import cn from 'classnames';
import { useRouter } from 'next/router';
import CustomModal from '@components/CustomModal';

import type { TRouter } from '@local-types/global';
import type { TagType } from '@local-types/data';

import toolHeaderData from '@data/toolHeader';

import styles from './UsefulLinksContent.module.scss';

type UsefulLinksContentProps = {
  page?: 'uxcp' | 'uxcg' | 'uxcore' | 'uxeducation' | 'uxcat';
  tags: TagType[];
};

const UsefulLinksContent: FC<UsefulLinksContentProps> = ({ tags, page }) => {
  const [openedModal, setOpenedModal] = useState(null);

  const router = useRouter();

  const { locale } = router as TRouter;
  const { usefulLinks } = toolHeaderData[locale];

  const toggleModal = (modalValue?: string) => {
    setOpenedModal(modalValue || null);
  };

  return (
    <div
      className={cn(styles.UsefulLinksContent, {
        [styles.hyLang]: locale === 'hy',
      })}
      data-cy="useful-links-content"
    >
      {usefulLinks.map(({ title, items }, sectionIndex) => {
        return (
          <div key={sectionIndex} className={styles.Section}>
            {title && <div className={styles.Title}>{title}</div>}
            {items.map(
              ({ title, link, download, target, icon, alt }, linkIndex) => {
                return (
                  <Fragment key={linkIndex}>
                    {link ? (
                      <a
                        className={cn(styles.Link, {
                          [styles.Active]: `/${page}` === link,
                        })}
                        href={link}
                        target={target}
                        download={!!download}
                      >
                        {title}
                        {icon && (
                          <img
                            src={`/assets/icons/${icon}.svg`}
                            alt={alt}
                            width={14}
                            height={14}
                          />
                        )}
                      </a>
                    ) : (
                      <div
                        className={styles.Link}
                        onClick={() => toggleModal('addQuestion')}
                      >
                        {title}
                      </div>
                    )}
                  </Fragment>
                );
              },
            )}
          </div>
        );
      })}
      <CustomModal
        isVisible={!!openedModal}
        contentType={openedModal}
        tags={tags}
        onClose={() => toggleModal()}
      />
    </div>
  );
};

export default UsefulLinksContent;
