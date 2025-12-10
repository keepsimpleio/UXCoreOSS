import type { FC } from 'react';
import type { StrapiBiasType } from '@local-types/data';

import Desktop from './Desktop';
import Mobile from './Mobile';
import useMobile from '@hooks/useMobile';

interface AnswerBiasLinkProps {
  locale: 'en' | 'ru' | 'hy';
  linkClassName: string;
  biasData: StrapiBiasType;
  containerClassName: string;
}

const AnswerBiasLink: FC<AnswerBiasLinkProps> = ({
  locale,
  linkClassName,
  biasData,
  containerClassName,
}) => {
  const { isMobile } = useMobile()[1];
  const { number, title, description, slug } = biasData;
  const text = title;

  const props = {
    containerClassName,
    locale,
    description,
    number,
    linkClassName,
    text,
    slug,
  };

  const Component = isMobile ? Mobile : Desktop;
  // @ts-ignore
  return <Component {...props} />;
};

export default AnswerBiasLink;
