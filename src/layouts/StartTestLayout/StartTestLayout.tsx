import { FC } from 'react';
import dynamic from 'next/dynamic';
import cn from 'classnames';

import ToolHeader from '@components/ToolHeader';
import Button from '@components/Button';

import type { TagType } from '@local-types/data';
import { UserTypes } from '@local-types/uxcat-types/types';

import UxCatLogo from '@icons/UxCatLogo';

import styles from './StartTestLayout.module.scss';

const Modal = dynamic(() => import('@components/Modal'), {
  ssr: false,
});

type StartTestLayoutProps = {
  tags?: TagType[];
  setOpenPersonas: (openPersonas: boolean) => void;
  testDuration: string;
  description1: string;
  goodLuckTxt: string;
  btnTxt: string;
  handleStartTest: () => void;
  disabled?: boolean;
  userInfo?: UserTypes;
  setUserInfo?: (userInfo: UserTypes) => void;
  description2?: string;
};
const StartTestLayout: FC<StartTestLayoutProps> = ({
  tags,
  setOpenPersonas,
  testDuration,
  handleStartTest,
  description1,
  description2,
  goodLuckTxt,
  btnTxt,
  disabled,
  userInfo,
  setUserInfo,
}) => {
  return (
    <>
      <ToolHeader
        page={'uxcat'}
        tags={tags}
        openPersonaModal={setOpenPersonas}
        disablePageSwitcher
        userInfo={userInfo}
        setUserInfo={setUserInfo}
      />
      <section className={styles.startTestWrapper}>
        <span className={styles.duration}>{testDuration}</span>
        <img
          src={'/assets/uxcat/img_1.png'}
          alt="background"
          className={styles.backgroundImg}
        />
        <Modal
          className={styles['modal']}
          onClick={handleStartTest}
          removeHeader
          wrapperClassName={styles['modalWrapper']}
          fullSizeMobile
          disableBackgroundClick
        >
          <div className={styles.catLogo}>
            <UxCatLogo />
          </div>

          <h1 className={styles.title}> uxCAT </h1>
          <p className={styles.description}> {description1} </p>
          <p className={styles.description}> {description2} </p>
          <p className={cn(styles.description, styles.goodLuckTxt)}>
            {goodLuckTxt}
          </p>
          <div className={styles.btnWrapper}>
            <Button
              label={btnTxt}
              onClick={handleStartTest}
              type={'orange'}
              isBig
              disabled={disabled}
            />
          </div>
        </Modal>
      </section>
    </>
  );
};

export default StartTestLayout;
