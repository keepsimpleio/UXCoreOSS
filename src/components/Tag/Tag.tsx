import React, { FC, Fragment } from 'react';
import { useRouter } from 'next/router';
import cn from 'classnames';

import Tooltip from '../Tooltip';

import { TitlesType } from '@local-types/data';

import useMobile from '@hooks/useMobile';

import styles from './Tag.module.scss';

type TTagStyles = {
  backgroundColor: string;
};

export type TTag = {
  dataId?: string | number;
  id?: string | number;
  tooltip?: TitlesType;
  tooltipPosition?: 'default' | 'bottom';
  title: TitlesType | string;
  styles: TTagStyles;
  large?: boolean;
  type?: 'default' | 'button';
  isActive?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  isUxEducation?: boolean;
  dataCy?: string;
};

const Tag: FC<TTag> = ({
  dataId,
  title,
  tooltip,
  tooltipPosition,
  styles: incomingStyles,
  type = 'default',
  large,
  isActive = false,
  onClick = () => {},
  className,
  isUxEducation,
  dataCy,
}: TTag) => {
  const { isMobile } = useMobile()[1];
  const { locale } = useRouter();
  const advancedProps: any = {};
  let Wrapper: any = Fragment;

  if (tooltip && !isMobile) {
    Wrapper = Tooltip;
    advancedProps.content =
      isUxEducation && locale === 'hy' ? tooltip['en'] : tooltip[locale];
    advancedProps.isOnBottom = tooltipPosition === 'bottom';
  }

  const displayTitle =
    isUxEducation && locale === 'hy' ? title['en'] : title[locale] || title;

  return (
    <Wrapper {...advancedProps}>
      <button
        data-cy={dataCy ? dataCy : 'tag'}
        data-id={dataId}
        className={cn(styles.Tag, {
          [styles.TagButton]: type === 'button',
          [styles.Large]: large,
          [styles.TagButtonActive]: isActive,
          [className]: !!className,
        })}
        onClick={type === 'button' ? onClick : () => {}}
        style={incomingStyles}
      >
        {displayTitle}
      </button>
    </Wrapper>
  );
};

export default Tag;
