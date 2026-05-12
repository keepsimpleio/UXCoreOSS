import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { FC, useContext, useEffect, useRef, useState } from 'react';

import { deleteRedirectCookie, getRedirectCookie } from '@lib/cookies';

import { consumeMagicLink, storeJwtSession } from '@api/auth';

import auth from '@data/auth';

import { GlobalContext } from '@components/Context/GlobalContext';
import MagicLinkProfileForm from '@components/MagicLinkProfileForm';
import Spinner from '@components/Spinner';

import styles from './magic-link.module.scss';

type ConsumeState =
  | { kind: 'loading' }
  | { kind: 'profile'; registrationToken: string; email: string }
  | { kind: 'invalidLink' }
  | { kind: 'blocked'; message?: string };

const tearDownExistingSession = async () => {
  await signOut({ redirect: false });
  localStorage.removeItem('accessToken');
  localStorage.removeItem('googleToken');
  localStorage.removeItem('provider');
  document.cookie =
    'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; Secure; SameSite=Strict;';
};

const MagicLinkConsumePage: FC = () => {
  const router = useRouter();
  const { setAccountData, setToken } = useContext(GlobalContext) as any;
  const session = useSession();

  const locale: 'en' | 'ru' | 'hy' =
    router.locale === 'ru' || router.locale === 'hy' ? router.locale : 'en';
  const copy = auth[locale].consumePage;

  const [state, setState] = useState<ConsumeState>({ kind: 'loading' });
  const startedRef = useRef(false);

  useEffect(() => {
    if (!router.isReady) return;
    if (startedRef.current) return;
    if (session.status === 'loading') return;

    startedRef.current = true;

    const token = router.query.token;
    const tokenStr = Array.isArray(token) ? token[0] : token;

    if (!tokenStr) {
      router.replace('/');
      return;
    }

    const run = async () => {
      const hadSession =
        session.status === 'authenticated' ||
        (typeof window !== 'undefined' &&
          !!localStorage.getItem('accessToken'));
      if (hadSession) {
        await tearDownExistingSession();
      }

      const result = await consumeMagicLink(tokenStr);

      if ('code' in result) {
        if (
          result.code === 'INVALID_TOKEN' ||
          result.code === 'TOKEN_EXPIRED' ||
          result.code === 'TOKEN_ALREADY_USED'
        ) {
          setState({ kind: 'invalidLink' });
          return;
        }
        if (result.status === 403 || result.code === 'USER_BLOCKED') {
          setState({ kind: 'blocked', message: result.message });
          return;
        }
        setState({ kind: 'invalidLink' });
        return;
      }

      const data = result.data;
      if ('requiresProfile' in data && data.requiresProfile) {
        setState({
          kind: 'profile',
          registrationToken: data.registrationToken,
          email: data.email,
        });
        return;
      }

      if ('jwt' in data && data.jwt) {
        storeJwtSession(data.jwt, data.user, setAccountData, setToken);
        const redirectUrl = getRedirectCookie() || '/uxcore';
        deleteRedirectCookie();
        window.location.href = redirectUrl;
      }
    };

    run();
  }, [
    router,
    router.isReady,
    router.query.token,
    session.status,
    setAccountData,
    setToken,
  ]);

  if (state.kind === 'loading') {
    return <Spinner visible />;
  }

  if (state.kind === 'profile') {
    return (
      <div className={styles.page}>
        <MagicLinkProfileForm
          registrationToken={state.registrationToken}
          email={state.email}
        />
      </div>
    );
  }

  if (state.kind === 'blocked') {
    return (
      <div className={styles.page}>
        <div
          className={styles.errorCard}
          data-cy="magic-link-blocked"
          role="alert"
        >
          <h1 className={styles.title}>{copy.blocked.title}</h1>
          {state.message && <p className={styles.body}>{state.message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div
        className={styles.errorCard}
        data-cy="magic-link-invalid"
        role="alert"
      >
        <h1 className={styles.title}>{copy.invalidLink.title}</h1>
        <p className={styles.body}>{copy.invalidLink.body}</p>
        <button
          type="button"
          className={styles.cta}
          onClick={() => router.push('/')}
          data-cy="magic-link-request-new"
        >
          {copy.invalidLink.cta}
        </button>
      </div>
    </div>
  );
};

export default MagicLinkConsumePage;
