import { useRouter } from 'next/router';
import { type FC, useEffect, useRef, useState } from 'react';

import type { StrapiBiasType } from '@local-types/data';
import type { TRouter } from '@local-types/global';

import { countryBiasByLocale } from '@data/countryBias';

import BiasPanel from './BiasPanel';
import CountryList from './CountryList';
import CountryMap from './CountryMap';

import styles from './CountryBiasMap.module.scss';

const TITLE_INTERVAL = 3000;

interface CyclingSubtitleWordProps {
  words: string[];
  interval: number;
  boldWord?: string;
}

const CyclingSubtitleWord: FC<CyclingSubtitleWordProps> = ({
  words,
  interval,
  boldWord,
}) => {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'visible' | 'fading' | 'entering'>(
    'visible',
  );

  useEffect(() => {
    setIndex(0);
  }, [words]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase('fading');
      setTimeout(() => {
        setIndex(prev => (prev + 1) % words.length);
        setPhase('entering');
        setTimeout(() => setPhase('visible'), 50);
      }, 350);
    }, interval);
    return () => clearInterval(timer);
  }, [words, interval]);

  const word = words[index];
  const isBold = boldWord && word === boldWord;

  return (
    <span
      className={styles.CyclingWord}
      style={{
        opacity: phase === 'fading' ? 0 : 1,
        transform:
          phase === 'fading'
            ? 'translateY(-6px)'
            : phase === 'entering'
              ? 'translateY(6px)'
              : 'translateY(0)',
        fontWeight: isBold ? 900 : 700,
        color: isBold ? '#337AB7' : '#1A1A2E',
      }}
    >
      {word}
    </span>
  );
};

interface CountryBiasMapProps {
  biases: StrapiBiasType[];
  onUseBiases: (biasNumbers: number[]) => void;
}

const CountryBiasMap: FC<CountryBiasMapProps> = ({ biases, onUseBiases }) => {
  const { locale } = useRouter() as TRouter;
  const { countries, ui } = countryBiasByLocale[locale];

  const [selected, setSelected] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('All');
  const biasPanelRef = useRef<HTMLDivElement>(null);

  const handleSelect = (id: string) => {
    setSelected(prev => (prev === id ? null : id));
  };

  const handleUseBiases = (biasNumbers: number[]) => {
    onUseBiases(biasNumbers);
  };

  return (
    <div className={styles.Root}>
      <header className={styles.Header}>
        <h2 className={styles.Eyebrow}>{ui.chooseYour}</h2>
        <div className={styles.SubtitleSlot}>
          <CyclingSubtitleWord
            words={ui.cyclingWords}
            interval={TITLE_INTERVAL}
            boldWord={ui.cyclingBoldWord}
          />
        </div>
        <p className={styles.Tagline}>{ui.tagline}</p>
        <p className={styles.SubTagline}>
          <span className={styles.SubTaglineLead}>{ui.subTaglineLead}</span>
          {ui.subTagline}
        </p>
      </header>

      <div className={styles.Stats}>
        <div className={styles.StatBox}>
          <div className={styles.StatNumber}>{countries.length}</div>
          <div className={styles.StatLabel}>{ui.statTemplates}</div>
        </div>
        <div className={styles.CalloutBox}>
          <div className={styles.CalloutText}>{ui.statReady}</div>
        </div>
      </div>

      <CountryMap
        selected={selected}
        hoveredCountry={hoveredCountry}
        filterRegion={filterRegion}
        onSelect={handleSelect}
        onHover={setHoveredCountry}
      />

      <CountryList
        selected={selected}
        searchQuery={searchQuery}
        filterRegion={filterRegion}
        onSelect={handleSelect}
        onSearchChange={setSearchQuery}
        onRegionChange={setFilterRegion}
      />

      <div className={styles.Divider}>
        <hr />
      </div>

      <BiasPanel
        selectedId={selected}
        biases={biases}
        onUseBiases={handleUseBiases}
        ref={biasPanelRef}
      />
    </div>
  );
};

export default CountryBiasMap;
