"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Trophy } from "lucide-react";
import Image from "next/image";
import SwordBattle from "./swordfight";

export default function LeaderBoard() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data: clubs } = await supabase.from("clubs").select("id, club_name");
      const { data: events } = await supabase.from("events").select("id, club_id");
      const { data: participation } = await supabase.from("participation").select("event_id");

      if (!clubs || !events || !participation) return;

      // Map event_id → club_id
      const eventToClub = {};
      events.forEach((e) => (eventToClub[e.id] = e.club_id));

      // Count participations per club
      const clubCounts = {};
      participation.forEach((p) => {
        const clubId = eventToClub[p.event_id];
        if (clubId) clubCounts[clubId] = (clubCounts[clubId] || 0) + 1;
      });

      // Build and sort leaderboard (descending by count)
      const clubStats = clubs
        .map((club) => ({
          id: club.id,
          name: club.club_name,
          count: clubCounts[club.id] || 0,
        }))
        .sort((a, b) => b.count - a.count);

      setLeaderboard(clubStats);
    }

    fetchData();
  }, []);

  // Only show clubs that have images (exclude the 2 clubs without images)
  const clubsWithImages = [
    '0bb588fc-b01c-4c61-9b4b-050ad444833c',
    '2ce3dc24-6715-4814-ab7c-3cf5d496745f',
    '3d3e04cb-3e04-449a-8f33-a7a9e422449e',
    '61b7b9c3-1a18-4a42-8b9e-0efd086f8384',
    '8e4c2715-7d53-4ce3-859a-f593808dbfa8',
    '8f2cddbb-5c43-4d87-86af-7148ea96b62e',
    '8fdcba1d-1b9b-4b61-afc9-5b9e70139dc6',
    '93d72cbf-9777-4498-804c-1d21cd392615',
    'd51688de-892f-48a0-9498-141e7adb52dd',
    'ee173dbb-1f64-49ca-9afd-7034a0b0fd7a',
    'f6a165b5-be8e-4bbc-9057-67354c62941b'
  ];
  
  const validClubs = leaderboard.filter((club) => clubsWithImages.includes(club.id));
  
  const topTwo = validClubs.slice(0, 2);
  const others = validClubs.slice(2);

  return (
    <div className="p-4">
      {/* Top 2 Clubs with Sword Battle */}
      {topTwo.length >= 2 && (
        <div className="flex items-center justify-center gap-6 mb-4">
          <div
            key={topTwo[0].id}
            className="relative flex flex-col items-center justify-center rounded-full w-16 h-16 bg-gray-100 shadow-md border-2 border-amber-400"
          >
            <Image
              src={`/club_images/${topTwo[0].id}.jpg`}
              alt={topTwo[0].name}
              width={64}
              height={64}
              className="rounded-full object-cover"
              unoptimized
            />
            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {topTwo[0].count}
            </span>
          </div>

          <div className="absolute z-1">

          <SwordBattle />
          </div>

          <div
            key={topTwo[1].id}
            className="relative flex flex-col items-center justify-center rounded-full w-16 h-16 bg-gray-100 shadow-md border-2 border-amber-400"
          >
            <Image
              src={`/club_images/${topTwo[1].id}.jpg`}
              alt={topTwo[1].name}
              width={64}
              height={64}
              className="rounded-full object-cover"
              unoptimized
            />
            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {topTwo[1].count}
            </span>
          </div>
        </div>
      )}

      {/* Other Clubs */}
      <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {others.map((club) => (
          <div
            key={club.id}
            className="relative flex items-center justify-center rounded-full w-10 h-10 bg-gray-50 border border-gray-200 shadow-sm"
          >
            <Image
              src={`/club_images/${club.id}.jpg`}
              alt={club.name}
              width={56}
              height={56}
              className="rounded-full object-cover"
              unoptimized
            />
            <span className="absolute -top-1 -right-1 text-xs bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded-full">
              {club.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}