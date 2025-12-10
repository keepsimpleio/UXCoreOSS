import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import type { TRouter } from '@local-types/global';
import Image from 'next/image';
import cn from 'classnames';

import { GlobalContext } from '@components/Context/GlobalContext';
import UserDropdown from '@components/UserDropdown';
import SettingsModal from '@components/SettingsModal';
import LanguageSwitcher from '@components/LanguageSwitcher';

import PodcastIcon from '@icons/PodcastIcon';

import { isLevelMilestone } from '@lib/uxcat-helpers';

import toolHeaderData from '@data/toolHeader';

import { userInfoUpdate } from '@api/uxcat/settings';
import { getMyInfo } from '@api/strapi';
import { getUserInfo } from '@api/uxcat/users-me';

import { UserTypes } from '@local-types/uxcat-types/types';

import styles from './MobileHeader.module.scss';

type MobileHeaderProps = {
  setHeaderPodcastOpen?: (updater: (prev: boolean) => boolean) => void;
  setUpdatedSettingsInfo?: (data: UserTypes) => void;
  isPodcastOpen?: boolean;
  changeUserUrl?: boolean;
  instantSave?: boolean;
  isUserProfile?: boolean;
  setSelectedTitle?: (title: string) => void;
  disablePageSwitcher?: boolean;
  userInfo: UserTypes;
  setUserInfo: (data: UserTypes) => void;
  setUpdatedUsername?: (username: string) => void;
  blockLanguageSwitcher?: boolean;
};
const MobileHeader: FC<MobileHeaderProps> = ({
  setHeaderPodcastOpen,
  isPodcastOpen,
  changeUserUrl,
  setSelectedTitle,
  isUserProfile,
  disablePageSwitcher,
  userInfo,
  setUserInfo,
  setUpdatedUsername,
  blockLanguageSwitcher,
}) => {
  const router = useRouter();
  const { locale } = router as TRouter;
  const { accountData, setAccountData } = useContext(GlobalContext);
  const { usernameIsTaken, settingsTxt, myProfileTxt } = toolHeaderData[locale];
  const imageSrc = useMemo(() => accountData?.picture, [accountData]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [usernameIsTakenError, setUsernameIsTakenError] = useState('');
  const [changedTitle, setChangedTitle] = useState(false);
  const changeTitlePermission = isLevelMilestone(userInfo?.level, 13);

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

  const title = changedTitle ? userInfo?.title : userInfo?.title;
  const openPodcast = () => {
    setHeaderPodcastOpen(prev => !prev);
  };

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
    const token =
      (typeof window !== undefined && localStorage.getItem('accessToken')) ||
      localStorage.getItem('googleToken');
    setToken(token);
  }, []);

  useEffect(() => {
    if (isUserProfile) {
      setSelectedTitle &&
        setSelectedTitle(locale === 'en' ? title : russianTitles(title));
    }
  }, [title, locale]);

  return (
    <div
      className={cn(styles.MobileHeader, {
        [styles.disablePageSwitcher]: disablePageSwitcher,
      })}
    >
      <div className={styles.SiteName}>
        <a href={`/${locale === 'ru' ? 'ru' : ''}`} target="_self">
          <Image
            src="/assets/logos/keepsimple.svg"
            alt="keepsimple logo"
            width={130.61}
            height={25.87}
            className={styles.logo}
          />
        </a>
      </div>
      <div className={styles.Actions}>
        {router.asPath === '/uxcore' && locale !== 'hy' && (
          <div
            className={cn(styles.PodcastWrapper, {
              [styles.active]: isPodcastOpen,
            })}
            onClick={openPodcast}
          >
            <PodcastIcon />
          </div>
        )}
        <LanguageSwitcher
          withFlag
          withText={false}
          blockLanguageSwitcher={blockLanguageSwitcher}
        />
        <UserDropdown
          userName={currentUsername}
          userImage={imageSrc}
          showDropdown={showDropdown}
          isLoggedIn={!!accountData}
          setShowDropdown={setShowDropdown}
          setAccountData={setAccountData}
          handleOpenSettings={handleOpenSettings}
          settingsTxt={settingsTxt}
          myProfileTxt={myProfileTxt}
        />
      </div>
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
          defaultSelectedTitle={locale === 'en' ? title : russianTitles(title)}
          changeTitlePermission={changeTitlePermission}
          setChangedTitle={setChangedTitle}
        />
      )}
    </div>
  );
};

export default MobileHeader;
