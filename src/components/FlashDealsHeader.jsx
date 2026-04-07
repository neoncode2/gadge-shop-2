"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Clock3 } from "lucide-react";

const INITIAL_COUNTDOWN = {
  hours: 18,
  minutes: 0,
  seconds: 0,
};

function decrementCountdown(current) {
  const totalSeconds = (current.hours * 60 * 60) + (current.minutes * 60) + current.seconds;

  if (totalSeconds <= 0) {
    return INITIAL_COUNTDOWN;
  }

  const nextTotal = totalSeconds - 1;

  return {
    hours: Math.floor(nextTotal / 3600),
    minutes: Math.floor((nextTotal % 3600) / 60),
    seconds: nextTotal % 60,
  };
}

function formatUnit(value) {
  return String(value).padStart(2, "0");
}

export default function FlashDealsHeader() {
  const [countdown, setCountdown] = useState(INITIAL_COUNTDOWN);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCountdown((current) => decrementCountdown(current));
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  const countdownSlots = [
    { value: formatUnit(countdown.hours), unit: "Hours" },
    { value: formatUnit(countdown.minutes), unit: "Mins" },
    { value: formatUnit(countdown.seconds), unit: "Sec" },
  ];

  return (
    <div className="overflow-hidden rounded-[17px] border border-rose-100 bg-[linear-gradient(135deg,#fff8f4_0%,#fff4ec_48%,#ffffff_100%)] p-2.5 shadow-[0_10px_22px_rgba(15,23,42,0.04)] md:p-3.5">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="inline-flex items-center rounded-full border border-white/80 bg-white/90 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-rose-600 shadow-sm">
            Limited Time Deals
          </span>
          <h2 className="mt-1 text-[18px] font-semibold tracking-tight text-slate-950 md:text-[21px]">
            Flash Deals
          </h2>
          <p className="mt-0.5 max-w-[470px] text-[11px] leading-[1.45] text-slate-600 md:text-[12px]">
            Fast-moving gadget offers with sharp pricing before the timer runs out.
          </p>
        </div>

        <div className="flex flex-col gap-1.5 lg:items-end">
          <div className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            <Clock3 size={11} />
            Ends In
          </div>

          <div className="flex items-center gap-1">
            {countdownSlots.map((slot) => (
              <div
                key={slot.unit}
                className="min-w-[56px] rounded-[12px] border border-white bg-white px-2 py-1 text-center shadow-[0_6px_14px_rgba(15,23,42,0.05)]"
              >
                <div className="text-[16px] font-semibold leading-none tracking-tight text-slate-950 md:text-[18px]">
                  {slot.value}
                </div>
                <div className="mt-0.5 text-[7px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  {slot.unit}
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1.5 text-[11px] font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
          >
            View all deals <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
