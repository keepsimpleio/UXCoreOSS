import React, { useMemo, FC } from 'react';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import UXCPLayout from '@layouts/UXCPLayout';

import SeoGenerator from '@components/SeoGenerator';
import Spinner from '@components/Spinner';

import { getStrapiQuestions } from '@api/questions';
import { getStrapiBiases } from '@api/biases';
import { getTags } from '@api/tags';
import { getUXCPSeo } from '@api/mainPageSeo';

import type { QuestionType, StrapiBiasType, TagType } from '@local-types/data';
import { TRouter } from '@local-types/global';

interface UXCPProps {
  questions: QuestionType[];
  strapiBiases: StrapiBiasType[];
  tags: TagType[];
  seo: { en: any; ru: any };
}

const Index: FC<UXCPProps> = ({ questions, strapiBiases, tags, seo }) => {
  const router = useRouter();
  const { locale } = router as TRouter;
  const isRu = locale === 'ru';
  const seoData = useMemo(() => seo[isRu ? 'ru' : 'en'], [seo, locale]);

  function flattenStrapiBiases(data): [] {
    return data.map(({ id, attributes }) => ({
      _id: id,
      ...attributes,
    }));
  }

  function flattenStrapiQuestions<T>(data): [] {
    return data.map(({ attributes }) => ({
      ...attributes,
      aliases: [attributes.aliases],
      tags: JSON.parse(attributes?.tags) || [],
      relatedQuestions: JSON.parse(attributes?.relatedQuestions) || [],
    }));
  }
  const strapiBiasesData = flattenStrapiBiases(strapiBiases[locale]);
  const questionsData = flattenStrapiQuestions(questions[locale]);

  return (
    <>
      <SeoGenerator
        strapiSEO={seoData}
        ogTags={seoData.OGTags}
        createdDate={'2022-05-05'}
        modifiedDate={seoData.updatedAt}
      />
      <UXCPLayout
        questions={questionsData}
        allLangBiases={strapiBiases}
        tags={tags}
        biases={strapiBiasesData}
      />
      <Spinner />
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const tags = getTags();
  const questions = await getStrapiQuestions();
  const strapiBiases = await getStrapiBiases();

  const mainSeo = await getUXCPSeo();

  return {
    props: {
      strapiBiases,
      questions,
      tags,
      seo: mainSeo,
    },
    revalidate: 5,
  };
};

export default Index;
