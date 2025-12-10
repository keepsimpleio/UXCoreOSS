import { FC, useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import Section from '@components/Section';
import DynamicButton from '@components/_uxcp/PersonaRelatedQuestions/DynamicButton';
import PriorityFilter from '@components/_uxcp/PersonaRelatedQuestions/PriorityFilter';
import Pagination from '@components/_uxcp/Pagination';

import useMobile from '@hooks/useMobile';

import uxcpLocalization from '@data/uxcp';

import type { RelevantQuestionType, TagType } from '@local-types/data';
import type { TRouter } from '@local-types/global';

import RelatedQuestion from './RelatedQuestion';

import styles from './PersonaRelatedQuestions.module.scss';
import cn from 'classnames';
import Image from 'next/image';

type PersonaRelatedQuestionsProps = {
  stageIndex: number;
  relatedQuestions: RelevantQuestionType[];
  totalAppearing: number;
  tags: TagType[];
};

export type priorityLevel = 'all' | 'high' | 'medium' | 'low';

const itemsPerPage = 10;

const PersonaRelatedQuestions: FC<PersonaRelatedQuestionsProps> = ({
  stageIndex,
  relatedQuestions,
  totalAppearing,
  tags,
}) => {
  const { isMobile } = useMobile()[1];

  const { locale } = useRouter() as TRouter;
  const { personaRelatedQuestionsTitle, noData, pieChartPlaceholder } =
    uxcpLocalization[locale];

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPriority, setSelectedPriority] =
    useState<priorityLevel>('all');

  const filteredQuestions = useMemo(() => {
    if (stageIndex === null) return [];

    const filteredQuestions = relatedQuestions.filter(
      ({ tags, relevancyTitle }) => {
        const includesTag = tags.includes(stageIndex + 1);
        const matchesPriority =
          selectedPriority === 'all' || selectedPriority === relevancyTitle;

        return includesTag && matchesPriority;
      },
    );

    return filteredQuestions;
  }, [relatedQuestions, stageIndex, selectedPriority]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredQuestions.length / itemsPerPage);
  }, [filteredQuestions]);

  const visibleItems = useMemo(() => {
    return filteredQuestions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [filteredQuestions, currentPage]);

  useEffect(() => {
    if (visibleItems.length === 0 && currentPage > 1) {
      setCurrentPage(prevState => prevState - 1);
    }
  }, [visibleItems, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPriority]);

  return (
    <Section style={{ width: '100%', position: 'relative' }}>
      <div
        className={cn(styles.SectionTitle, {
          [styles.SectionTitleHy]: locale === 'hy',
        })}
      >
        <span>{personaRelatedQuestionsTitle}</span>
        {!isMobile && (
          <div className={styles.DynamicButtonWrapper}>
            <DynamicButton stageIndex={stageIndex} tags={tags} />
          </div>
        )}
      </div>
      <PriorityFilter
        selectedPriority={selectedPriority}
        onChange={setSelectedPriority}
      />
      {stageIndex !== null && (
        <>
          <div className={styles.Table}>
            {visibleItems.map(question => {
              const {
                relevantFor,
                relevancyTitle,
                relevancy,
                percentOfAppearing,
              } = question;

              return (
                <RelatedQuestion
                  locale={locale}
                  key={question.number}
                  question={question}
                  priority={relevancyTitle}
                  relevancy={relevancy}
                  percentOfAppearing={percentOfAppearing}
                  totalAppearing={totalAppearing}
                  relevantFor={relevantFor}
                />
              );
            })}
            {visibleItems.length === 0 && (
              <div className={styles.NoData}>
                <div>{noData}</div>
              </div>
            )}
          </div>
          {visibleItems.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={setCurrentPage}
            />
          )}
        </>
      )}
      {stageIndex === null && (
        <div className={styles.Placeholder}>
          <Image
            src="/assets/icons/uxcp-arrow.svg"
            alt="arrows"
            width={79}
            height={19}
          />
          <div>{isMobile ? noData : pieChartPlaceholder}</div>
        </div>
      )}
    </Section>
  );
};

export default PersonaRelatedQuestions;
