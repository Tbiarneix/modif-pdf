'use client';

import React, { memo } from 'react';
import type { Element } from '@/lib/types';
import { ACCENT } from '@/lib/tokens';
import { HANDLES } from '@/lib/geometry';
import type { Handle } from '@/lib/types';

export interface ElementCallbacks {
  onMouseDown: (e: React.MouseEvent, el: Element) => void;
  onHandleDown: (e: React.MouseEvent, el: Element, handle: Handle) => void;
  onStartEdit: (el: Element) => void;
  onEditChange: (id: string, text: string) => void;
  onEditBlur: () => void;
  pickImage: (id: string) => void;
}

interface Props {
  el: Element;
  selected: boolean;
  editing: boolean;
  readOnly: boolean;
  cb?: ElementCallbacks;
}

/**
 * Pile CSS d'un bloc `ptext` : police embarquée du PDF (si chargée) → clone
 * métrique embarqué par l'app (Arimo, Tinos, Marianne…) → générique serif/sans.
 */
function ptextFamily(serif: boolean, embedded?: string, clone?: string) {
  const generic = serif ? 'Georgia, "Times New Roman", serif' : 'Helvetica, Arial, sans-serif';
  return [embedded && `"${embedded}"`, clone && `"${clone}"`, generic].filter(Boolean).join(', ');
}

/** Valeur CSS text-decoration-line combinant souligné et barré. */
function decoLine(underline?: boolean, strike?: boolean): string {
  const parts = [underline && 'underline', strike && 'line-through'].filter(Boolean) as string[];
  return parts.length ? parts.join(' ') : 'none';
}

