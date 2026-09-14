"use client";

import { useEffect } from "react";

/*
  Keyboard untuk engine ujian.

  Sebelum ini menjawab 100 soal pilihan ganda hanya bisa lewat mouse. Di sistem
  CAT sungguhan huruf pilihan dan panah navigasi selalu terikat ke keyboard —
  peserta yang mengetik jauh lebih cepat daripada yang harus membidik target
  44px sebanyak 700 kali.

  Binding:
    A-E (dan 1-5)   pilih jawaban
    ArrowLeft/Right pindah soal
*/

type Args = {
  /** dimatikan saat dialog terbuka supaya tombol tidak tembus ke balik modal */
  enabled: boolean;
  choiceKeys: string[];
  onChoose: (key: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
};

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

export function useExamKeyboard({ enabled, choiceKeys, onChoose, onPrev, onNext }: Args) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      // Biarkan shortcut browser (Cmd+R, Ctrl+F, dst) lewat tanpa diganggu.
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      if (isTypingTarget(e.target)) return;

      if (e.key === "ArrowLeft" && onPrev) {
        e.preventDefault();
        onPrev();
        return;
      }
      if (e.key === "ArrowRight" && onNext) {
        e.preventDefault();
        onNext();
        return;
      }

      const pressed = e.key.toUpperCase();
      // Huruf langsung, atau angka 1-5 yang dipetakan ke urutan pilihan.
      const byLetter = choiceKeys.find((k) => k.toUpperCase() === pressed);
      const digit = Number(e.key);
      const byDigit =
        Number.isInteger(digit) && digit >= 1 && digit <= choiceKeys.length
          ? choiceKeys[digit - 1]
          : undefined;
      const key = byLetter ?? byDigit;

      if (key) {
        e.preventDefault();
        onChoose(key);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, choiceKeys, onChoose, onPrev, onNext]);
}
