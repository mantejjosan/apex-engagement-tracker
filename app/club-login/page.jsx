'use client'
import Logo from "@/components/logo"
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react"
import Link from "next/link";

export default function ClubLogin() {
    const [loading, setLoading] = useState(false);
    const [clubId, setClubId] = useState('');
    const [error, setError] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect') || '/clubdashboard'

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true);

        if (clubId.length !== 4) {
            setError('Club Id has to be 4 characters long')
            setLoading(false)
            return
        }
        try {
            const res = await fetch('/api/auth/club-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clubId })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Invalid Club ID')
                setLoading(false)
                return
            }
            router.push(redirect)

        } catch (err) {
            setError('Connection error. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row gap-4 items-center justify-center p-4 "> 
        <div className="relative flex flex-col items-center bg-card rounded-xl shadow-xl p-8 w-full max-w-md">
            <div className="absolute -top-20 rotate-6">
                <Logo size="lg" animated />

            </div>
            <h1 className="text-3xl font-bold text-center  mt-4">Apex</h1>
            <p className="text-sm text-gray-500 mt-2 mb-6">Ask your Club Representative for Club ID</p>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={clubId}
                    onChange={(e) => setClubId(e.target.value.toLowerCase())}
                    placeholder="4 character club id"
                    maxLength={4}
                    className="w-full px-4 py-3 border rounded-lg mb-4 text-center text-xl font-mono"
                    disabled={loading}
                />

                {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-sidebar-primary disabled:opacity-50"
                >
                    {loading ? 'Verifying...' : 'Continue'}
                </button>
            </form>

        </div>
        </div>
    )
}