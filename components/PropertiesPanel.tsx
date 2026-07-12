'use client';

import { useEditor } from '@/lib/store';
import { ACCENT, PALETTE, HILITE, MASK_COLORS } from '@/lib/tokens';
import type { Element, ElementType } from '@/lib/types';
import { Row, Input } from './ui/Field';
import Swatches from './ui/Swatches';
import SegButtons from './ui/SegButtons';
import Slider from './ui/Slider';
import ActionButton from './ui/ActionButton';
import NumInput from './ui/NumInput';
import SignaturePad from './SignaturePad';
import s from './Panel.module.css';

const TYPE_NAMES: Record<ElementType, string> = {
  text: 'Texte',
  ptext: 'Texte du PDF',
  field: 'Champ',
  check: 'Coche',
  signature: 'Signature',
  image: 'Image',
  redaction: 'Caviardage',
  highlight: 'Surlignage',
  shape: 'Forme',
  draw: 'Dessin',
};

export default function PropertiesPanel({ el }: { el: Element }) {
  const updateEl = useEditor((st) => st.updateEl);
  const commit = useEditor((st) => st.commit);
  const bringFront = useEditor((st) => st.bringFront);
  const sendBack = useEditor((st) => st.sendBack);
  const duplicateSel = useEditor((st) => st.duplicateSel);
  const deleteSel = useEditor((st) => st.deleteSel);

  const up = (patch: Partial<Element>) => updateEl(el.id, patch);

  return (
    <div>
      <div className={s.badgeRow}>
        <span className={s.badge} style={{ background: ACCENT }}>
          {TYPE_NAMES[el.type]}
        </span>
      </div>

      {/* --- Texte / Texte PDF / Champ --- */}
      {(el.type === 'text' || el.type === 'ptext' || el.type === 'field') && (
        <>
          <Row label={el.type === 'field' ? 'Valeur' : 'Contenu'}>
            <textarea
              className={s.textarea}
              value={el.text || ''}
              placeholder={el.type === 'field' ? el.label || 'Saisir…' : ''}
              onFocus={() => commit()}
              onChange={(e) => up({ text: e.target.value } as Partial<Element>)}
            />
          </Row>
          {el.type === 'ptext' && el.text !== el.orig ? (
            <button
              type="button"
              className={s.linkBtn}
              onClick={() => up({ text: el.orig } as Partial<Element>)}
            >
              <i className="fas fa-arrow-rotate-left" aria-hidden="true" />
              Rétablir le texte d’origine
            </button>
          ) : null}
          {el.type === 'field' ? (
            <Row label="Libellé (si vide)">
              <Input
                value={el.label || ''}
                label="Libellé du champ"
                onChange={(e) => up({ label: e.target.value } as Partial<Element>)}
              />
            </Row>
          ) : null}
          <Row label="Taille du texte">
            <Slider
              value={el.fontSize}
              min={9}
              max={64}
              step={1}
              label="Taille du texte"
              display={`${Math.round(el.fontSize)}px`}
              onChange={(v) => up({ fontSize: v } as Partial<Element>)}
            />
          </Row>
          {(el.type === 'text' || el.type === 'ptext') && (
            <>
              <Row label="Graisse">
                <Slider
                  value={el.weight ?? (el.bold ? 700 : 400)}
                  min={100}
                  max={900}
                  step={50}
                  label="Graisse de la police"
                  display={String(el.weight ?? (el.bold ? 700 : 400))}
                  onChange={(v) => up({ weight: v } as Partial<Element>)}
                />
              </Row>
              <Row label="Style">
                {/* Un seul groupe segmenté (4 boutons à parts égales, comme
                    l'alignement) en mode multi-bascule. Le B pilote la même
                    valeur `weight` que la tirette : actif si ≥ 600, bascule 400⇄700. */}
                <SegButtons
                  options={[
                    { v: 'b', i: 'fas fa-bold', t: 'Gras' },
                    { v: 'i', i: 'fas fa-italic', t: 'Italique' },
                    { v: 'u', i: 'fas fa-underline', t: 'Souligné' },
                    { v: 's', i: 'fas fa-strikethrough', t: 'Barré' },
                  ]}
                  isActive={(v) =>
                    v === 'b'
                      ? (el.weight ?? (el.bold ? 700 : 400)) >= 600
                      : v === 'i'
                        ? !!el.italic
                        : v === 'u'
                          ? !!el.underline
                          : !!el.strike
                  }
                  onPick={(v) => {
                    if (v === 'b') {
                      up({ weight: (el.weight ?? (el.bold ? 700 : 400)) >= 600 ? 400 : 700 } as Partial<Element>);
                    } else if (v === 'i') {
                      up({ italic: !el.italic } as Partial<Element>);
                    } else if (v === 'u') {
                      up({ underline: !el.underline } as Partial<Element>);
                    } else {
                      up({ strike: !el.strike } as Partial<Element>);
                    }
                  }}
                />
              </Row>
            </>
          )}
          {(el.type === 'text' || el.type === 'ptext') && (
            <Row label="Alignement">
              <SegButtons
                options={[
                  { v: 'left', i: 'fas fa-align-left' },
                  { v: 'center', i: 'fas fa-align-center' },
                  { v: 'right', i: 'fas fa-align-right' },
                ]}
                current={el.align}
                onPick={(v) => up({ align: v } as Partial<Element>)}
              />
            </Row>
          )}
          <Row label="Couleur">
            <Swatches colors={PALETTE} current={el.color} onPick={(c) => up({ color: c } as Partial<Element>)} />
          </Row>
          {el.type === 'ptext' ? (
            <Row label="Cache (fond)">
              <Swatches colors={MASK_COLORS} current={el.mask} onPick={(c) => up({ mask: c } as Partial<Element>)} />
            </Row>
          ) : null}
        </>
      )}

      {/* --- Coche --- */}
      {el.type === 'check' && (
        <Row label="Couleur">
          <Swatches colors={PALETTE} current={el.color} onPick={(c) => up({ color: c } as Partial<Element>)} />
        </Row>
      )}

      {/* --- Signature --- */}
      {el.type === 'signature' && (
        <>
          <Row label="Mode">
            <SegButtons
              options={[
                { v: 'type', t: 'Saisir' },
                { v: 'draw', t: 'Dessiner' },
              ]}
              current={el.mode}
              onPick={(v) => up({ mode: v } as Partial<Element>)}
            />
          </Row>
          {el.mode === 'type' ? (
            <>
              <Row label="Nom">
                <Input
                  value={el.name || ''}
                  label="Nom pour la signature"
                  onFocus={() => commit()}
                  onChange={(e) => up({ name: e.target.value, sigSrc: null } as Partial<Element>)}
                />
              </Row>
              <div className={s.hint}>Signature manuscrite stylisée.</div>
            </>
          ) : (
            <Row label="Tracé">
              <SignaturePad el={el} />
            </Row>
          )}
        </>
      )}

      {/* --- Image --- */}
      {el.type === 'image' && (
        <>
          <Row label="Source">
            <ActionButton
              label="Choisir une image"
              icon="fas fa-upload"
              onClick={() => pickImageFor(el.id)}
            />
          </Row>
          <Row label="Opacité">
            <Slider
              value={el.opacity != null ? el.opacity : 1}
              min={0.1}
              max={1}
              step={0.05}
              label="Opacité"
              display={`${Math.round((el.opacity != null ? el.opacity : 1) * 100)}%`}
              onChange={(v) => up({ opacity: v } as Partial<Element>)}
            />
          </Row>
        </>
      )}

      {/* --- Surlignage --- */}
      {el.type === 'highlight' && (
        <Row label="Couleur">
          <Swatches colors={HILITE} current={el.color} onPick={(c) => up({ color: c } as Partial<Element>)} />
        </Row>
      )}

      {/* --- Caviardage --- */}
      {el.type === 'redaction' && (
        <div className={s.note}>
          Zone noire opaque qui masque définitivement le contenu à l’export.
        </div>
      )}

      {/* --- Forme --- */}
      {el.type === 'shape' && (
        <>
          <Row label="Forme">
            <SegButtons
              options={[
                { v: 'rect', i: 'far fa-square' },
                { v: 'ellipse', i: 'far fa-circle' },
                { v: 'line', i: 'fas fa-minus' },
              ]}
              current={el.shape}
              onPick={(v) => up({ shape: v } as Partial<Element>)}
            />
          </Row>
          {el.shape !== 'line' ? (
            <Row label="Remplissage">
              <Swatches
                colors={PALETTE}
                current={el.fill}
                allowNone
                onPick={(c) => up({ fill: c } as Partial<Element>)}
              />
            </Row>
          ) : null}
          <Row label="Contour">
            <Swatches colors={PALETTE} current={el.stroke} onPick={(c) => up({ stroke: c } as Partial<Element>)} />
          </Row>
          <Row label="Épaisseur">
            <Slider
              value={el.strokeW}
              min={1}
              max={12}
              step={0.5}
              label="Épaisseur du contour"
              display={`${el.strokeW}px`}
              onChange={(v) => up({ strokeW: v } as Partial<Element>)}
            />
          </Row>
        </>
      )}

      {/* --- Dessin --- */}
      {el.type === 'draw' && (
        <>
          <Row label="Couleur">
            <Swatches colors={PALETTE} current={el.color} onPick={(c) => up({ color: c } as Partial<Element>)} />
          </Row>
          <Row label="Épaisseur">
            <Slider
              value={el.strokeW}
              min={1}
              max={10}
              step={0.5}
              label="Épaisseur du tracé"
              display={`${el.strokeW}px`}
              onChange={(v) => up({ strokeW: v } as Partial<Element>)}
            />
          </Row>
        </>
      )}

      {/* --- Commun : position & taille --- */}
      <Row label="Position & taille">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <NumInput value={el.x} label="X" onChange={(v) => up({ x: v })} />
            <NumInput value={el.y} label="Y" onChange={(v) => up({ y: v })} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <NumInput value={el.w} label="L" onChange={(v) => up({ w: v })} />
            <NumInput value={el.h} label="H" onChange={(v) => up({ h: v })} />
          </div>
        </div>
      </Row>

      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <ActionButton label="Avant" icon="fas fa-arrow-up" onClick={bringFront} />
        <ActionButton label="Arrière" icon="fas fa-arrow-down" onClick={sendBack} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <ActionButton label="Dupliquer" icon="fas fa-clone" onClick={duplicateSel} />
        <ActionButton label="Supprimer" icon="fas fa-trash" onClick={deleteSel} danger />
      </div>
    </div>
  );
}

/** Ouvre un sélecteur d'image pour l'élément image donné. */
function pickImageFor(id: string) {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'image/*';
  inp.onchange = () => {
    const f = inp.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      const img = new Image();
      img.onload = () => {
        const el = useEditor.getState().getEl(id);
        const w = el ? el.w : 140;
        useEditor.getState().updateEl(id, { src: rd.result as string, h: w * (img.height / img.width) });
      };
      img.src = rd.result as string;
      useEditor.getState().updateEl(id, { src: rd.result as string });
    };
    rd.readAsDataURL(f);
  };
  inp.click();
}
