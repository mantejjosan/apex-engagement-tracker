'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

export default function QRScanner({ onScan, onError }) {
  const scannerRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [permissionState, setPermissionState] = useState('prompt')

  // 🔍 Step 1: Check camera permission
  useEffect(() => {
    async function checkPermission() {
      try {
        const status = await navigator.permissions.query({ name: 'camera' })
        setPermissionState(status.state)
        status.onchange = () => setPermissionState(status.state)
      } catch {
        // Safari or some older browsers may not support Permissions API
        setPermissionState('unknown')
      }
      setReady(true)
    }

    checkPermission()
  }, [])

  // 🎥 Step 2: Initialize scanner when permission allows
  useEffect(() => {
    if (!ready) return
    if (permissionState === 'denied') {
      console.warn('Camera permission denied')
      return
    }

    const elementId = 'qr-reader'
    const el = document.getElementById(elementId)
    if (el) el.innerHTML = '' // clear any leftover DOM

    const scanner = new Html5QrcodeScanner(
      elementId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        rememberLastUsedCamera: true,
        defaultZoomValueIfSupported: 2,
        videoConstraints: { facingMode: { ideal: 'environment' } },
      },
      false
    )

    scanner.render(
      (decodedText) => {
        onScan(decodedText)
        scanner.clear().catch(console.error)
      },
      (error) => onError?.(error)
    )

    scannerRef.current = scanner

    // 🧹 Cleanup on unmount or reinit
    return () => {
      scannerRef.current?.clear()
        .then(() => {
          const el = document.getElementById(elementId)
          if (el) el.innerHTML = ''
        })
        .catch(console.error)
    }
  }, [ready, permissionState, onScan, onError])

  // 🚫 Step 3: Handle denied state
  if (permissionState === 'denied') {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🚫</div>
        <h3 className="text-xl font-bold mb-2">Camera Access Denied</h3>
        <p className="text-gray-600">
          Please enable camera access in your browser settings and reload this page.
        </p>
      </div>
    )
  }

  // 🟢 Step 4: Render scanner container
  return (
    <div className="w-full">
      <div id="qr-reader" className="w-full"></div>
    </div>
  )
}
