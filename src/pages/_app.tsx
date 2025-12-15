import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import ReactGA from 'react-ga4';
import { SessionProvider } from 'next-auth/react';
import dynamic from 'next/dynamic';
import mixpanel, { initMixpanel, trackPageView } from '../../lib/mixpanel';

import FormPopup from '@components/FormPopup';
import { GlobalContext } from '@components/Context/GlobalContext';
import Box from 'src/components/Box';
import NewUpdateModal from '@components/NewUpdateModal/NewUpdateModal';

import useSpinner from '@hooks/useSpinner';
import useUXCGGlobals from '@hooks/useUXCGGlobals';
import useUXCoreGlobals from '@hooks/useUXCoreGlobals';
import useMobile from '@hooks/useMobile';
import useGlobals from '@hooks/useGlobals';

import { getMyInfo, getSettings } from '@api/strapi';
import { getStrapiBiases } from '@api/biases';
import { getStrapiQuestions } from '@api/questions';
import { getUserInfo } from '@api/uxcat/users-me';
import { authenticate } from '@api/auth';
import { getNewUpdate } from '@api/new-updates';

import { mergeQuestionsLocalization } from '@lib/helpers';

import '../styles/globals.scss';

const UXCoreFeedbackModal = dynamic(
  () => import('@components/UXCoreFeedbackModal'),
  {
    ssr: false,
  },
);
const UXCorePleaseShareModal = dynamic(
  () => import('@components/UXCorePleaseShareModal'),
  {
    ssr: false,
  },
);
const ChristmasPopup = dynamic(() => import('@components/ChristmasPopup'), {
  ssr: false,
});

const defaultSettings = {
  feedback: false,
  helpToHelp: false,
  pleaseShare: false,
  feedbackSeconds: 0,
  helpToHelpSeconds: 0,
  pleaseShareSeconds: 0,
};

type TApp = {
  Component: any;
  pageProps: any;
};

