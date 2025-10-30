import LeaderBoard from "@/components/clubleaderboard";
import Navbar from "@/components/navbar";
import ToggleLeaderboard from "@/components/toggleleaderboard";

export default function LeaderBoardCombined() {
    return (
        <>
        <Navbar />
        <div className="flex flex-col p-5 items-center justify-center">
        Let the games begin!
        <div className="flex flex-col w-60">
            <LeaderBoard styles=" grid-cols-5 sm:grid-cols-7  gap-3"/>
        </div>
            <div className="mt-5">
                <ToggleLeaderboard />
            </div>
        </div>
        </>
    )
}