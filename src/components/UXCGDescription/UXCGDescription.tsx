import { useCallback, Fragment, FC } from 'react';
import { useRouter } from 'next/router';

import useUXCGGlobals from '@hooks/useUXCGGlobals';
import type { TRouter } from '@local-types/global';
import Accordion from '@components/Accordion';
import uxcgDescriptionData from '@data/uxcgDescriptionData';
import type { TagType } from '@local-types/data';
import Tag from '@components/Tag';

import styles from './UXCGDescription.module.scss';

type UXCGDescriptionProps = {
  tags: TagType[];
};

const UXCGDescription: FC<UXCGDescriptionProps> = ({ tags }) => {
  const [{ toggleUXCGDescription }, { isOpenedUXCGDescription }] =
    useUXCGGlobals();

  const { locale } = useRouter() as TRouter;
  const { sections, title } = uxcgDescriptionData[locale];

  const handleClick = useCallback(() => {
    toggleUXCGDescription();
  }, [toggleUXCGDescription]);

  return (
    <Accordion
      title={title}
      isOpen={isOpenedUXCGDescription}
      onToggleClick={handleClick}
    >
      {sections.map(({ title, content }, index) => (
        <Fragment key={index}>
          <div className={styles.ContentTitle}>
            <b>{title}</b>
          </div>
          {content.map((collection, collectionIndex) => {
            return (
              <div key={collectionIndex} className={styles.Content}>
                {/*@ts-ignore*/}
                <p> {collection.info}</p>
                {collection.point1 &&
                  collection.point2 &&
                  collection.point3 && (
                    <ol>
                      <li className={styles.Point}> {collection.point1} </li>
                      <li className={styles.Point}> {collection.point2} </li>
                      <li className={styles.Point}> {collection.point3} </li>
                    </ol>
                  )}
                <p>{collection?.description}</p>
              </div>
            );
          })}
        </Fragment>
      ))}
      <div className={styles.Tags}>
        {tags.map(({ tooltip, ...tagProps }) => {
          return (
            <div key={tagProps.id} className={styles.TagSection}>
              <div>
                <Tag {...tagProps} />
              </div>
              <div>{tooltip[locale]}</div>
            </div>
          );
        })}
      </div>
    </Accordion>
  );
};

export default UXCGDescription;
