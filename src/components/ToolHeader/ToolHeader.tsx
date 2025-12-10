import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import cn from 'classnames';
import dynamic from 'next/dynamic';

import type { TagType } from '@local-types/data';
import type { TRouter } from '@local-types/global';
import { UserTypes } from '@local-types/uxcat-types/types';

import Link from '@components/NextLink';
import PageSwitcher from '@components/PageSwitcher';
import UserDropdown from '@components/UserDropdown';
import MobileHeader from '@components/_biases/MobileHeader';
import UsfulLinksDropdown from '@components/UsfulLinksDropdown';
import UsefulLinksContent from '@components/UsefulLinksContent';
import { GlobalContext } from '@components/Context/GlobalContext';
import LanguageSwitcher from '@components/LanguageSwitcher';

import { navItems } from './navItems';

import useMobile from '@hooks/useMobile';
import useUXCoreGlobals from '@hooks/useUXCoreGlobals';

import { userInfoUpdate } from '@api/uxcat/settings';
import { getUserInfo } from '@api/uxcat/users-me';
import { getMyInfo } from '@api/strapi';

import toolHeaderData from '@data/toolHeader';

import PodcastIcon from '@icons/PodcastIcon';
import DiamondIcon from '@icons/DiamondIcon';
import CloseIcon from '@icons/CloseIcon';

import { isLevelMilestone } from '@lib/uxcat-helpers';

import styles from './ToolHeader.module.scss';

const SettingsModal = dynamic(() => import('@components/SettingsModal'), {
  ssr: false,
});

type TToolHeader = {
  page?: 'uxcp' | 'uxcg' | 'uxcore' | 'uxeducation' | 'uxcat';
  homepageLinkTarget?: '_blank' | '_self';
  tags: TagType[];
  openPodcast?: boolean;
  showSavedPersonas?: boolean;
  setOpenPodcast?: (updater: (prev: boolean) => boolean) => void;
  openPersonaModal?: (openPersona: boolean) => void;
  changeUserUrl?: boolean;
  setSelectedTitle?: (selected: string) => void;
  disablePageSwitcher?: boolean;
  userInfo?: UserTypes;
  setUserInfo?: (data: UserTypes) => void;
  setUpdatedUsername?: (username: string) => void;
  blockLanguageSwitcher?: boolean;
};