function App({ Component, pageProps: { session, ...pageProps } }: TApp) {
  const [openPopup, setOpenPopup] = useState('');
  const [settings, setSettings] = useState(defaultSettings);
  const [uxcatUserInfo, setUxcatUserInfo] = useState(null);
  const [newUpdateModalData, setNewUpdateModalData] = useState(null);
  const [cookieBoxIsSeen, setCookieBoxIsSeen] = useState(false);
  const [isCookieStateLoaded, setIsCookieStateLoaded] = useState(false);
  const [isNewUpdateModalVisible, setIsNewUpdateModalVisible] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const loadingTimer = useRef(null);

  const [accountData, setAccountData] = useState(null);
  const [token, setToken] = useState(null);
  const [uxCoreData, setUxCoreData] = useState(null);
  const [uxcgData, setUxcgData] = useState(null);
  const [uxcgLocalizedData, setUxcgLocalizedData] = useState(null);
  const isIndexingOn = process.env.NEXT_PUBLIC_INDEXING === 'on';
  const isProduction = process.env.NEXT_PUBLIC_ENV === 'prod';
  const { initUseUXCoreGlobals } = useUXCoreGlobals()[0];
  const { initUseUXCGGlobals } = useUXCGGlobals()[0];
  const { initUseMobile } = useMobile()[0];
  const { events } = useRouter();
  const { setIsVisible } = useSpinner()[0];
  const { isDarkTheme } = useGlobals()[1];

  useEffect(() => {
    const authenticateUser = async () => {
      if (session?.user && session.accessToken) {
        try {
          await authenticate(token, setAccountData, setToken);
        } catch (error) {
          console.error('Authentication failed:', error);
        }
      }
    };

    authenticateUser();
  }, [session]);

  const {
    feedbackSeconds,
    helpToHelpSeconds,
    pleaseShareSeconds,
    feedback: feedbackEnabled,
    helpToHelp: helpToHelpEnabled,
    pleaseShare: pleaseShareEnabled,
  } = settings;

  const COOKIE_NAME = 'cookieBoxIsSeen';
  const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

  const getCookie = (name: string) => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith(`${name}=`))
      ?.split('=')[1];
  };

  function getBaseDomain(hostname: string) {
    const parts = hostname.split('.');
    if (parts.length <= 2) return hostname;
    return `.${parts.slice(-2).join('.')}`;
  }

  const handleAccept = () => {
    setCookieBoxIsSeen(true);

    const hostname = window.location.hostname;
    const shouldShareAcrossSubdomains = true;
    const cookieDomain = shouldShareAcrossSubdomains
      ? getBaseDomain(hostname)
      : null;
    let cookieString = `${COOKIE_NAME}=true; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;

    if (cookieDomain) cookieString += `; Domain=${cookieDomain}`;
    if (window.location.protocol === 'https:') cookieString += '; Secure';

    document.cookie = cookieString;
  };

  useEffect(() => {
    const isSeen = getCookie(COOKIE_NAME);
    if (isSeen === 'true') setCookieBoxIsSeen(true);
    setIsCookieStateLoaded(true);
  }, []);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await getMyInfo();
        if (data) {
          setAccountData(data);
        } else {
          console.warn('Data is null, skipping update.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    getData();
  }, []);

  useEffect(() => {
    const getData = async () => {
      const data = await getUserInfo(token);
      if (data) {
        setUxcatUserInfo(data);
      }
    };

    getData().then(r => r);
  }, [token]);

  // Sharable uxcore data
  useEffect(() => {
    const getBiases = async () => {
      const biases = await getStrapiBiases();
      setUxCoreData(biases);
    };
    setUxCoreData(getBiases);
  }, []);

  // Sharable uxcg data - available for only uxcore links
  useEffect(() => {
    const getQuestions = async () => {
      const questions = await getStrapiQuestions();
      const sortedQuestions = mergeQuestionsLocalization(
        questions.en,
        questions.ru,
      ).sort((a, b) => a.number - b.number);
      setUxcgData(sortedQuestions);
      setUxcgLocalizedData(questions);
    };
    getQuestions().then(r => r);
  }, []);

  useEffect(() => {
    events.on('routeChangeStart', () => {
      clearTimeout(loadingTimer.current);
      loadingTimer.current = setTimeout(() => {
        setIsVisible(true);
      }, 500);
    });

    events.on('routeChangeComplete', url => {
      if (isIndexingOn && isProduction) {
        ReactGA.set({ page: url });
        ReactGA.send(url);
      }

      clearTimeout(loadingTimer.current);
      setIsVisible(false);
    });

    events.on('routeChangeError', () => {
      clearTimeout(loadingTimer.current);
      setIsVisible(false);
    });
  }, []);

  useEffect(() => {
    initUseUXCoreGlobals();
    initUseUXCGGlobals();
    initUseMobile();

    if (isIndexingOn && isProduction) {
      ReactGA.initialize(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
      setTimeout(() => {
        ReactGA.set({ page: window.location.pathname });
        ReactGA.send(window.location.pathname);
      }, 0);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      feedbackEnabled && setOpenPopup('feedback');
    }, feedbackSeconds * 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [feedbackEnabled, feedbackSeconds]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      pleaseShareEnabled && setOpenPopup('pleaseShare');
    }, pleaseShareSeconds * 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [pleaseShareEnabled, pleaseShareSeconds]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      helpToHelpEnabled && setOpenPopup('helpToHelp');
    }, helpToHelpSeconds * 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [helpToHelpEnabled, helpToHelpSeconds]);

  useEffect(() => {
    getSettings().then(settings => {
      setSettings(settings);
    });
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    const getData = async () => {
      try {
        const locale = router.locale === 'ru' ? 'ru' : 'en';
        const data = await getNewUpdate(locale);

        if (data) setNewUpdateModalData(data);
      } catch (error) {
        console.error('Error fetching new update data:', error);
      }
    };

    getData();
  }, [router.isReady, router.locale]);

  useEffect(() => {
    const hasSeen = document.cookie.includes('updateModalSeen=true');
    if (hasSeen) return;

    if (!newUpdateModalData?.['Frontend modal visibility']) return;
    const appearsAfter = newUpdateModalData['Appears after ... seconds'];

    const timeout = setTimeout(() => {
      setIsNewUpdateModalVisible(true);
    }, appearsAfter * 1000);

    return () => clearTimeout(timeout);
  }, [newUpdateModalData, newUpdateModalData?.['Appears after ... seconds']]);

  const handleCloseModal = () => {
    setIsNewUpdateModalVisible(false);

    document.cookie = 'updateModalSeen=true; path=/; max-age=31536000';
  };

  useEffect(() => {
    const html = document.documentElement;

    html.classList.remove('scroll-style-articles');

    if (
      router.pathname === '/' ||
      router.pathname === '/articles' ||
      router.asPath.startsWith('/articles/')
    ) {
      html.classList.add('scroll-style-articles');
    }
  }, [router.pathname, router.asPath]);

  useEffect(() => {
    const isPage = router.pathname === '/' || router.pathname === '/articles';
    document.body.classList.toggle('keepsimplePages', isPage && !isDarkTheme);
    document.body.classList.toggle(
      'keepsimplePagesDark',
      isPage && isDarkTheme,
    );
  }, [router.pathname, isDarkTheme]);

  useEffect(() => {
    initMixpanel();
    trackPageView(window.location.pathname);

    const handleRouteChange = (url: string) => {
      trackPageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, []);

  useEffect(() => {
    if (!accountData?.id || !accountData?.createdAt) return;

    mixpanel.identify(accountData.id);

    const isNewUser = new Date(accountData.createdAt) >= new Date('2025-06-01');

    if (isNewUser) {
      mixpanel.track('New User', {
        id: accountData.id,
        username: accountData.username,
        createdAt: accountData.createdAt,
      });

      mixpanel.people.set({
        $name: accountData.username,
        $created: accountData.createdAt,
        id: accountData.id,
      });
    }
  }, [accountData?.id, accountData?.createdAt]);

  return (
    <SessionProvider session={session}>
      <GlobalContext.Provider
        value={{
          accountData,
          setAccountData,
          uxCoreData,
          setUxCoreData,
          setUxcgData,
          uxcgData,
          setUxcatUserInfo,
          uxcatUserInfo,
          setToken,
          setUxcgLocalizedData,
          uxcgLocalizedData,
          showLoader,
          setShowLoader,
          videoRef,
        }}
      >
        <Component {...pageProps} />
        {feedbackEnabled && (
          <UXCoreFeedbackModal open={openPopup === 'feedback'} />
        )}
        {pleaseShareEnabled && (
          <UXCorePleaseShareModal open={openPopup === 'pleaseShare'} />
        )}
        {helpToHelpEnabled && (
          <ChristmasPopup open={openPopup === 'helpToHelp'} />
        )}
        {isCookieStateLoaded && !cookieBoxIsSeen && (
          <Box setIsSeen={handleAccept} />
        )}
        {isNewUpdateModalVisible && (
          <NewUpdateModal
            data={newUpdateModalData}
            onClose={handleCloseModal}
          />
        )}
        <FormPopup />
      </GlobalContext.Provider>
    </SessionProvider>
  );
}

export default App;
