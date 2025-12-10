import React, { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

import ToolHeader from '@components/ToolHeader';
import BorderedContainer from '@components/BorderedContainer';
import CodeSnippet from '@components/CodeSnippet';
import ToolFooter from '@components/ToolFooter';

import uxcoreApi from '@data/uxcoreApi/uxcoreapi';
import decisionTable from '@data/decisionTable';

import { TagType } from '@local-types/data';

import { getPersonaList } from '@api/personas';

import { UserTypes } from '@local-types/uxcat-types/types';
import { TRouter } from '@local-types/global';

import styles from './ApiLayout.module.scss';

const SavedPersonas = dynamic(() => import('@components/_uxcp/SavedPersonas'), {
  ssr: false,
});

interface ApiLayoutProps {
  tags: TagType[];
  userInfo: UserTypes;
  setUserInfo: (userInfo: UserTypes) => void;
}

const ApiLayout: FC<ApiLayoutProps> = ({ tags, userInfo, setUserInfo }) => {
  const [openPersonas, setOpenPersonas] = useState<boolean>(false);
  const [personas, setPersonas] = useState([]);
  const router = useRouter();
  const { locale } = router as TRouter;
  const { savedPersonasTitles } = decisionTable[locale];
  const sectionDescription = `Welcome to the UXCore API documentation! Our API provides a simple and powerful way to access all information
   available in the UXCore project. In this documentation, you'll find details about the API's endpoints,
    parameters, and examples to help you get started quickly. The API is free. Still, we open access per request
     because of some technicalities. For access request or any other questions please contact us at alexanyanwolf@gmail.com`;

  const fetchData = async () => {
    const result = await getPersonaList();
    setPersonas(result);
  };

  useEffect(() => {
    fetchData().then(r => console.log(r));
  }, []);

  return (
    <div className={styles.body}>
      <ToolHeader
        tags={tags}
        openPersonaModal={setOpenPersonas}
        showSavedPersonas={true}
        userInfo={userInfo}
        setUserInfo={setUserInfo}
      />
      <section className={styles.wrapper}>
        <h1 className={styles.pageTitle}>UX CORE API</h1>
        <div className={styles.mainInfo}>
          <p className={styles.sectionDescription}>{sectionDescription}</p>
        </div>
        <hr className={styles.separator} />
        {uxcoreApi.map((el, key) => {
          return (
            <div key={key}>
              <div className={styles.mainInfo}>
                <h3 className={styles.mainTitle}> {el.mainTitle} </h3>
                {el.link.includes(':ID') ? (
                  <span className={styles.link}>{el.link}</span>
                ) : (
                  <a className={styles.link} href={el.link} target={'_blank'}>
                    {el.link}
                  </a>
                )}
                <h4 className={styles.parametersTxt}> {el.parametersTxt} </h4>
                <span> {el.parametersInfo}</span>
              </div>
              <BorderedContainer
                content={el.parameters}
                className={styles.borderedContainer}
              />
              <div className={styles.codeUsage}>
                <h6 className={styles.usageTitle}> {el.usageTitle} </h6>
                <p> {el.usageTxt}</p>
                <CodeSnippet code={el.code} />
              </div>
            </div>
          );
        })}
      </section>
      <ToolFooter page={'api'} tags={tags} />
      <div className={styles.Motto}>Be Kind. Do Good.</div>
      {openPersonas && (
        <SavedPersonas
          personaTableTitles={savedPersonasTitles}
          savedPersonas={personas}
          setOpenPersonas={setOpenPersonas}
          setSavedPersonas={setPersonas}
          changedUsername={userInfo?.user?.username}
        />
      )}
    </div>
  );
};
export default ApiLayout;
