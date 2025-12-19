import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

import { GlobalContext } from '@components/Context/GlobalContext';
import SavedPersonas from '@components/_uxcp/SavedPersonas';
import UXCorePopup from '@components/UXCorePopup';
import decisionTable from '@data/decisionTable';

import { getPersonaList } from '@api/personas';

import { TRouter } from '@local-types/global';

import useUCoreMobile from '@hooks/uxcoreMobile';

const ToolHeader = dynamic(() => import('@components/ToolHeader'), {
  ssr: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { locale } = router as TRouter;

  const [personas, setPersonas] = useState([]);
  const {
    uxcatUserInfo,
    setUxcatUserInfo,
    setSelectedTitle,
    setUpdatedUsername,
  } = useContext(GlobalContext);
  const [openPersonas, setOpenPersonas] = useState<boolean>(false);
  const [headerPodcastOpen, setHeaderPodcastOpen] = useState(false);

  const { savedPersonasTitles } = decisionTable[locale];
  const { isUxcoreMobile } = useUCoreMobile()[1];

  const pathname = usePathname().replace(/\/+$/, '');
  const path = pathname.replace(/\/+$/, '');

  const isUXCoreRoot = path === '/uxcore';
  const isUXCoreNested = path.startsWith('/uxcore/');
  const isUXCGNested = path.startsWith('/uxcg/');
  const isUXCatNested = path.startsWith('/uxcat/');
  const isUserProfileRoot = path.startsWith('/user/');
  const shouldHideToolHeader = isUXCoreRoot && isUxcoreMobile;

  const fetchData = async () => {
    const result = await getPersonaList();
    setPersonas(result);
  };

  useEffect(() => {
    fetchData().then(r => console.log(r));
  }, []);

  return (
    <>
      {!shouldHideToolHeader && (
        <ToolHeader
          blockLanguageSwitcher={isUXCoreNested || isUXCGNested}
          openPersonaModal={setOpenPersonas}
          openPodcast={headerPodcastOpen}
          showSavedPersonas={true}
          setUpdatedUsername={setUpdatedUsername}
          userInfo={uxcatUserInfo}
          disablePageSwitcher={isUXCatNested || isUserProfileRoot}
          setUserInfo={setUxcatUserInfo}
          setOpenPodcast={setHeaderPodcastOpen}
          setSelectedTitle={setSelectedTitle}
        />
      )}
      <main>{children}</main>
      {openPersonas && (
        <SavedPersonas
          personaTableTitles={savedPersonasTitles}
          savedPersonas={personas}
          setOpenPersonas={setOpenPersonas}
          setSavedPersonas={setPersonas}
          changedUsername={uxcatUserInfo?.user?.username}
        />
      )}
      {headerPodcastOpen && (
        <UXCorePopup
          setOpenPodcast={setHeaderPodcastOpen}
          openPodcast={headerPodcastOpen}
        />
      )}
    </>
  );
}
