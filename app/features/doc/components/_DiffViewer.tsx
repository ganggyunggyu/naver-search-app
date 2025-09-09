import React, { useMemo, useState } from 'react';
import { diffWords, diffChars, diffLines } from 'diff';
import './_DiffViewer.style.css';
type Mode = 'unified' | 'side-by-side';
type Granularity = 'word' | 'char' | 'line';

interface DiffChunk {
  added?: boolean;
  removed?: boolean;
  value: string;
}

const makeDiff = (a: string, b: string, g: Granularity): DiffChunk[] => {
  if (g === 'char') return diffChars(a, b) as DiffChunk[];
  if (g === 'line') return diffLines(a, b) as DiffChunk[];
  return diffWords(a, b) as DiffChunk[];
};

const chunkToSpan = (c: DiffChunk, key: number) => {
  const cls = c.added ? 'added' : c.removed ? 'removed' : 'same';
  return (
    <span key={key} className={`diff-chunk ${cls}`}>
      {c.value}
    </span>
  );
};

interface Props {
  a: string;
  b: string;
  initialMode?: Mode;
  initialGranularity?: Granularity;
}

const DiffViewer: React.FC<Props> = ({
  a,
  b,
  initialMode = 'unified',
  initialGranularity = 'word',
}) => {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [granularity, setGranularity] =
    useState<Granularity>(initialGranularity);

  const parts = useMemo(() => makeDiff(a, b, granularity), [a, b, granularity]);

  // unified: 한 페이지에 빨강/초록으로 교차 렌더
  const unified = useMemo(
    () => (
      <div className="diff-unified">
        {parts.map((c, i) => chunkToSpan(c, i))}
      </div>
    ),
    [parts]
  );

  // side-by-side: 좌(삭제/공통), 우(추가/공통)로 분배
  const side = useMemo(() => {
    const left: React.ReactNode[] = [];
    const right: React.ReactNode[] = [];
    parts.forEach((c, i) => {
      if (c.added) {
        right.push(chunkToSpan(c, i));
      } else if (c.removed) {
        left.push(chunkToSpan(c, i));
      } else {
        // 공통은 양쪽에 동일하게
        const kL = `${i}-l`;
        const kR = `${i}-r`;
        left.push(
          <span key={kL} className="diff-chunk same">
            {c.value}
          </span>
        );
        right.push(
          <span key={kR} className="diff-chunk same">
            {c.value}
          </span>
        );
      }
    });
    return (
      <div className="diff-sbs grid grid-cols-1 md:grid-cols-2 gap-4 ">
        <div className="panel">
          <div className="panel-title">A 기준(삭제/공통)</div>
          <div className="panel-body">{left}</div>
        </div>
        <div className="panel">
          <div className="panel-title">B 기준(추가/공통)</div>
          <div className="panel-body">{right}</div>
        </div>
      </div>
    );
  }, [parts]);

  return (
    <div className="diff-viewer">
      <div className="diff-toolbar">
        <div className="tabs">
          <button
            className={`tab ${mode === 'unified' ? 'active' : ''}`}
            onClick={() => setMode('unified')}
          >
            한페이지
          </button>
          <button
            className={`tab ${mode === 'side-by-side' ? 'active' : ''}`}
            onClick={() => setMode('side-by-side')}
          >
            두페이지
          </button>
        </div>
        <div className="granularity">
          <label>단위:</label>
          <select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value as Granularity)}
          >
            <option value="word">단어</option>
            <option value="char">문자</option>
            <option value="line">문장/라인</option>
          </select>
        </div>
      </div>
      {mode === 'unified' ? unified : side}
    </div>
  );
};

export default DiffViewer;
