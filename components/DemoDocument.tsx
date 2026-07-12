'use client';

import { useEditor } from '@/lib/store';
import { ACCENT } from '@/lib/tokens';

/** Champ texte inline du document de démo, lié à fieldValues. */
function DemoField({ k, ph, w }: { k: string; ph?: string; w?: number }) {
  const value = useEditor((st) => st.fieldValues[k]);
  const setField = useEditor((st) => st.setField);
  const commit = useEditor((st) => st.commit);
  return (
    <input
      type="text"
      value={typeof value === 'string' ? value : ''}
      placeholder={ph}
      aria-label={ph || k}
      onFocus={() => commit()}
      onChange={(e) => setField(k, e.target.value)}
      style={{
        border: 'none',
        borderBottom: '1.5px dashed #7DA7D6',
        background: 'rgba(0,117,241,.06)',
        fontFamily: 'inherit',
        fontSize: 15,
        color: '#0053B2',
        padding: '1px 5px',
        width: w || 150,
        outline: 'none',
        borderRadius: '2px 2px 0 0',
      }}
    />
  );
}

/** Case à cocher (glyphe FA) du document de démo. */
function DemoCheck({ k, label }: { k: string; label: string }) {
  const on = useEditor((st) => !!st.fieldValues[k]);
  const setField = useEditor((st) => st.setField);
  const commit = useEditor((st) => st.commit);
  return (
    <div
      role="checkbox"
      aria-checked={on}
      aria-label={label}
      tabIndex={0}
      onClick={() => {
        commit();
        setField(k, !on);
      }}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          commit();
          setField(k, !on);
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        cursor: 'pointer',
        fontSize: 15,
        color: '#1C2527',
        marginBottom: 7,
      }}
    >
      <i
        className={on ? 'fas fa-square-check' : 'far fa-square'}
        style={{ color: on ? ACCENT : '#8E9299', fontSize: 18 }}
        aria-hidden="true"
      />
      {label}
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return <span style={{ color: '#2C3E50' }}>{children}</span>;
}

/** Attestation de domicile municipale, dessinée en HTML/CSS (aucun asset). */
export default function DemoDocument() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: '62px 64px',
        fontSize: 15,
        lineHeight: 1.7,
        color: '#1C2527',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '2px solid #2C3E50',
          paddingBottom: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 13, letterSpacing: '.16em', color: '#2C3E50', fontWeight: 600 }}>
            RÉPUBLIQUE FRANÇAISE
          </div>
          <div style={{ fontSize: 19, fontWeight: 500, color: '#2C3E50', marginTop: 2 }}>
            Commune de Sainte-Colombe
          </div>
          <div style={{ fontSize: 12.5, color: '#8E9299' }}>Service population · État civil</div>
        </div>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 8,
            background: '#0075F1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          SC
        </div>
      </div>

      <div
        style={{
          textAlign: 'center',
          fontSize: 26,
          fontWeight: 300,
          letterSpacing: '-.5px',
          color: '#2C3E50',
          margin: '30px 0 6px',
        }}
      >
        Attestation de domicile
      </div>
      <div style={{ textAlign: 'center', fontSize: 13, color: '#8E9299', marginBottom: 26 }}>
        À remplir et à signer par le déclarant
      </div>

      <p style={{ margin: '0 0 4px' }}>
        Je soussigné(e) <DemoField k="nom" ph="NOM" w={140} /> <DemoField k="prenom" ph="Prénom" w={140} />,
      </p>
      <p style={{ margin: '0 0 4px' }}>
        demeurant <DemoField k="adresse" ph="Adresse complète" w={280} />,
      </p>
      <p style={{ margin: '0 0 18px' }}>
        <DemoField k="cp" ph="Code postal" w={90} /> <DemoField k="ville" ph="Commune" w={180} />.
      </p>

      <p style={{ margin: '0 0 10px' }}>
        Atteste sur l’honneur héberger à mon domicile la personne suivante&nbsp;:
      </p>
      <div style={{ background: '#F3F5F7', borderRadius: 8, padding: '16px 18px', margin: '0 0 20px' }}>
        <p style={{ margin: '0 0 6px' }}>
          <Lbl>Nom&nbsp;: </Lbl>
          <DemoField k="b_nom" w={150} /> <Lbl>Prénom&nbsp;: </Lbl>
          <DemoField k="b_prenom" w={150} />
        </p>
        <p style={{ margin: 0 }}>
          <Lbl>Né(e) le&nbsp;: </Lbl>
          <DemoField k="b_date" ph="JJ/MM/AAAA" w={130} /> <Lbl>à&nbsp;: </Lbl>
          <DemoField k="b_lieu" w={170} />
        </p>
      </div>

      <p style={{ margin: '0 0 8px' }}>Motif de la demande&nbsp;:</p>
      <DemoCheck k="m1" label="Inscription sur les listes électorales" />
      <DemoCheck k="m2" label="Constitution d’un dossier administratif" />
      <DemoCheck k="m3" label="Autre démarche auprès de la mairie" />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginTop: 34,
        }}
      >
        <div>
          <p style={{ margin: '0 0 2px' }}>
            Fait à <DemoField k="fait_a" w={150} />,
          </p>
          <p style={{ margin: 0 }}>
            le <DemoField k="fait_le" ph="JJ/MM/AAAA" w={130} />.
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#8E9299', marginBottom: 6 }}>Signature</div>
          <div style={{ width: 200, height: 84, border: '1px dashed #BBC7D2', borderRadius: 6 }} />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 64,
          right: 64,
          bottom: 44,
          borderTop: '1px solid #E6EBEF',
          paddingTop: 8,
          fontSize: 11,
          color: '#BBC7D2',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>Mairie de Sainte-Colombe · Place de l’Hôtel de Ville</span>
        <span>Document généré via la plateforme Publidata</span>
      </div>
    </div>
  );
}

/** Clés + libellés des champs du doc démo (pour DocumentPanel « Champs détectés »). */
export const DEMO_FIELDS: Array<[string, string]> = [
  ['nom', 'Nom'],
  ['prenom', 'Prénom'],
  ['adresse', 'Adresse'],
  ['cp', 'Code postal'],
  ['ville', 'Commune'],
  ['b_nom', 'Bénéf. — Nom'],
  ['b_prenom', 'Bénéf. — Prénom'],
  ['b_date', 'Bénéf. — Naissance'],
  ['b_lieu', 'Bénéf. — Lieu'],
  ['fait_a', 'Fait à'],
  ['fait_le', 'Le'],
];
