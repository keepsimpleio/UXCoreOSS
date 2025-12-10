import React, { FC, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';

import { TRouter } from '@local-types/global';
import { TagType } from '@local-types/data';
import { UXCatDataTypes } from '@local-types/uxcat-types/types';

import StartTestLayout from '@layouts/StartTestLayout';

import SavedPersonas from '@components/_uxcp/SavedPersonas';
import Spinner from '@components/Spinner';
import { GlobalContext } from '@components/Context/GlobalContext';
import SeoGenerator from '@components/SeoGenerator';
import GenderModal from '@components/GenderModal';

import startTestData from '@data/startTest';
import decisionTable from '@data/decisionTable';

import { getPersonaList } from '@api/personas';
import { getTags } from '@api/tags';
import { getUXCatData } from '@api/uxcat/uxcat';
import { getUXCatStatistics } from '@api/uxcat/statistics';
import { UXCatConfigs } from '@api/uxcat/configs';

type StartTestProps = {
  tags?: TagType[];
  uxcatData: UXCatDataTypes;
  uxcatConfigs: any;
};

const StartTest: FC<StartTestProps> = ({ tags, uxcatData, uxcatConfigs }) => {
  const router = useRouter();
  const { locale } = router as TRouter;
  const currentLocale = locale === 'ru' ? 'ru' : 'en';
  const { accountData, uxcatUserInfo, setUxcatUserInfo } =
    useContext(GlobalContext);

  const { savedPersonasTitles } = decisionTable[locale];
  const { description1, description2, goodLuckTxt, btnTxt } =
    startTestData[currentLocale];
  const testDuration = '20:00';

  const [openPersonas, setOpenPersonas] = useState<boolean>(false);
  const [isPageAccessed, setIsPageAccessed] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [statistics, setStatistics] = useState(null);
  const [personas, setPersonas] = useState(null);
  const [openGenderModal, setOpenGenderModal] = useState(false);

  const forthTest = statistics?.totalTestCount >= 4;
  const askedGenderCount = accountData?.askGenderCount === 1;
  const uxcatStrapiData = uxcatData[currentLocale]?.data?.attributes;

  const handleStartTest = () => {
    router.push('/uxcat/ongoing');
  };

  useEffect(() => {
    const fetchData = async () => {
      const result = await getPersonaList();
      setPersonas(result);
    };

    fetchData().then(r => console.log(r));
  }, []);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!accessToken) return;
      try {
        const result = await getUXCatStatistics(accessToken);
        setStatistics(result);
      } catch (e) {
        console.log(e);
      }
    };
    fetchStatistics().then(r => console.log(r));
  }, [accessToken]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsPageAccessed(true);
      router.push('/uxcat');
    }
    setAccessToken(token);
  }, []);

  useEffect(() => {
    if (accountData && forthTest) {
      !accountData?.gender &&
        setOpenGenderModal(accountData?.askGenderCount < 2);
    }
  }, [accountData, forthTest]);

  return (
    <>
      <>
        {isPageAccessed ? (
          <Spinner />
        ) : (
          <>
            <SeoGenerator
              strapiSEO={{
                description: uxcatStrapiData?.seoDescription || '',
                title: uxcatStrapiData?.startTestPageTitle || '',
                keywords: uxcatStrapiData?.keywords || '',
                pageTitle: uxcatStrapiData?.startTestPageTitle || '',
              }}
              ogTags={uxcatStrapiData?.OGTags}
              modifiedDate={uxcatStrapiData?.updatedAt}
              createdDate={'2025-10-28'}
            />
            <StartTestLayout
              tags={tags}
              setOpenPersonas={setOpenPersonas}
              testDuration={testDuration}
              handleStartTest={handleStartTest}
              description1={description1}
              description2={description2}
              goodLuckTxt={goodLuckTxt}
              btnTxt={btnTxt}
              disabled={uxcatConfigs.TestKillSwitcher}
              userInfo={uxcatUserInfo}
              setUserInfo={setUxcatUserInfo}
            />
          </>
        )}
      </>
      {openPersonas && (
        <SavedPersonas
          personaTableTitles={savedPersonasTitles}
          savedPersonas={personas}
          setOpenPersonas={setOpenPersonas}
          setSavedPersonas={setPersonas}
          changedUsername={uxcatUserInfo?.user?.username}
        />
      )}
      {openGenderModal && (
        <GenderModal
          token={accessToken}
          onClose={() => setOpenGenderModal(false)}
          askedGenderCount={askedGenderCount}
        />
      )}
    </>
  );
};

export default StartTest;

export const getServerSideProps: GetServerSideProps = async context => {
  const tags = getTags();
  const uxcatData = await getUXCatData();
  const uxcatConfigs = await UXCatConfigs();

  return {
    props: {
      tags,
      uxcatData,
      uxcatConfigs,
    },
  };
};
