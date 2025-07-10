// QRRenderer.js (Keep this component as is)
import { QRCodeCanvas } from 'qrcode.react';

const QRRenderer = ({ urls }) => {
  // Safety checks - return null immediately if no URLs to avoid rendering empty components
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return null;
  }

  return (
    <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
      {urls.map((url, index) => {
        return (
          <div 
            key={`${url}-${index}`} // More unique key to help with cleanup
            id={`qr-${index}`} 
            style={{ 
              background: 'white', 
              padding: '18px', 
              width: '850px', 
              height: '850px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <QRCodeCanvas
              value={url}
              size={600}
              fgColor={"#000000"}
              bgColor={"#FFFFFF"}
              level={"H"}
            />
          </div>
        );
      })}
    </div>
  );
};

export default QRRenderer;