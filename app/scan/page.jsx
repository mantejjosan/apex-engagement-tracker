'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import QRScanner from '@/components/qrscanner'
import Logo from '@/components/logo'

export default function ScanPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const eventIdFromUrl = searchParams.get('event')

    const [status, setStatus] = useState('idle') // idle, processing, success, error, cooldown
    const [message, setMessage] = useState('')
    const [eventName, setEventName] = useState('')
    const [cooldownTime, setCooldownTime] = useState(null)
    const [showScanner, setShowScanner] = useState(!eventIdFromUrl)

    useEffect(() => {
        // If event ID is in URL (from QR scan via Google Lens), process it immediately
        if (eventIdFromUrl) {
            processEventId(eventIdFromUrl)
        }
    }, [eventIdFromUrl])

    const extractEventId = (qrContent) => {
        // QR content could be:
        // 1. Full URL: https://apex.gndec.edu/scan?event=uuid
        // 2. Just the UUID

        try {
            // Try parsing as URL
            const url = new URL(qrContent)
            const eventId = url.searchParams.get('event')
            if (eventId) return eventId
        } catch {
            // Not a valid URL, might be just the UUID
            // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            if (uuidRegex.test(qrContent)) {
                return qrContent
            }
        }

        return null
    }

    const processEventId = async (eventId) => {
        setStatus('processing')
        setMessage('Recording your participation...')

        try {
            const res = await fetch('/api/record-participation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId })
            })

            const data = await res.json()

            if (!res.ok) {
                if (res.status === 429 && data.error === 'cooldown') {
                    // Cooldown active
                    setStatus('cooldown')
                    setMessage(data.message)
                    setEventName(data.event?.name || 'this event')
                    setCooldownTime(data.cooldownUntil)
                    return
                }

                // Other errors
                setStatus('error')
                setMessage(data.error || 'Failed to record participation')
                return
            }

            // Success!
            setStatus('success')
            setEventName(data.event.name)
            setMessage('Participation recorded successfully!')

        } catch (error) {
            console.error('Error:', error)
            setStatus('error')
            setMessage('Connection error. Please check your internet.')
        }
    }

    const handleQRScan = (qrContent) => {
        console.log('QR scanned:', qrContent)

        const eventId = extractEventId(qrContent)

        if (!eventId) {
            setStatus('error')
            setMessage('Invalid QR code. Please scan an event QR code.')
            setTimeout(() => {
                setStatus('idle')
                setShowScanner(true)
            }, 3000)
            return
        }

        setShowScanner(false)
        processEventId(eventId)
    }

    const handleScanAnother = () => {
        setStatus('idle')
        setMessage('')
        setEventName('')
        setCooldownTime(null)
        setShowScanner(true)

        // Clear URL params
        router.push('/scan')
    }

    const handleGoHome = () => {
        router.push('/')
    }

    return (
        <div className="min-h-screen ">
            {/* Header */}
            <div className="">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="shrink-0">

                                <Logo size="sm" />
                            </div>
                            <h1 className="text-xl flex-1 font-bold">Apex 2025</h1>
                        </div>
                        <button
                            onClick={handleGoHome}
                            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-100"
                        >
                            Home
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-4 py-6">
                <div className="bg-card rounded-xl shadow-lg p-6">

                    {/* Idle State - Show Scanner */}
                    {status === 'idle' && showScanner && (
                        <div>
                            <h2 className="text-2xl font-bold text-center mb-6">
                                Scan Event QR Code
                            </h2>
                            <QRScanner onScan={handleQRScan} />
                            <p className="text-center text-gray-600 text-sm mt-4">
                                Point your camera at the event QR code
                            </p>
                        </div>
                    )}

                    {/* Processing State */}
                    {status === 'processing' && (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-lg text-gray-600">{message}</p>
                        </div>
                    )}

                    {/* Success State */}
                    {status === 'success' && (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
                            <p className="text-lg text-gray-600 mb-1">Participation recorded for</p>
                            <p className="text-xl font-semibold text-primary mb-6">{eventName}</p>

                            <div className="space-y-3">
                                <button
                                    onClick={handleScanAnother}
                                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                                >
                                    Scan Another Event
                                </button>
                                <button
                                    onClick={handleGoHome}
                                    className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                                >
                                    View My Participations
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Cooldown State */}
                    {status === 'cooldown' && (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Cooldown Active</h3>
                            <p className="text-gray-600 mb-6">{message}</p>
                            <p className="text-sm text-gray-500 mb-6">
                                You can scan other events in the meantime!
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={handleScanAnother}
                                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                                >
                                    Scan Different Event
                                </button>
                                <button
                                    onClick={handleGoHome}
                                    className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                                >
                                    Go Home
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {status === 'error' && (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h3>
                            <p className="text-gray-600 mb-6">{message}</p>

                            <button
                                onClick={handleScanAnother}
                                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}