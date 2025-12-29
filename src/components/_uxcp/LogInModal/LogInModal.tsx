import { FC, useContext } from 'react';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';

import decisionTable from '@data/decisionTable';

import {
  handleMixpanelSignUp,
  trackLogInSource,
} from '../../../../lib/mixpanel';
import { setRedirectCookie } from '@lib/cookies';

import { TRouter } from '@local-types/global';

import Modal from '@components/Modal';
import Button from '@components/Button';
import { GlobalContext } from '@components/Context/GlobalContext';

import GoogleIcon from '@icons/GoogleIcon';
import LinkedInIcon from '@icons/LinkedInIcon';
import DiscordIcon from '@icons/DiscordIcon';

import styles from './LogInModal.module.scss';

type LoginModalProps = {
  setShowModal: (showModal: boolean) => void;
  source?: string;
};
const LogInModal: FC<LoginModalProps> = ({ setShowModal, source }) => {
  const { locale } = useRouter() as TRouter;
  const { accountData } = useContext(GlobalContext);
  const router = useRouter();
  const isProduction = process.env.NEXT_PUBLIC_ENV === 'prod';
  const { data: session } = useSession();
  const {
    singInWithGoogle,
    signInWithLinkedIn,
    signInWithDiscord,
    loginText,
    cancelBtn,
    login,
  } = decisionTable[locale];

  const handleClose = () => {
    setShowModal(false);
  };

  const handleProviderSignIn = async (
    provider: string,
    logInSource: string,
  ) => {
    const returnTo = router.asPath;
    setRedirectCookie(returnTo);

    if (session && accountData === null) {
      await signOut({ redirect: false });

      localStorage.removeItem('accessToken');
      localStorage.removeItem('provider');
      sessionStorage.clear();

      router.replace(`/auth?provider=${provider}`);
      handleMixpanelSignUp(provider);
      trackLogInSource(logInSource);
      return;
    }

    router.push(`/auth?provider=${provider}`);
    handleMixpanelSignUp(provider);
    trackLogInSource(logInSource);
  };

  return (
    <Modal
      onClick={handleClose}
      wrapperClassName={styles.loginWrapper}
      bodyClassName={styles.loginBody}
      dataCy={'login-modal'}
    >
      <div className={styles.contentWrapper}>
        <h1 className={styles.title}>{login}</h1>
        <span className={styles.description}>{loginText}</span>
        <div className={styles.buttonWrapper}>
          <a
            onClick={() => handleProviderSignIn('google', source)}
            className={styles.link}
          >
            <GoogleIcon /> <span>{singInWithGoogle}</span>
          </a>
          {!isProduction && (
            <a
              onClick={() => handleProviderSignIn('linkedin', source)}
              className={styles.link}
            >
              <LinkedInIcon /> <span>{signInWithLinkedIn}</span>
            </a>
          )}
          <a
            onClick={() => handleProviderSignIn('discord', source)}
            className={styles.link}
          >
            <DiscordIcon /> <span>{signInWithDiscord}</span>
          </a>
          <Button
            label={cancelBtn}
            onClick={handleClose}
            className={styles.cancelBtn}
          />
        </div>
      </div>
    </Modal>
  );
};
export default LogInModal;
