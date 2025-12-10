import React, { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import cn from 'classnames';
import dynamic from 'next/dynamic';

import type { TRouter } from '@local-types/global';
import type { UXCoreLayoutProps } from './UXCoreLayout.types';

import ToolFooter from '@components/ToolFooter';
import Spinner from '@components/Spinner';
import Search from '@components/_biases/Search';
import ToolHeader from '@components/ToolHeader';
import Logos from '@components/Logos';

import useUXCoreGlobals from '@hooks/useUXCoreGlobals';
import useUCoreMobile from '@hooks/uxcoreMobile';

import FolderIcon from '@icons/FolderIcon';
import CoreIcon from '@icons/CoreIcon';

import biasesLocalization from '@data/biases';
import biasesMobile from '@data/biasesMobile';

import { PMIcon } from '@icons/PMIcon';
import { HRIconGrey } from '@icons/HRIconGrey';
import { HRIconBlue } from '@icons/HRIconBlue';
import { PMIconGrey } from '@icons/PMIconGrey';

import styles from './UXCoreLayout.module.scss';

const FolderViewLayout = dynamic(() => import('@layouts/FolderViewLayout'), {
  ssr: false,
});
const CoreViewLayout = dynamic(() => import('@layouts/CoreViewLayout'), {
  ssr: false,
});

const UXCorePopup = dynamic(() => import('@components/UXCorePopup'), {
  ssr: false,
});

const UXCoreSnackbar = dynamic(() => import('@components/UXCoreSnackbar'), {
  ssr: false,
});

const ViewSwitcher = dynamic(() => import('@components/_biases/ViewSwitcher'), {
  ssr: false,
});
const MobileView = dynamic(() => import('@components/_biases/MobileView'), {
  ssr: false,
});

const UXCoreLayout: FC<UXCoreLayoutProps> = ({
  tags,
  strapiBiases,
  isOpen,
  biasSelected,
  openPodcast,
  setOpenPodcast,
  userInfo,
  setUserInfo,
  setOpenPersonas,
  uxcatUserInfo,
  setUxcatUserInfo = () => {},
  blockLanguageSwitcher,
  mounted,
  slug,
}) => {
  const [{ toggleIsCoreView }, { isCoreView }] = useUXCoreGlobals();
  const [{ toggleIsProductView }, { isProductView }] = useUXCoreGlobals();
  const router = useRouter();
  const { asPath } = router as TRouter;
  const { isUxcoreMobile } = useUCoreMobile()[1];
  const [isLoaded, setIsLoaded] = useState(false);
  const [snackBarText, setSnackBarText] = useState('');
  const [isSwitched, setIsSwitched] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [headerPodcastOpen, setHeaderPodcastOpen] = useState(false);
  const { locale } = router as TRouter;
  const data = biasesLocalization[locale];
  const { browsingAsProduct, browsingAsHR } = data;
  const { description } = biasesMobile[locale];

  useEffect(() => {
    if (!mounted) return;

    const hasHr = window.location.hash === '#hr';

    if (hasHr && isProductView) {
      toggleIsProductView();
    }
  }, [mounted]);

  useEffect(() => {
    setIsLoaded(true);
  }, [router.events, asPath]);

  useEffect(() => {
    if (!mounted) return;

    const localePrefix = router.locale === 'en' ? '' : `/${router.locale}`;

    const basePath = `${localePrefix}/uxcore`;

    const shouldBeHash = isProductView ? '' : '#hr';

    const targetUrl = `${basePath}${shouldBeHash}`;

    const currentUrl = window.location.pathname + window.location.hash;

    if (currentUrl === targetUrl) return;

    window.history.replaceState(null, '', targetUrl);
  }, [mounted, isProductView, router.locale]);

  useEffect(() => {
    if (isSwitched !== undefined) {
      if (isProductView) {
        setSnackBarText(browsingAsProduct);
      } else {
        setSnackBarText(browsingAsHR);
      }
    }
  }, [isSwitched, isProductView, locale]);

  let snackbarTimeout: NodeJS.Timeout;
  const handleSnackbarOpening = () => {
    clearTimeout(snackbarTimeout);

    setShowSnackbar(true);
    snackbarTimeout = setTimeout(() => {
      setShowSnackbar(false);
    }, 2000);
    return () => clearTimeout(snackbarTimeout);
  };

  if (!isLoaded) {
    return <Spinner visible={true} />;
  }

  return (
    <>
      {!isUxcoreMobile && (
        <ToolHeader
          page="uxcore"
          tags={tags}
          openPersonaModal={setOpenPersonas}
          setOpenPodcast={setOpenPodcast}
          openPodcast={openPodcast}
          userInfo={uxcatUserInfo}
          setUserInfo={setUxcatUserInfo}
          blockLanguageSwitcher={blockLanguageSwitcher}
        />
      )}
      <section
        className={cn(styles.body, {
          [styles.openedModal]: biasSelected,
          [styles.hyLang]: locale === 'hy',
        })}
      >
        {!isUxcoreMobile && (
          <>
            <ViewSwitcher
              isSecondView={isCoreView}
              toggleIsCoreView={toggleIsCoreView}
              defaultVieWIcon={<CoreIcon />}
              secondViewLabel={'folder'}
              secondViewIcon={<FolderIcon />}
              className={styles.viewTypeSwitcher}
              labelViewType
              dataCy={'core-view-switcher'}
              dataCySecondView={'folder-view-switcher'}
            />
            <ViewSwitcher
              isSecondView={isProductView}
              toggleIsCoreView={toggleIsProductView}
              defaultViewLabel={'PM'}
              defaultVieWIcon={isProductView ? <PMIcon /> : <PMIconGrey />}
              secondViewIcon={isProductView ? <HRIconGrey /> : <HRIconBlue />}
              secondViewLabel={'hr'}
              secondText={'HR'}
              className={styles.viewTeamSwitcher}
              setIsSwitched={setIsSwitched}
              isSwitched={isSwitched}
              handleSnackbarOpening={handleSnackbarOpening}
              dataCy={'switch-product'}
              dataCySecondView={'switch-hr'}
            />
            {isCoreView && <Search biases={strapiBiases} />}
            {isCoreView && (
              <>
                <CoreViewLayout biases={strapiBiases} />
                {locale !== 'hy' && openPodcast && (
                  <UXCorePopup
                    setOpenPodcast={setOpenPodcast}
                    openPodcast={openPodcast}
                  />
                )}

                <Logos className={styles.Logos} />
              </>
            )}
            {!isCoreView && (
              <FolderViewLayout biases={strapiBiases} isOpen={isOpen} />
            )}
          </>
        )}
        <div className={styles.MobileView}>
          <MobileView
            isSecondView={isProductView}
            toggleIsCoreView={toggleIsProductView}
            defaultViewLabel={'PM'}
            secondViewLabel={'hr'}
            tags={tags}
            strapiBiases={strapiBiases}
            containerClassName={styles.body}
            setIsSwitched={setIsSwitched}
            isSwitched={isSwitched}
            isOpen={isOpen}
            hrText={'HR'}
            biasSelected={biasSelected}
            headerPodcastOpen={setHeaderPodcastOpen}
            isPodcastOpen={headerPodcastOpen}
            handleSnackbarOpening={handleSnackbarOpening}
            description={description}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            blockLanguageSwitcher={blockLanguageSwitcher}
          />
          <div>
            {headerPodcastOpen && (
              <UXCorePopup
                setOpenPodcast={setHeaderPodcastOpen}
                openPodcast={headerPodcastOpen}
              />
            )}
          </div>
        </div>
        <ToolFooter page="uxcore" tags={tags} />
        {!!snackBarText && (
          <UXCoreSnackbar
            text={snackBarText}
            showSnackbar={showSnackbar}
            isHy={locale === 'hy'}
          />
        )}
      </section>
    </>
  );
};

export default UXCoreLayout;
