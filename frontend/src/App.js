import { useMemo, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './App.css';

const MODES = [
  { key: 'text', label: 'Plain Text' },
  { key: 'url', label: 'URL' },
  { key: 'wifi', label: 'Wi-Fi' },
];

const WIFI_ENCRYPTIONS = ['WPA', 'WPA2', 'WPA3', 'WEP', 'nopass'];

const escapeForWifi = (value) => value.replace(/([\\;,:"'])/g, '\\$1');

const buildWifiPayload = ({ ssid, password, encryption, hidden }) => {
  if (!ssid.trim()) return '';

  const parts = [`WIFI:T:${encryption || 'nopass'}`, `S:${escapeForWifi(ssid)}`];

  if (encryption && encryption.toLowerCase() !== 'nopass' && password.trim()) {
    parts.push(`P:${escapeForWifi(password)}`);
  } else if (encryption && encryption.toLowerCase() !== 'nopass' && !password.trim()) {
    return '';
  }

  if (hidden) {
    parts.push('H:true');
  }

  return `${parts.join(';')};;`;
};

const isValidUrl = (value) => {
  try {
    const normalized = new URL(value);
    return ['http:', 'https:'].includes(normalized.protocol);
  } catch (error) {
    return false;
  }
};

function App() {
  const [mode, setMode] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [wifiInput, setWifiInput] = useState({
    ssid: '',
    password: '',
    encryption: 'WPA2',
    hidden: false,
  });

  const canvasRef = useRef(null);

  const { qrValue, errorMessage } = useMemo(() => {
    if (mode === 'text') {
      const trimmed = textInput.trim();
      return trimmed
        ? { qrValue: trimmed, errorMessage: null }
        : { qrValue: '', errorMessage: 'Enter the text you want encoded.' };
    }

    if (mode === 'url') {
      const candidate = urlInput.trim();
      if (!candidate) {
        return { qrValue: '', errorMessage: 'Provide a URL to share.' };
      }

      if (!isValidUrl(candidate)) {
        return { qrValue: '', errorMessage: 'Please enter a valid HTTP/HTTPS URL.' };
      }

      return { qrValue: candidate, errorMessage: null };
    }

    if (mode === 'wifi') {
      const payload = buildWifiPayload(wifiInput);
      if (!payload) {
        const needsPassword =
          wifiInput.encryption && wifiInput.encryption.toLowerCase() !== 'nopass';
        const missing = !wifiInput.ssid.trim() ? 'SSID is required.' : needsPassword ? 'Password is required for the chosen security type.' : '';
        return { qrValue: '', errorMessage: missing || 'Fill in the Wi-Fi details to generate the code.' };
      }

      return { qrValue: payload, errorMessage: null };
    }

    return { qrValue: '', errorMessage: 'Select a mode to begin.' };
  }, [mode, textInput, urlInput, wifiInput]);

  const canDownload = Boolean(qrValue && !errorMessage);

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = `qr-${mode}.png`;
    link.click();
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Instant QR code generator</p>
          <h1>Share text, links, or Wi-Fi logins with one tap.</h1>
          <p className="subhead">
            Switch between modes, enter what you want to share, and download a clean, high-contrast QR code.
          </p>
        </div>
      </header>

      <main className="grid">
        <section className="panel input-panel">
          <div className="mode-toggle" role="tablist">
            {MODES.map((option) => (
              <button
                key={option.key}
                className={`mode-button ${mode === option.key ? 'active' : ''}`}
                onClick={() => setMode(option.key)}
                type="button"
                role="tab"
                aria-selected={mode === option.key}
              >
                {option.label}
              </button>
            ))}
          </div>

          {mode === 'text' && (
            <div className="input-group">
              <label htmlFor="textInput">Text to encode</label>
              <textarea
                id="textInput"
                value={textInput}
                onChange={(event) => setTextInput(event.target.value)}
                placeholder="Any message, code snippet, or note goes here"
                rows={4}
              />
              <p className="hint">Works for notes, addresses, or short announcements.</p>
            </div>
          )}

          {mode === 'url' && (
            <div className="input-group">
              <label htmlFor="urlInput">Link</label>
              <input
                id="urlInput"
                type="url"
                value={urlInput}
                onChange={(event) => setUrlInput(event.target.value)}
                placeholder="https://example.com"
              />
              <p className="hint">Supports any HTTP or HTTPS address.</p>
            </div>
          )}

          {mode === 'wifi' && (
            <div className="wifi-form">
              <div className="input-group">
                <label htmlFor="ssid">Network name (SSID)</label>
                <input
                  id="ssid"
                  type="text"
                  value={wifiInput.ssid}
                  onChange={(event) => setWifiInput({ ...wifiInput, ssid: event.target.value })}
                  placeholder="My Coffee Shop Wi-Fi"
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={wifiInput.password}
                  onChange={(event) => setWifiInput({ ...wifiInput, password: event.target.value })}
                  placeholder="Leave blank for open networks"
                />
              </div>

              <div className="input-row">
                <label htmlFor="encryption">Security</label>
                <select
                  id="encryption"
                  value={wifiInput.encryption}
                  onChange={(event) => setWifiInput({ ...wifiInput, encryption: event.target.value })}
                >
                  {WIFI_ENCRYPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type === 'nopass' ? 'No password (open)' : type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-row">
                <label htmlFor="hidden" className="switch-label">
                  <input
                    id="hidden"
                    type="checkbox"
                    checked={wifiInput.hidden}
                    onChange={(event) => setWifiInput({ ...wifiInput, hidden: event.target.checked })}
                  />
                  <span>Hidden network</span>
                </label>
              </div>
              <p className="hint">Only Wi-Fi details will be encoded; nothing is sent anywhere.</p>
            </div>
          )}

          {errorMessage && <p className="error">{errorMessage}</p>}
        </section>

        <section className="panel preview-panel">
          <div className="preview">
            <QRCodeCanvas
              value={qrValue || ' '}
              size={320}
              level="H"
              includeMargin
              ref={canvasRef}
            />
          </div>

          <p className="status">
            {canDownload
              ? 'Code is ready — download and share it anywhere you like.'
              : 'Adjust the inputs above to render a QR code preview.'}
          </p>

          <button className="download" type="button" disabled={!canDownload} onClick={handleDownload}>
            Download QR code
          </button>
        </section>
      </main>
    </div>
  );
}

export default App;
