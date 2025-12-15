import React, { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import Modal from '@components/Modal';
import Button from '@components/Button';

import type { OurProjectsModalProps } from './OurProjectsModal.types';

import styles from './OurProjectsModal.module.scss';

const OurProjectsModal: FC<OurProjectsModalProps> = ({
  onClose,
  title,
  projects,
  github,
  api,
}) => {
  return (
    <Modal
      onClick={onClose}
      title={title}
      hasBorder
      fullHeightMobile
      dataCy={'our-projects-modal'}
    >
      {projects &&
        projects.map((project: any, index: number) => {
          return (
            <div key={index}>
              <div
                className={styles.projectInfo}
                data-cy={'our-projects-content'}
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_STRAPI}${project.image.data.attributes.url}`}
                  width={20}
                  height={20}
                  alt={project.name}
                />
                <Link
                  href={project.link || ''}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.name}
                >
                  {project.name}
                  <Image
                    src={'/assets/project-icons/open-link.png'}
                    alt={''}
                    width={16}
                    height={16}
                    unoptimized
                  />
                </Link>
              </div>
              <div dangerouslySetInnerHTML={{ __html: project.description }} />
              <div />
            </div>
          );
        })}
      <hr />
      <div className={styles.linksWrapper}>
        <Link
          href={github[0]?.link || ''}
          target={'_blank'}
          className={styles.buttonStyleLink}
        >
          <Image
            src={'/assets/project-icons/github-dark.png'}
            alt={'GitHubIcon'}
            width={20}
            height={20}
            className={styles.darkIcon}
            unoptimized
          />
          <Image
            src={'/assets/project-icons/github-light.png'}
            alt={'GitHubIcon'}
            width={20}
            height={20}
            className={styles.lightIcon}
            unoptimized
          />

          {github[0]?.linkName}
        </Link>
        <Link
          href={api[0]?.link || ''}
          className={styles.buttonStyleLink}
          target={'_blank'}
        >
          <Image
            src={'/assets/project-icons/api-dark.png'}
            alt={'GitHubIcon'}
            width={20}
            height={20}
            className={styles.darkIcon}
            unoptimized
          />
          <Image
            src={'/assets/project-icons/api-light.png'}
            alt={'GitHubIcon'}
            width={20}
            height={20}
            className={styles.lightIcon}
            unoptimized
          />
          {api[0]?.linkName}
        </Link>
      </div>

      <div className={styles.doneBtn}>
        <Button
          label={'Done'}
          onClick={() => onClose()}
          type={'primary'}
          dataCy={'our-projects-close-button'}
        />
      </div>
    </Modal>
  );
};

export default OurProjectsModal;
