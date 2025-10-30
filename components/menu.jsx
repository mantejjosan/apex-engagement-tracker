'use client'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SquareMenu } from "lucide-react";
import { Birdhouse, QrCode, UserStar } from "lucide-react";
import { ChartNoAxesColumn } from "lucide-react";
import PoweredBy from "./poweredby";
const options = [
    {
        icon: <Birdhouse />,
        name: 'Home',
        description: 'Your participation history',
        url: '/',
    },
    {
        icon: <QrCode />,
        name: 'Scan QR',
        description: 'Scan a Event',
        url: '/scan',
    },
    {
        icon: <ChartNoAxesColumn />,
        name: 'Leaderboard',
        description: `Who's winning?`,
        url: '/leaderboard'
    },
    {
        icon: <UserStar />,
        name: 'Creators',
        description: '@mantejjosan',
        url: 'https://github.com/mantejjosan',
    },

]

export default function Menu() {
    const [menuOpen, setMenuOpen] = useState(false)
    const router = useRouter();
    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.push('/login')
            router.refresh()
        } catch (err) {
            console.error('Logout error:', err)
        }
    }

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    }

    return (
        <>
            <div className="relative">
                <button
                    onClick={toggleMenu}
                    className="bg-primary p-2 border-2 border-amber-800 rounded-lg">
                    <SquareMenu />
                </button>
            </div>
            {menuOpen &&
                <div className="flex flex-col fixed inset-0 w-[80vw] md:w-96 max-h-[70vh] top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 noisy-texture bg-gray-100/90 flex items-center justify-between py-10 z-50 rounded-lg fadeIn 0.3s ease-out forwards">
                    <div className="flex flex-col text-2xl ">

                        {
                            options.map((option, index) => {
                                return (
                                <div className="flex flex-col border-b-1 rounded-lg py-2 px-1 border-amber-700">
                                    <div className="flex items-center gap-2 ">
                                        {option.icon}
                                        <Link
                                            key={index}
                                            href={option.url}
                                            alt={option.url}
                                        >{option.name}</Link>
                                    </div>
                                    <div className="text-sm text-muted-foreground/70 -my-2">
                                        { option.description }
                                    </div>
                                </div>
                            )
                            })
                        }
                    </div>

                    <button
                        onClick={handleLogout}
                        className="bg-secondary mt-5 px-8 py-2 rounded-lg text-white/80"
                    >Logout</button>
                    <PoweredBy />
                </div>}
        </>
    )
}