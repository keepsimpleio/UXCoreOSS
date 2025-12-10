import { FC, useEffect, useState } from 'react';
import Modal from '@components/Modal';
import { TRouter } from '@local-types/global';
import { useRouter } from 'next/router';
import styles from './ChristmasPopup.module.scss';
import Cookies from 'js-cookie';
import EmojiFall from '@components/EmojiFall';
import cn from 'classnames';
import useMobile from '@hooks/useMobile';
import Image from 'next/image';

interface ChristmasPopupProps {
  open: boolean;
}

const ChristmasPopup: FC<ChristmasPopupProps> = ({ open }) => {
  const router = useRouter();
  const { locale } = router as TRouter;
  const { isMobile } = useMobile()[1];

  const [close, setClose] = useState(false);
  const title =
    locale === 'en'
      ? 'MERRY CHRISTMAS AND HAPPY NEW YEAR'
      : 'С Новым Годом и Рождеством!';
  const happyNewYearTxt =
    locale === 'en'
      ? '🎄 Merry Christmas and Happy New Year! 🎄'
      : '🎄 С Новым Годом и Рождеством! 🎄';
  const descriptionEn = (
    <p>
      {' '}
      Thousands of users from 148 countries! 🎉 <br /> 100,000+ sessions! 🎉🎉{' '}
      <br /> 3 upcoming projects in development 🎉🎉🎉
    </p>
  );
  const descriptionRu = (
    <p>
      Тысячи пользователей из 148 стран! 🎉 <br /> Более 100,000 сессий! 🎉🎉{' '}
      <br /> 3 новых проекта-дополнения в разработке! 🎉🎉🎉
    </p>
  );
  const description = locale === 'en' ? descriptionEn : descriptionRu;
  const thankYouTxtEn = (
    <p className={styles.thankYouTxt}>
      {' '}
      Thank you for staying with us, with open-source. <br /> Be Kind. Do
      Good.{' '}
    </p>
  );
  const thankYouTxtRu = (
    <p className={styles.thankYouTxt}>
      {' '}
      Спасибо что помогаете нам развивать open-source. <br /> Be Kind. Do
      Good.{' '}
    </p>
  );
  const thankYouTxt = locale === 'en' ? thankYouTxtEn : thankYouTxtRu;
  const closePopUp = () => {
    Cookies.set('helpToHelpModal', 'seen', { expires: 14 });
    sessionStorage.setItem('seenHelpToHelp', String(true));
    setClose(!close);
  };

  useEffect(() => {
    const cookieEnabled = Cookies.get('helpToHelpModal') === 'seen';
    if (cookieEnabled) {
      setClose(!cookieEnabled);
    } else {
      const reopeningPopUp = sessionStorage.getItem('seenHelpToHelp');
      setClose(!reopeningPopUp);
    }
  }, []);
  return (
    open && (
      <Modal
        hasBorder
        title={title}
        blackTitle
        onClick={closePopUp}
        className={cn(styles.modalContainer, {
          [styles.disableModal]: !close,
        })}
        close={!close}
      >
        <div className={styles.mainContainer}>
          <Image
            alt={'Domeownation squad'}
            useMap="#catMap"
            src={'/assets/images/squad.png'}
            width={379}
            height={163}
            className={styles.catSquad}
          />
          <map name="catMap">
            <area
              shape="rect"
              coords={isMobile ? '0,0,106,138' : '0,0,126,163'}
              alt="Cat 1"
              href="https://www.instagram.com/mumuk_evn/"
              target="_blank"
            />
            <area
              shape="rect"
              coords={isMobile ? '107,0,213,138' : '127,0,252,163'}
              alt="Cat 2"
              href="https://www.linkedin.com/in/melkonyanvahan/"
              target="_blank"
            />
            <area
              shape="rect"
              coords={isMobile ? '214,0,320,138' : '253,0,379,163'}
              alt="Cat 3"
              href="https://www.instagram.com/_mary_wylde__/"
              target="_blank"
            />
          </map>
          <div className={styles.greenContainer}>{description}</div>
          {thankYouTxt}

          <span className={styles.happyNewYearTxt} onClick={closePopUp}>
            <EmojiFall className={styles.candies} />
            {happyNewYearTxt}
          </span>
        </div>
      </Modal>
    )
  );
};
export default ChristmasPopup;
