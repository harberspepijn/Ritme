import { useRef, useState } from 'react';
import {
  Download,
  Upload,
  ShieldCheck,
  Trash2,
  Monitor,
  Sun,
  Moon,
  Smartphone,
} from 'lucide-react';
import Modal from './Modal';
import { localDate, parseImport, type Data } from '../model';
export default function Settings({
  data,
  onTheme,
  onImport,
  onClear,
  onClose,
}: {
  data: Data;
  onTheme: (theme: Data['theme']) => void;
  onImport: (data: Data) => Promise<void>;
  onClear: () => Promise<void>;
  onClose: () => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [candidate, setCandidate] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [clearing, setClearing] = useState(false);
  const [clearWord, setClearWord] = useState('');
  const [busy, setBusy] = useState(false);
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `ritme-${localDate()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Je export is aangemaakt. Bewaar het bestand op een veilige plek.');
  }
  async function importFile(file: File | undefined) {
    setError('');
    setCandidate(null);
    setNotice('');
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('Kies een bestand kleiner dan 10 MB.');
      return;
    }
    try {
      setCandidate(parseImport(await file.text()));
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function applyImport() {
    if (!candidate) return;
    setBusy(true);
    try {
      await onImport(candidate);
      setCandidate(null);
      setNotice('Je gegevens zijn geïmporteerd.');
    } catch {
      setError('Importeren is niet gelukt. Je huidige gegevens zijn behouden.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Helemaal van jou." subtitle="Je voorkeuren en je gegevens." onClose={onClose}>
      <div className="settings-content">
        <section>
          <h3>Weergave</h3>
          <div className="theme-options">
            {(
              [
                ['system', 'Systeem', Monitor],
                ['light', 'Licht', Sun],
                ['dark', 'Donker', Moon],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                aria-pressed={data.theme === value}
                onClick={() => onTheme(value)}
              >
                <Icon size={19} />
                {label}
              </button>
            ))}
          </div>
        </section>
        <section>
          <h3>Je gegevens meenemen</h3>
          <p className="muted">
            Maak af en toe een export. Zo heb je zelf een back-up, of neem je je ritme mee naar een
            andere browser.
          </p>
          <div className="settings-actions">
            <button className="button secondary" onClick={download}>
              <Download size={17} />
              Exporteren
            </button>
            <button className="button secondary" onClick={() => fileInput.current?.click()}>
              <Upload size={17} />
              Importeren
            </button>
            <input
              ref={fileInput}
              className="sr-only"
              type="file"
              accept=".json,application/json"
              aria-label="Ritme-bestand importeren"
              onChange={(e) => {
                void importFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>
          {candidate && (
            <div className="import-preview">
              <h4>Bestand gecontroleerd</h4>
              <p>
                {candidate.habits.length} {candidate.habits.length === 1 ? 'gewoonte' : 'gewoontes'}{' '}
                · {candidate.logs.length}{' '}
                {candidate.logs.length === 1 ? 'dagregistratie' : 'dagregistraties'}
              </p>
              <p>
                Dit vervangt je huidige {data.habits.length}{' '}
                {data.habits.length === 1 ? 'gewoonte' : 'gewoontes'} en {data.logs.length}{' '}
                {data.logs.length === 1 ? 'dagregistratie' : 'dagregistraties'}. Exporteer eerst als
                je die wilt bewaren.
              </p>
              <div className="settings-actions">
                <button className="button secondary" onClick={() => setCandidate(null)}>
                  Annuleren
                </button>
                <button className="button primary" disabled={busy} onClick={applyImport}>
                  Vervangen en importeren
                </button>
              </div>
            </div>
          )}
        </section>
        <section className="privacy-note">
          <ShieldCheck size={23} />
          <div>
            <h3>Privé, op dit apparaat.</h3>
            <p>
              Ritme bewaart alles in deze browser. Geen account, analytics of externe verwerking.
              Lokale opslag is geen beveiligde kluis en geen automatische back-up. Wissen van
              browsergegevens verwijdert ook je ritme.
            </p>
          </div>
        </section>
        <section className="install-note">
          <Smartphone size={23} />
          <div>
            <h3>Ritme op je beginscherm</h3>
            <p>
              Open de app via HTTPS en kies ‘App installeren’ in je browser. Op iPhone: Safari →
              Deel → Zet op beginscherm. Na het eerste volledige bezoek werkt de app ook offline.
            </p>
            <p>
              Een gewenst tijdstip verstuurt geen melding. Schermtijd en momenten registreer je
              zelf.
            </p>
          </div>
        </section>
        <section className="danger-zone">
          <button className="text-button danger" onClick={() => setClearing(!clearing)}>
            <Trash2 size={16} />
            Alle gegevens wissen
          </button>
          {clearing && (
            <div className="delete-confirm">
              <p>
                Dit verwijdert alle gewoontes en registraties uit deze browser. Maak eerst een
                export als je ze wilt bewaren.
              </p>
              <label>
                Typ WISSEN om te bevestigen
                <input
                  value={clearWord}
                  onChange={(e) => setClearWord(e.target.value)}
                  autoComplete="off"
                />
              </label>
              <button
                className="button danger-button"
                disabled={clearWord !== 'WISSEN' || busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await onClear();
                    onClose();
                  } catch {
                    setError('Wissen is niet gelukt.');
                    setBusy(false);
                  }
                }}
              >
                Definitief alles wissen
              </button>
            </div>
          )}
        </section>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="success-message" role="status">
            {notice}
          </p>
        )}
        <p className="version-label">RITME 1.0 · OP JOUW TEMPO</p>
      </div>
    </Modal>
  );
}
