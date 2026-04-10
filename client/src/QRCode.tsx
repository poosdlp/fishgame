import { QRCode } from 'react-qr-code';

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
