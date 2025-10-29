'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

export default function Camera() {
  const scannerRef = useRef(null)
  const [queue, setQueue] = useState([])
  const [ready, setReady] = useState(false)
  const [permissionState, setPermissionState] = useState('prompt')

  // Check camera permission
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

  // Initialize scanner
  useEffect(() => {
    if (!ready) return
    if (permissionState === 'denied') {
      console.warn('Camera permission denied')
      return
    }

    const elementId = 'camera-scanner'
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
        // Extract student_id from QR code
        let studentId = null;
        try {
          const url = new URL(decodedText);
          studentId = url.searchParams.get('student_id');
        } catch {
          // If not a valid URL, check if it's a student ID directly
          // Assuming student IDs are 4 characters long
          if (decodedText.length === 4) {
            studentId = decodedText;
          }
        }
        
        if (studentId) {
          // Add to localStorage queue
          const storedQueue = JSON.parse(localStorage.getItem('student_queue') || '[]');
          // Check if studentId already exists in queue to avoid duplicates
          if (!storedQueue.includes(studentId)) {
            const newQueue = [...storedQueue, studentId];
            localStorage.setItem('student_queue', JSON.stringify(newQueue));
            setQueue(newQueue);
          }
          
          // Provide haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate([200]);
          }
        }
        
        // Clear and restart scanner to continue scanning
        scanner.clear().catch(console.error);
        setTimeout(() => {
          scanner.render(
            (decodedText) => {
              // Extract student_id from QR code
              let studentId = null;
              try {
                const url = new URL(decodedText);
                studentId = url.searchParams.get('student_id');
              } catch {
                // If not a valid URL, check if it's a student ID directly
                // Assuming student IDs are 4 characters long
                if (decodedText.length === 4) {
                  studentId = decodedText;
                }
              }
              
              if (studentId) {
                // Add to localStorage queue
                const storedQueue = JSON.parse(localStorage.getItem('student_queue') || '[]');
                // Check if studentId already exists in queue to avoid duplicates
                if (!storedQueue.includes(studentId)) {
                  const newQueue = [...storedQueue, studentId];
                  localStorage.setItem('student_queue', JSON.stringify(newQueue));
                  setQueue(newQueue);
                }
                
                // Provide haptic feedback
                if (navigator.vibrate) {
                  navigator.vibrate([200]);
                }
              }
            },
            (error) => console.error('Scanner error:', error)
          );
        }, 100);
      },
      (error) => console.error('Scanner error:', error)
    );

    scannerRef.current = scanner

    // Cleanup on unmount
    return () => {
      scannerRef.current?.clear()
        .then(() => {
          const el = document.getElementById(elementId)
          if (el) el.innerHTML = ''
        })
        .catch(console.error)
    }
  }, [ready, permissionState])

  // Log queue whenever it changes
  useEffect(() => {
    console.log('Queue:', queue)
  }, [queue])

  // Handle denied state
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

  // Render scanner container
  return (
    <div className="w-full h-full">
      <div id="camera-scanner" className="w-full h-full"></div>
    </div>
  )
}