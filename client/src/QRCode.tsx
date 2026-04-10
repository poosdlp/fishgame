// eslint-disable-next-line @typescript-eslint/no-explicit-any
import QRCodeImport from 'react-qr-code';
const QRCode = (QRCodeImport as any).default || QRCodeImport;

interface QRCodePopupProps {
  value: string;
  onClose: () => void;
}

export default function QRCodePopup({ value, onClose }: QRCodePopupProps) {
  return (
    <div className="qr-overlay" onClick={onClose}>
      <div className="qr-popup" onClick={(e) => e.stopPropagation()}>
        <button className="qr-close" onClick={onClose}>&times;</button>
        <QRCode value={value} />
      </div>
    </div>
  );
}