function ElementView({ el, selected, editing, readOnly, cb }: Props) {
  const base: React.CSSProperties = {
    position: 'absolute',
    left: el.x,
    top: el.y,
    width: el.w,
    height: el.h,
    boxSizing: 'border-box',
    pointerEvents: readOnly ? 'none' : 'auto',
    opacity: el.opacity != null ? el.opacity : 1,
    cursor: readOnly ? 'default' : el.type === 'ptext' ? 'text' : 'move',
  };

  let content: React.ReactNode = null;

  if (el.type === 'text') {
    content = (
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          fontSize: el.fontSize,
          color: el.color,
          fontWeight: el.weight ?? (el.bold ? 700 : 400),
          fontStyle: el.italic ? 'italic' : 'normal',
          textDecorationLine: decoLine(el.underline, el.strike),
          textAlign: el.align,
          lineHeight: 1.3,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {el.text}
      </div>
    );
  } else if (el.type === 'ptext') {
    const edited = el.text !== el.orig;
    content = (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {edited ? (
          <div
            style={{
              position: 'absolute',
              left: -1.5,
              top: -1,
              right: -1.5,
              bottom: -1,
              background: el.mask || '#ffffff',
            }}
          />
        ) : null}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              el.align === 'right' ? 'flex-end' : el.align === 'center' ? 'center' : 'flex-start',
            fontFamily: ptextFamily(el.serif, el.fontFamily, el.fallbackFamily),
            fontSize: el.fontSize,
            fontWeight: el.weight ?? (el.bold ? 700 : 400),
            fontStyle: el.italic ? 'italic' : 'normal',
            textDecorationLine: decoLine(el.underline, el.strike),
            lineHeight: 1,
            color: edited ? el.color || '#1C2527' : 'transparent',
            whiteSpace: 'pre',
            overflow: 'visible',
          }}
        >
          {el.text}
        </div>
      </div>
    );
  } else if (el.type === 'field') {
    const empty = !el.text;
    content = (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '2px 6px',
          fontSize: el.fontSize,
          color: empty ? '#7DA7D6' : el.color || '#0053B2',
          background: empty ? 'rgba(0,117,241,.08)' : 'transparent',
          border: empty ? '1px dashed rgba(0,117,241,.55)' : 'none',
          borderRadius: 2,
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
        }}
      >
        {empty ? el.label || 'Champ' : el.text}
      </div>
    );
  } else if (el.type === 'check') {
    content = (
      <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%' }}>
        <path
          d="M4 12.5 l5.5 5.5 L20 5"
          fill="none"
          stroke={el.color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  } else if (el.type === 'signature') {
    content = el.sigSrc ? (
      // eslint-disable-next-line @next/next/no-img-element -- data URL capturé par html2canvas
      <img
        src={el.sigSrc}
        alt="Signature"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        draggable={false}
      />
    ) : (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Dancing Script', cursive",
          fontSize: Math.min(el.h * 0.72, 46),
          color: '#12233A',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {el.name || 'Signature'}
      </div>
    );
  } else if (el.type === 'image') {
    content = el.src ? (
      // eslint-disable-next-line @next/next/no-img-element -- data URL capturé par html2canvas
      <img
        src={el.src}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        draggable={false}
      />
    ) : (
      <div
        onDoubleClick={(ev) => {
          if (readOnly) return;
          ev.stopPropagation();
          cb?.pickImage(el.id);
        }}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          border: '1px dashed #BBC7D2',
          color: '#8E9299',
          fontSize: 12,
          background: '#F7F9FA',
        }}
      >
        <i className="fas fa-image" style={{ fontSize: 18 }} aria-hidden="true" />
        Double-clic
      </div>
    );
  } else if (el.type === 'redaction') {
    content = <div style={{ width: '100%', height: '100%', background: '#000' }} />;
  } else if (el.type === 'highlight') {
    content = (
      <div
        style={{ width: '100%', height: '100%', background: el.color, opacity: 0.45, mixBlendMode: 'multiply' }}
      />
    );
  } else if (el.type === 'shape') {
    if (el.shape === 'line') {
      content = (
        <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <line
            x1={0}
            y1={el.h / 2}
            x2={el.w}
            y2={el.h / 2}
            stroke={el.stroke}
            strokeWidth={el.strokeW}
            strokeLinecap="round"
          />
        </svg>
      );
    } else {
      content = (
        <div
          style={{
            width: '100%',
            height: '100%',
            border: `${el.strokeW}px solid ${el.stroke}`,
            background: el.fill || 'transparent',
            borderRadius: el.shape === 'ellipse' ? '50%' : 0,
          }}
        />
      );
    }
  } else if (el.type === 'draw') {
    const pts = (el.pts || []).map((p) => p.join(',')).join(' ');
    content = (
      <svg
        viewBox={`0 0 ${el.ow || el.w} ${el.oh || el.h}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <polyline
          points={pts}
          fill="none"
          stroke={el.color}
          strokeWidth={el.strokeW}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  const editableType = el.type === 'text' || el.type === 'field' || el.type === 'ptext';
  const handlers = readOnly
    ? {}
    : {
        onMouseDown: (ev: React.MouseEvent) => cb?.onMouseDown(ev, el),
        onDoubleClick: (ev: React.MouseEvent) => {
          if (editableType) {
            ev.stopPropagation();
            cb?.onStartEdit(el);
          }
        },
      };

  const outline: React.CSSProperties =
    selected && !readOnly ? { outline: `1.5px solid ${ACCENT}`, outlineOffset: 0 } : {};

  return (
    <div style={{ ...base, ...outline }} {...handlers}>
      {content}
      {editing && !readOnly ? <InlineEditor el={el} cb={cb} /> : null}
      {selected && !readOnly && !editing ? <Handles el={el} cb={cb} /> : null}
    </div>
  );
}

function InlineEditor({ el, cb }: { el: Element; cb?: ElementCallbacks }) {
  if (el.type !== 'text' && el.type !== 'field' && el.type !== 'ptext') return null;
  const isPtext = el.type === 'ptext';
  const ff = el.type === 'ptext' ? ptextFamily(el.serif, el.fontFamily, el.fallbackFamily) : 'inherit';
  const bg = isPtext ? el.mask || '#ffffff' : 'rgba(255,255,255,.92)';
  const bold = 'bold' in el ? el.bold : false;
  const weight = 'weight' in el && el.weight != null ? el.weight : bold ? 700 : 400;
  const italic = 'italic' in el ? el.italic : false;
  const underline = 'underline' in el ? el.underline : false;
  const strike = 'strike' in el ? el.strike : false;
  const align = 'align' in el ? el.align : 'left';
  // Une textarea aligne son texte en haut ; pour un ptext (affiché centré
  // verticalement), on ajoute un padding haut pour centrer la ligne dans la
  // boîte → pas de saut vers le haut au passage en édition.
  const padTop = isPtext ? Math.max(0, (el.h - el.fontSize) / 2) : undefined;
  return (
    <textarea
      autoFocus
      value={el.text || ''}
      onChange={(ev) => cb?.onEditChange(el.id, ev.target.value)}
      onBlur={() => cb?.onEditBlur()}
      onMouseDown={(ev) => ev.stopPropagation()}
      style={{
        position: 'absolute',
        inset: 0,
        border: 'none',
        outline: 'none',
        resize: 'none',
        background: bg,
        padding: el.type === 'field' ? '2px 6px' : 0,
        paddingTop: padTop,
        margin: 0,
        fontFamily: ff,
        fontSize: el.fontSize,
        color: el.color,
        fontWeight: weight,
        fontStyle: italic ? 'italic' : 'normal',
        textDecorationLine: decoLine(underline, strike),
        textAlign: align,
        lineHeight: isPtext ? 1 : 1.3,
      }}
    />
  );
}

function Handles({ el, cb }: { el: Element; cb?: ElementCallbacks }) {
  return (
    <>
      {HANDLES.map(([k, fx, fy, cur]) => (
        <div
          key={k}
          onMouseDown={(ev) => cb?.onHandleDown(ev, el, k)}
          style={{
            position: 'absolute',
            left: `calc(${fx * 100}% - 5px)`,
            top: `calc(${fy * 100}% - 5px)`,
            width: 10,
            height: 10,
            background: '#fff',
            border: `1.5px solid ${ACCENT}`,
            borderRadius: '50%',
            cursor: `${cur}-resize`,
            zIndex: 5,
          }}
        />
      ))}
    </>
  );
}

export default memo(ElementView);
