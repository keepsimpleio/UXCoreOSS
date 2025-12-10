import { FC, Fragment, useContext, useMemo } from 'react';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';

import ApiLayout from '@layouts/ApiLayout';

import SeoGenerator from '@components/SeoGenerator';
import { GlobalContext } from '@components/Context/GlobalContext';

import { getTags } from '@api/tags';
import { getUXCoreApiSeo } from '@api/mainPageSeo';

import { TagType } from '@local-types/data';
import { TRouter } from '@local-types/global';

interface ApiProps {
  tags: TagType[];
  mainSeo: { en: any; ru: any };
}

const API: FC<ApiProps> = ({ tags, mainSeo }) => {
  const router = useRouter();
  const { locale } = router as TRouter;
  const { uxcatUserInfo, setUxcatUserInfo } = useContext(GlobalContext);
  const currentLocale = locale === 'ru' ? 'ru' : 'en';
  const seoData = useMemo(
    () => mainSeo[currentLocale],
    [mainSeo, currentLocale],
  );

  return (
    <Fragment>
      <SeoGenerator
        strapiSEO={seoData}
        ogTags={seoData?.OGTags}
        createdDate={'2023-05-15'}
        modifiedDate={'2023-05-15'}
      />
      <ApiLayout
        tags={tags}
        userInfo={uxcatUserInfo}
        setUserInfo={setUxcatUserInfo}
      />
    </Fragment>
  );
};
export const getStaticProps: GetStaticProps = async () => {
  const tags = getTags();

  const mainSeo = await getUXCoreApiSeo();
  return { props: { tags, mainSeo } };
};

export default API;
