import { FC, useCallback, useState, useRef } from 'react';
import cn from 'classnames';
import { useRouter } from 'next/router';

import { copyToClipboard } from '@lib/helpers';
import type { TRouter } from '@local-types/global';
import copyButtonData from '@data/copyButton';
import styles from './CopyButton.module.scss';

type TCopyButton = {
  stringToCopy: string;
};

const CopyButton: FC<TCopyButton> = ({ stringToCopy }) => {
  const [isCopied, setIsCopied] = useState(false);
  const tooltipTimer: { current: any } = useRef();
  const router = useRouter();
  const { locale } = router as TRouter;

  const handleClick = useCallback(() => {
    if (!isCopied) {
      copyToClipboard(stringToCopy);

      setIsCopied(true);

      clearTimeout(tooltipTimer.current);
      tooltipTimer.current = setTimeout(() => {
        setIsCopied(false);
      }, 2500);
    }
  }, [stringToCopy, copyToClipboard, isCopied]);
  const { copied, copyButton } = copyButtonData[locale];

  return (
    <div
      className={cn(styles.CopyButton, {
        [styles.Copied]: isCopied,
      })}
      onClick={handleClick}
    >
      <img src={`/assets/icons/${isCopied ? 'marked' : 'copy'}.svg`} />
      {isCopied ? copied : copyButton}
    </div>
  );
};

export default CopyButton;
