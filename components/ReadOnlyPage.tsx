'use client';

import { useEditor, PAGE_W } from '@/lib/store';
import type { Page } from '@/lib/types';
import ElementView from './ElementView';
import { PageBackground } from './PageBackground';

/** Page rendue en lecture seule (aperçu / capture d'export), mise à l'échelle. */
export default function ReadOnlyPage({
  page,
  index,
  scale,
}: {
  page: Page;
  index: number;
  scale: number;
}) {
  const elements = useEditor((st) => st.elements);
  const W = PAGE_W;
  const H = page.h || 1123;
  const els = elements.filter((e) => e.page === index);
  return (
    <div style={{ width: W * scale, height: H * scale, flex: 'none', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: W,
          height: H,
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          background: '#fff',
          boxShadow: '0 0 24px 0 rgba(44,62,80,.2)',
        }}
      >
        <PageBackground page={page} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {els.map((el) => (
            <ElementView key={el.id} el={el} selected={false} editing={false} readOnly />
          ))}
        </div>
      </div>
    </div>
  );
}
