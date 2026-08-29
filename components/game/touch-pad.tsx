"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

type TouchPadProps = {
  onMove: (move: { x: number; y: number }) => void;
};

function PadButton({
  label,
  onHold,
}: {
  label: string;
  onHold: (active: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-md border border-amber-200/20 bg-stone-950/70 text-lg text-amber-100 active:bg-amber-300/20",
      )}
      style={{ touchAction: "none" }}
      onPointerDown={(event) => {
        event.preventDefault();
        onHold(true);
      }}
      onPointerUp={() => onHold(false)}
      onPointerLeave={() => onHold(false)}
      onPointerCancel={() => onHold(false)}
    >
      {label}
    </button>
  );
}

export function TouchPad({ onMove }: TouchPadProps) {
  const axes = useRef({ x: 0, y: 0 });

  const emit = () => onMove({ ...axes.current });

  return (
    <div className="pointer-events-auto absolute bottom-3 left-3 grid grid-cols-3 gap-1 md:hidden">
      <span />
      <PadButton
        label="▲"
        onHold={(active) => {
          axes.current.y = active ? -1 : 0;
          emit();
        }}
      />
      <span />
      <PadButton
        label="◀"
        onHold={(active) => {
          axes.current.x = active ? -1 : 0;
          emit();
        }}
      />
      <span />
      <PadButton
        label="▶"
        onHold={(active) => {
          axes.current.x = active ? 1 : 0;
          emit();
        }}
      />
      <span />
      <PadButton
        label="▼"
        onHold={(active) => {
          axes.current.y = active ? 1 : 0;
          emit();
        }}
      />
    </div>
  );
}