const ToolHeader: FC<TToolHeader> = ({
  page,
  homepageLinkTarget = '_self',
  openPodcast,
  tags,
  setOpenPodcast,
  openPersonaModal,
  showSavedPersonas = true,
  changeUserUrl,
  setSelectedTitle,
  disablePageSwitcher,
  userInfo,
  setUserInfo,
  setUpdatedUsername,
  blockLanguageSwitcher,
}) => {
  const router = useRouter();
  const { isMobile } = useMobile()[1];
  const [, { isCoreView }] = useUXCoreGlobals();
  const { accountData, setAccountData } = useContext(GlobalContext);
  const { locale, asPath } = router as TRouter;

  const {
    usefulLinksLabel,
    usernameIsTaken,
    settingsTxt,
    myProfileTxt,
    bobName,
    awarenessTest,
    podcast,
    findSolutions,
    learnAboutUXCore,
  } = toolHeaderData[locale];
  const imageSrc = useMemo(() => accountData?.picture, [accountData]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUxcoreTooltip, toggleUxcoreHeaderTooltip] = useState(true);
  const [showUxcgTooltip, toggleUxcgHeaderTooltip] = useState(true);
  const [openSettings, setOpenSettings] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [usernameIsTakenError, setUsernameIsTakenError] = useState('');
  const [changedTitle, setChangedTitle] = useState(false);

  const currentUsername = accountData
    ? accountData.username
    : accountData?.username;

  const currentEmail = accountData && accountData.email;

  const publicEmail = accountData && accountData.publicEmail;

  const linkedIn = userInfo?.user?.linkedin
    ? userInfo?.user?.linkedin
    : userInfo?.linkedin;

  const linkedInStatus = accountData
    ? accountData.publicLinkedin
    : accountData?.publicLinkedin;

  const level = userInfo?.user?.level ? userInfo?.user?.level : userInfo?.level;
  const changeTitlePermission = isLevelMilestone(level, 13);
  const userTitlesRu = ['Просвещенный', 'Профессор', 'Великий'];
  const russianTitles = selectedTitle => {
    if (!selectedTitle) {
      return null;
    }
    return selectedTitle === 'Enlightened'
      ? userTitlesRu[0]
      : selectedTitle === 'Professor'
        ? userTitlesRu[1]
        : userTitlesRu[2];
  };

  const title = changedTitle ? userInfo?.title : userInfo?.user?.title;

  const openPodcastHandler = useCallback(() => {
    setOpenPodcast(prev => !prev);
  }, []);

  const handleOpenSettings = () => {
    setOpenSettings(true);
  };

  const handleSaveClick = async (
    username: string,
    linkedInUrl: string,
    isEmailPublic: string,
    isLinkedinPublic: string,
    title?: string,
  ) => {
    const mailIsPublic = isEmailPublic === 'everyone';
    const linkedInIsPublic = isLinkedinPublic === 'everyone';
    try {
      await userInfoUpdate(
        token,
        username,
        linkedInUrl,
        mailIsPublic,
        linkedInIsPublic,
        title,
      );

      const data = await getMyInfo();
      if (changeUserUrl) {
        await router.replace(`/user/${username}`);
      }
      setAccountData(data);
      setOpenSettings(false);
      setUsernameIsTakenError('');
      const userData = await getUserInfo();
      setUserInfo(userData?.user);
      setUpdatedUsername && setUpdatedUsername(username);
    } catch (error) {
      setOpenSettings(true);
      setUsernameIsTakenError(usernameIsTaken);
    }
  };

  useEffect(() => {
    const initialUxcoreTooltip = JSON.parse(
      localStorage.getItem('toggleUxcoreHeaderTooltipNew') || 'true',
    );
    const initialUxcgTooltip = JSON.parse(
      localStorage.getItem('toggleUxcgHeaderTooltipNew') || 'true',
    );

    toggleUxcoreHeaderTooltip(initialUxcoreTooltip);
    toggleUxcgHeaderTooltip(initialUxcgTooltip);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'toggleUxcoreHeaderTooltipNew',
      JSON.stringify(showUxcoreTooltip),
    );
  }, [showUxcoreTooltip]);

  useEffect(() => {
    localStorage.setItem(
      'toggleUxcgHeaderTooltipNew',
      JSON.stringify(showUxcgTooltip),
    );
  }, [showUxcgTooltip]);

  useEffect(() => {
    const token =
      (typeof window !== undefined && localStorage.getItem('accessToken')) ||
      localStorage.getItem('googleToken');
    setToken(token);
  }, []);

  useEffect(() => {
    if (userInfo) {
      setSelectedTitle &&
        setSelectedTitle(locale === 'en' ? title : russianTitles(title));
    }
  }, [title, locale, userInfo]);

  return (
    <header className={styles.ToolHeader}>
      <div className={styles.mobile}>
        <MobileHeader
          disablePageSwitcher={disablePageSwitcher}
          userInfo={userInfo}
          setUserInfo={setUserInfo}
          changeUserUrl={!!changeUserUrl && changeUserUrl}
          setUpdatedUsername={!!setUpdatedUsername && setUpdatedUsername}
          blockLanguageSwitcher={blockLanguageSwitcher}
        />
        {!disablePageSwitcher && (
          <div className={styles.PageSwitcherContainer}>
            <UsfulLinksDropdown tags={tags} page={page} />
            <PageSwitcher page={page} />
          </div>
        )}
      </div>
      <>
        {!isMobile && (
          <div className={styles.LinkWrapper}>
            <Link href="/" locale={locale} legacyBehavior>
              <a target={homepageLinkTarget} className={styles.logo}>
                <Image
                  src={'/assets/logos/keepsimple.svg'}
                  alt="keepsimple logo"
                  width={130.61}
                  height={25.87}
                />
              </a>
            </Link>
            <div className={styles.Links}>
              {navItems.map(({ label, href, page: itemPage, icon }, index) => (
                <Link key={index} href={href} locale={locale} legacyBehavior>
                  <a
                    className={cn(styles.MenuItem, {
                      [styles.Active]: itemPage === page,
                    })}
                    target={label === 'Bob - AI Assistant' ? '_blank' : '_self'}
                    onClick={() => {
                      toggleUxcoreHeaderTooltip(false);
                      toggleUxcgHeaderTooltip(false);
                    }}
                  >
                    {label != 'Bob - AI Assistant' ? (
                      icon
                    ) : (
                      <Image
                        src={'/assets/Bob.png'}
                        alt={'Bob - AI Assistant'}
                        width={25}
                        height={25}
                        className={styles.bob}
                      />
                    )}
                    <span className={styles.Description}>
                      {label === 'Bob - AI Assistant'
                        ? bobName
                          ? bobName
                          : label
                        : label === 'Awareness Test'
                          ? awarenessTest
                          : label}
                    </span>
                    {label === 'Bob - AI Assistant' && (
                      <Image
                        src={'/assets/open-link.svg'}
                        alt={'New link icon'}
                        width={17}
                        height={16}
                        className={styles.openLink}
                      />
                    )}
                  </a>
                </Link>
              ))}
            </div>

            {showUxcgTooltip && asPath === '/uxcore' && (
              <div
                className={cn(styles.headerTooltipUxCore)}
                data-cy={'uxcg-informative-tooltip'}
              >
                <span>{findSolutions}</span>
                <button
                  className={styles.closeBtn}
                  onClick={() => {
                    toggleUxcgHeaderTooltip(false);
                  }}
                >
                  <CloseIcon />
                </button>
              </div>
            )}
            {showUxcoreTooltip && asPath === '/uxcg' && (
              <div
                className={cn(styles.headerTooltipUxcg, {
                  [styles.headerTooltipUxcgHy]: locale === 'hy',
                })}
                data-cy={'uxcore-informative-tooltip'}
              >
                <span>{learnAboutUXCore}</span>
                <button
                  className={styles.closeBtn}
                  onClick={() => {
                    toggleUxcoreHeaderTooltip(false);
                  }}
                >
                  <CloseIcon />
                </button>
              </div>
            )}
          </div>
        )}

        {!isMobile && (
          <div
            className={cn(styles.UsefulLinksWrapper, {
              [styles.authorized]: !!accountData,
            })}
          >
            {isCoreView && asPath === '/uxcore' && locale !== 'hy' && (
              <div
                onClick={openPodcastHandler}
                className={cn(styles.MenuItem, {
                  [styles.Active]: !!openPodcast,
                })}
                data-cy={'podcast-button'}
              >
                <PodcastIcon />
                <span>{podcast}</span>
              </div>
            )}
            <span
              className={cn(styles.MenuItem, {
                [styles.MenuItemHy]: locale === 'hy',
              })}
            >
              <DiamondIcon />
              <span className={styles.Description}>{usefulLinksLabel}</span>
              <UsefulLinksContent tags={tags} page={page} />
            </span>
            <div
              className={cn(styles.actions, {
                [styles.authorized]: !!accountData,
              })}
            >
              <LanguageSwitcher
                withFlag
                withText={false}
                detectingLangSwitch
                blockLanguageSwitcher={blockLanguageSwitcher}
              />
              <div className={styles.userMenu}>
                <UserDropdown
                  userName={currentUsername}
                  userImage={
                    userInfo?.user?.picture ? userInfo?.user?.picture : imageSrc
                  }
                  showDropdown={showDropdown}
                  isLoggedIn={!!accountData}
                  setShowDropdown={setShowDropdown}
                  setAccountData={setAccountData}
                  openSavedPersonas={openPersonaModal}
                  showSavedPersonas={showSavedPersonas}
                  handleOpenSettings={handleOpenSettings}
                  settingsTxt={settingsTxt}
                  myProfileTxt={myProfileTxt}
                />
              </div>
            </div>
          </div>
        )}
        {openSettings && (
          <SettingsModal
            setOpenSettings={setOpenSettings}
            currentUsername={currentUsername}
            currentEmail={currentEmail}
            mailStatus={publicEmail}
            linkedin={linkedIn}
            linkedinStatus={linkedInStatus}
            handleSaveClick={handleSaveClick}
            setUsernameIsTakenError={setUsernameIsTakenError}
            usernameIsTakenError={usernameIsTakenError}
            defaultSelectedTitle={
              locale === 'en' ? title : russianTitles(title)
            }
            changeTitlePermission={changeTitlePermission}
            setChangedTitle={setChangedTitle}
          />
        )}
      </>
    </header>
  );
};

export default ToolHeader;
