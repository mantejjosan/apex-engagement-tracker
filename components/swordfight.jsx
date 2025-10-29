"use client";
import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function SwordBattle() {
  return (
    <div className="flex flex-col items-center justify-center">
      <DotLottieReact
        src="/animations/sword-battle.lottie"
        loop
        autoplay
        style={{ width: 100, height: 100 }}
      />
    </div>
  );
}
