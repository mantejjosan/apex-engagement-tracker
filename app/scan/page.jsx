'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

export default function QRScanner({ onScan, onError }) {
  const scannerRef = useRef(null)
  const [hasCamera, setHasCamera] = useState(true)

  useEffect(() => {
    // Check if camera is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCamera(false)
      return
    }

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        rememberLastUsedCamera: true,
        // Don't specify formatsToSupport to avoid BarcodeDetector hint issue on mobile
      },
      false
    )

    scanner.render(
      (decodedText) => {
        // Success callback
        console.log('QR Code detected:', decodedText)
        onScan(decodedText)
        
        // Stop scanner after successful scan
        scanner.clear().catch(err => console.error('Error clearing scanner:', err))
      },
      (error) => {
        // Error callback (can be ignored for most cases)
        // This fires frequently during scanning, so we don't log it
      }
    )

    scannerRef.current = scanner

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error('Cleanup error:', err))
      }
    }
  }, [onScan])

  if (!hasCamera) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📷</div>
        <h3 className="text-xl font-bold mb-2">Camera Not Available</h3>
        <p className="text-gray-600 mb-4">
          Please scan the QR code with your camera app or Google Lens, <br />
          then open the link to participate.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Antique Wooden Frame */}
      <div className="antique-frame">
        <div className="frame-corner frame-corner-tl"></div>
        <div className="frame-corner frame-corner-tr"></div>
        <div className="frame-corner frame-corner-bl"></div>
        <div className="frame-corner frame-corner-br"></div>
        
        <div className="frame-inner">
          <div id="qr-reader" className="w-full"></div>
        </div>
      </div>
      
      <style jsx global>{`
        /* Antique Frame Styling */
        .antique-frame {
          position: relative;
          padding: 24px;
          background: linear-gradient(135deg, #8b7355 0%, #6b5644 50%, #8b7355 100%);
          border-radius: 8px;
          box-shadow: 
            inset 0 0 20px rgba(0,0,0,0.3),
            inset 0 2px 4px rgba(255,255,255,0.2),
            0 8px 24px rgba(0,0,0,0.3);
        }

        .frame-inner {
          position: relative;
          padding: 16px;
          background: linear-gradient(to bottom, #f4e4c1 0%, #e8d4a8 100%);
          border-radius: 4px;
          box-shadow: 
            inset 0 2px 8px rgba(0,0,0,0.15),
            0 2px 4px rgba(0,0,0,0.1);
        }

        /* Ornate Corner Decorations */
        .frame-corner {
          position: absolute;
          width: 40px;
          height: 40px;
          background: radial-gradient(circle at center, #d4af37 0%, #b8941f 50%, #8b7355 100%);
          z-index: 10;
        }

        .frame-corner::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 24px;
          height: 24px;
          background: radial-gradient(circle, #f4e4c1 0%, transparent 70%);
          border-radius: 50%;
        }

        .frame-corner-tl {
          top: -8px;
          left: -8px;
          border-radius: 50% 8px 8px 8px;
          box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .frame-corner-tr {
          top: -8px;
          right: -8px;
          border-radius: 8px 50% 8px 8px;
          box-shadow: -2px 2px 4px rgba(0,0,0,0.3);
        }

        .frame-corner-bl {
          bottom: -8px;
          left: -8px;
          border-radius: 8px 8px 8px 50%;
          box-shadow: 2px -2px 4px rgba(0,0,0,0.3);
        }

        .frame-corner-br {
          bottom: -8px;
          right: -8px;
          border-radius: 8px 8px 50% 8px;
          box-shadow: -2px -2px 4px rgba(0,0,0,0.3);
        }

        /* Wood grain texture (subtle) */
        .antique-frame::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,0.03) 2px,
              rgba(0,0,0,0.03) 4px
            );
          border-radius: 8px;
          pointer-events: none;
        }

        /* QR Reader Styling */
        #qr-reader {
          border: none !important;
          background: white;
          border-radius: 4px;
          overflow: hidden;
        }
        
        #qr-reader__dashboard_section_csr button {
          background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%) !important;
          color: #3d2817 !important;
          border: 2px solid #8b7355 !important;
          padding: 12px 24px !important;
          border-radius: 6px !important;
          font-weight: 700 !important;
          cursor: pointer !important;
          text-shadow: 0 1px 2px rgba(255,255,255,0.3) !important;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
        }
        
        #qr-reader__dashboard_section_csr button:hover {
          background: linear-gradient(135deg, #e8c74a 0%, #c9a838 100%) !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.25) !important;
        }

        #qr-reader video {
          border-radius: 4px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }

        #qr-reader__dashboard_section_swaplink {
          display: none !important;
        }

        /* Scanning overlay effect */
        @keyframes shimmer {
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }

        #qr-reader__scan_region {
          border: 3px solid #d4af37 !important;
          box-shadow: 
            0 0 0 4px rgba(212, 175, 55, 0.2),
            inset 0 0 20px rgba(212, 175, 55, 0.1) !important;
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}