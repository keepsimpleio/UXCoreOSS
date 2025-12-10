import React, { FC, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { resetServerContext } from 'react-beautiful-dnd';
import cn from 'classnames';

import useMobile from '@hooks/useMobile';

import { isValidEmail } from '@lib/uxcat-helpers';

import { TRouter } from '@local-types/global';
import type { UserProfileProps } from './UserProfile.types';

import Toasts from '@components/Toasts';
import Dropdown from '@components/Dropdown';
import Statistics from '@components/Statistics';
import ToolHeader from '@components/ToolHeader';
import StartTestBtn from '@components/StartTestBtn';
import LogInModal from '@components/_uxcp/LogInModal';
import AccountHeader from '@components/AccountHeader';
import CompletionBar from '@components/CompletionBar';
import UXCatPageTitle from '@components/UXCatPageTitle';
import SavedPersonas from '@components/_uxcp/SavedPersonas';
import AchievementsBoard from '@components/AchievementsBoard';

import uxcatData from '@data/uxcat';
import decisionTable from '@data/decisionTable';
import modalData from '@data/uxcat/imageSelectModal';
import userProfileData from '@data/uxcat/userProfile';

import { getPersonaList } from '@api/personas';
import { getUserInfo } from '@api/uxcat/users-me';
import { updateBackgroundImage, updateCoverImage } from '@api/strapi';
import { sendRef } from '@api/uxcat/sendRef';

import styles from './UserProfile.module.scss';

const SelectImageModal = dynamic(() => import('@components/SelectImageModal'), {
  ssr: false,
});

const UserProfile: FC<UserProfileProps> = ({
  tags,
  userInfo,
  dummyBoardContent,
  coverImages,
  ongoingTest,
  backgroundImages,
  privateMode,
  statistics,
  level,
  matchingLevelDetails,
  levelName,
  levelsDetails,
  specialAchievements,
  setIsAllSelected,
  receivedAchievementPercentage,
  isLoading,
  publicStartTestRef,
  generalAchievements,
  finalTestPermission,
  isLevelMilestone,
  keepsimpleAchievements,
  isFinalTestInProgress,
  userLevels,
  shortInfo,
  uxcatLevels,
  notifiedAchievements,
  accessToken,
  isTestResultsAvailable,
  disableStartTest,
  nextTestTime,
  hasSpecialAchievements,
  headerUserInfo,
  setHeaderUserInfo,
}) => {
  const { isMobile } = useMobile()[1];
  const router = useRouter();
  const { locale } = router as TRouter;
  const currentLocale = locale === 'ru' ? 'ru' : 'en';
  const scrollToAchievementsRef = useRef(null);

  const [openCoverImgModal, setOpenCoverImgModal] = useState<boolean>(false);
  const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);
  const [openBgImgModal, setOpenBgImgModal] = useState<boolean>(false);
  const [openPersonas, setOpenPersonas] = useState<boolean>(false);
  const [achievements, setAchievements] = useState(dummyBoardContent);
  const [personas, setPersonas] = useState(null);
  const [token, setToken] = useState(undefined);
  const [updatedData, setUpdatedData] = useState(userInfo);
  const [selectedTitle, setSelectedTitle] = useState('');

  const defaultCoverImage =
    matchingLevelDetails?.attributes.bgImage.data.attributes.url;
  const userBadge = matchingLevelDetails?.attributes?.badge.data.attributes.url;

  const awarenessPoints = userInfo?.points;
  const userData = !!updatedData ? updatedData : userInfo;

  const changedCoverImage = updatedData
    ? updatedData?.coverImageUrl
    : userInfo?.coverImageUrl;

  const backgroundImage = updatedData
    ? updatedData?.bgImageUrl
    : userInfo?.bgImageUrl;

  const coverImage = changedCoverImage ? changedCoverImage : defaultCoverImage;

  const linkedIn = userInfo?.linkedin || headerUserInfo?.linkedin;

  const username = headerUserInfo?.user?.username
    ? headerUserInfo?.user?.username
    : userInfo?.username;

  const { savedPersonasTitles } = decisionTable[locale];
  const { selectCoverImg, selectBgImg } = modalData[currentLocale];
  const userTitle = selectedTitle ? selectedTitle : userInfo?.title;
  const { achievementTxt, myAchievements, showTxt, achievementTooltip } =
    userProfileData[currentLocale];

  const {
    yourPointsTxt,
    allTxt,
    achievedOnlyTxt,
    hiddenAchievement,
    lvlShort,
    lvlProgression,
    myLevelProgression,
    yourPointsUserPage,
  } = uxcatData[currentLocale];

  const handleStartTestClick = async () => {
    await router.push(ongoingTest ? '/uxcat/ongoing' : '/uxcat/start-test');
    !privateMode && (await sendRef(publicStartTestRef, token));
  };

  function handleOnDragEnd(result) {
    if (!result.destination) return;

    const items = Array.from(achievements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setAchievements(items);
  }

  resetServerContext();

  const updateCoverImg = async url => {
    try {
      await updateCoverImage(token, url);
      const data = await getUserInfo();
      setUpdatedData(data.user);
    } catch (error) {
      console.error('Failed to update cover image', error);
    }
  };

  const updateBackgroundImg = async url => {
    try {
      await updateBackgroundImage(token, url);
      const data = await getUserInfo();
      setUpdatedData(data.user);
    } catch (error) {
      console.error('Failed to update cover image', error);
    }
  };

  useEffect(() => {
    const token =
      (typeof window !== undefined && localStorage.getItem('accessToken')) ||
      localStorage.getItem('googleToken');
    setToken(token);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getPersonaList();
      setPersonas(result);
    };

    fetchData().then(r => r);
  }, []);

  useEffect(() => {
    const shouldScroll = localStorage.getItem('showAllAchievements') === 'true';

    if (shouldScroll && scrollToAchievementsRef.current) {
      const timer = setTimeout(() => {
        scrollToAchievementsRef.current.scrollIntoView({ behavior: 'smooth' });

        localStorage.removeItem('showAllAchievements');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <ToolHeader
        page={'uxcat'}
        tags={tags}
        openPersonaModal={setOpenPersonas}
        changeUserUrl={privateMode}
        setSelectedTitle={setSelectedTitle}
        disablePageSwitcher
        userInfo={headerUserInfo}
        setUserInfo={setHeaderUserInfo}
      />

      <section>
        <AccountHeader
          setOpenLoginModal={setOpenLoginModal}
          guestMode={!accessToken}
          awarenessPoints={awarenessPoints}
          level={level}
          username={username}
          setOpenCoverImgModal={setOpenCoverImgModal}
          linkedIn={linkedIn}
          email={isValidEmail(userData?.email) ? userData?.email : ''}
          coverImage={coverImage}
          nextTestTime={nextTestTime}
          ongoingTest={ongoingTest}
          handleStartTestClick={handleStartTestClick}
          privateMode={privateMode}
          levelTitle={levelName}
          userBadge={userBadge}
          topOf={Math.floor(userInfo?.rankingStatistics?.topOf)}
          rankPosition={Math.floor(userInfo?.rankingStatistics?.rank)}
          rankAndTopUpdate={userInfo?.rankingStatistics?.nextUpdateTime}
          finalTestPermission={finalTestPermission}
          isLevelMilestone={isLevelMilestone}
          isFinalTestInProgress={isFinalTestInProgress}
          title={privateMode ? userTitle : userInfo?.title}
          lvlShort={lvlShort}
          shortInfo={shortInfo}
          achievementTooltipTxt={achievementTooltip}
          disableStartTest={disableStartTest}
          yourPointsUserPage={yourPointsUserPage}
          levelDetails={matchingLevelDetails}
          isTestUser={userInfo?.isTestUser}
        />
        <div
          className={styles.userId}
          style={{
            backgroundImage: `url(${process.env.NEXT_PUBLIC_STRAPI}${backgroundImage})`,
          }}
        >
          {privateMode && isLevelMilestone(level, 15) && (
            <div className={styles.btnWrapper}>
              <button
                className={styles.imgUpload}
                onClick={() => setOpenBgImgModal(true)}
              >
                <Image
                  src="/assets/uxcat/image-upload.png"
                  alt="cover image"
                  width={16}
                  height={16}
                />
              </button>
            </div>
          )}
          <section
            className={cn(styles.body, {
              [styles.withFinalTestBtnBody]: finalTestPermission,
            })}
          >
            <CompletionBar
              titleBigFont
              points={userInfo?.points || 0}
              showTotal={privateMode && true}
              userLevel={!!level && level}
              testPoints={0}
              levelsDetails={levelsDetails}
              yourPointsTxt={yourPointsTxt}
              isMilestoneReached={isLevelMilestone(level, level)}
              userLevels={userLevels}
              uxCatLevels={uxcatLevels}
              isUserProfile
              lvlProgressionTxt={
                privateMode ? myLevelProgression : lvlProgression
              }
            />
            {privateMode && !!statistics && (
              <Statistics
                statistics={!!statistics && statistics}
                lastTestExisted={isTestResultsAvailable}
                isPrivateMode={privateMode}
              />
            )}
            <div className={styles.achievementsWrapper}>
              <UXCatPageTitle
                title={privateMode ? myAchievements : achievementTxt}
                bigFont
              />
              <div className={styles.dropdownWrapper}>
                {!isMobile && <span>{showTxt}</span>}
                <Dropdown
                  selected={allTxt}
                  values={[allTxt, achievedOnlyTxt]}
                  setIsAllSelected={setIsAllSelected}
                />
              </div>
            </div>
            <div ref={scrollToAchievementsRef}>
              <AchievementsBoard
                achievements={achievements}
                handleOnDragEnd={handleOnDragEnd}
                generalAchievements={generalAchievements}
                specialAchievements={specialAchievements}
                receivedAchievementPercentage={receivedAchievementPercentage}
                isLoading={isLoading}
                hiddenAchievement={hiddenAchievement}
                keepsimpleAchievements={keepsimpleAchievements}
              />
            </div>

            {privateMode && (
              <div className={styles.testBtnWrapper}>
                <StartTestBtn
                  nextTestTime={nextTestTime}
                  handleOpenTest={handleStartTestClick}
                  ongoingTest={ongoingTest}
                  className={styles['btn']}
                  buttonType={'orange'}
                  disabled={disableStartTest}
                />
              </div>
            )}
            <div className={styles.motto}>Be Kind. Do Good.</div>
          </section>
        </div>
        {openCoverImgModal && privateMode && (
          <SelectImageModal
            setCloseModal={setOpenCoverImgModal}
            title={selectCoverImg}
            images={coverImages}
            updateImage={updateCoverImg}
            imageURLExtractor={item => ({
              thumbnail:
                item.attributes.coverImage.data.attributes.formats.thumbnail
                  .url,
              image: item.attributes.coverImage.data.attributes.url,
            })}
            defaultImage={coverImage}
          />
        )}
        {openBgImgModal && (
          <SelectImageModal
            isBgImageModal
            updateImage={updateBackgroundImg}
            setCloseModal={setOpenBgImgModal}
            title={selectBgImg}
            images={backgroundImages}
            imageURLExtractor={item => ({
              thumbnail:
                item.attributes.bgImage.data.attributes.formats.thumbnail.url,
              image: item.attributes.bgImage.data.attributes.url,
            })}
            defaultImage={backgroundImage}
          />
        )}
        {openPersonas && (
          <SavedPersonas
            personaTableTitles={savedPersonasTitles}
            savedPersonas={personas}
            setOpenPersonas={setOpenPersonas}
            setSavedPersonas={setPersonas}
            changedUsername={username}
          />
        )}
        {!!notifiedAchievements ? (
          <Toasts
            accessToken={accessToken}
            notificationsData={notifiedAchievements}
          />
        ) : null}
        {openLoginModal && (
          <LogInModal setShowModal={setOpenLoginModal} source={'UXCat'} />
        )}
      </section>
    </>
  );
};

export default UserProfile;
