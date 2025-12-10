import React, { FC } from 'react';
import { createPortal } from 'react-dom';
import cn from 'classnames';

import styles from './UXCoreSnackbar.module.scss';

type UXCoreSnackbarProps = {
  text?: string;
  showSnackbar?: boolean;
  isHy: boolean;
};

const UXCoreSnackbar: FC<UXCoreSnackbarProps> = ({
  text,
  showSnackbar,
  isHy,
}) => {
  return (
    <>
      {createPortal(
        <div
          className={cn(styles.snackBar, {
            [styles.showSnackbar]: showSnackbar,
            [styles.snackBarHy]: isHy,
          })}
          data-cy="uxcore-snackbar"
        >
          <div className={styles.checkmark}>✅</div>
          <p className={styles.text}>{text}</p>
        </div>,
        document.body,
      )}
    </>
  );
};

export default UXCoreSnackbar;
