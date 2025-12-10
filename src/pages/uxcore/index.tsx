import React, { FC, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';
import dynamic from 'next/dynamic';

import SeoGenerator from '@components/SeoGenerator';
import Spinner from '@components/Spinner';
import { GlobalContext } from '@components/Context/GlobalContext';

import UXCoreLayout from '@layouts/UXCoreLayout';

import { getTags } from '@api/tags';
import { getUXCoreSeo } from '@api/mainPageSeo';
import { getPersonaList } from '@api/personas';
import { getStrapiBiases } from '@api/biases';

import type { BiasType, TagType } from '@local-types/data';
import { TRouter } from '@local-types/global';

import decisionTable from '@data/decisionTable';

const SavedPersonas = dynamic(() => import('@components/_uxcp/SavedPersonas'), {
  ssr: false,
});

interface UXCoreProps {
  biases: BiasType[];
  tags: TagType[];
  seo: { en: any; ru: any };
}

const Index: FC<UXCoreProps> = ({ tags, seo, biases }) => {
  const router = useRouter();
  const { locale } = router as TRouter;
  const { uxcatUserInfo, setUxcatUserInfo } = useContext(GlobalContext);
  const [openPodcast, setOpenPodcast] = useState(false);
  const [openPersonas, setOpenPersonas] = useState<boolean>(false);
  const [personas, setPersonas] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const { savedPersonasTitles } = decisionTable[locale];

  useEffect(() => {
    const fetchData = async () => {
      const result = await getPersonaList();
      setPersonas(result);
    };

    fetchData().then(r => r);
  }, []);

  return (
    <>
      <SeoGenerator
        strapiSEO={seo[0]}
        ogTags={seo[0].OGTags}
        createdDate={'2020-07-23'}
        modifiedDate={seo[0].updatedAt}
      />
      <UXCoreLayout
        mounted={mounted}
        userInfo={uxcatUserInfo}
        setUserInfo={setUxcatUserInfo}
        tags={tags}
        strapiBiases={!!biases && biases?.[locale]}
        openPodcast={openPodcast}
        setOpenPodcast={setOpenPodcast}
        setOpenPersonas={setOpenPersonas}
        uxcatUserInfo={uxcatUserInfo}
        setUxcatUserInfo={setUxcatUserInfo}
      />
      {openPersonas && (
        <SavedPersonas
          personaTableTitles={savedPersonasTitles}
          savedPersonas={personas}
          setOpenPersonas={setOpenPersonas}
          setSavedPersonas={setPersonas}
          changedUsername={uxcatUserInfo?.user?.username}
        />
      )}
      <Spinner />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const tags = getTags();
  const biases = await getStrapiBiases();
  const mainSeo = await getUXCoreSeo(locale as 'en' | 'ru' | 'hy');

  return {
    props: {
      tags,
      seo: mainSeo,
      biases: biases || null,
    },
    revalidate: 5,
  };
};

export default Index;
