import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import React, { FC, useContext, useEffect, useState } from 'react';

import type { BiasType } from '@local-types/data';
import { TRouter } from '@local-types/global';

import { getStrapiBiases } from '@api/biases';
import { getUXCoreSeo } from '@api/mainPageSeo';

import { GlobalContext } from '@components/Context/GlobalContext';
import SeoGenerator from '@components/SeoGenerator';
import Spinner from '@components/Spinner';

import UXCoreLayout from '@layouts/UXCoreLayout';

interface UXCoreProps {
  biases: BiasType[];
  seo: { en: any; ru: any };
}

const Index: FC<UXCoreProps> = ({ seo, biases }) => {
  const router = useRouter();
  const { locale } = router as TRouter;
  const { uxcatUserInfo, setUxcatUserInfo } = useContext(GlobalContext);
  const [openPodcast, setOpenPodcast] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <SeoGenerator
        strapiSEO={seo[0]}
        ogTags={seo[0].OGTags}
        type={'CollectionPage'}
        createdDate={'2020-07-23'}
        modifiedDate={seo[0].updatedAt}
      />
      <UXCoreLayout
        mounted={mounted}
        userInfo={uxcatUserInfo}
        setUserInfo={setUxcatUserInfo}
        strapiBiases={!!biases && biases?.[locale]}
        openPodcast={openPodcast}
        setOpenPodcast={setOpenPodcast}
      />
      <Spinner />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const biases = await getStrapiBiases();
  const mainSeo = await getUXCoreSeo(locale as 'en' | 'ru' | 'hy');

  return {
    props: {
      seo: mainSeo,
      biases: biases || null,
    },
    revalidate: 5,
  };
};

export default Index;
