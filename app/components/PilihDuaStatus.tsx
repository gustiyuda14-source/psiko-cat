/** Penghitung soal pilih-dua (Kecerdasan): dinilai benar hanya bila kedua kunci dipilih. */
export default function PilihDuaStatus({ count }: { count: number }) {
  const done = count >= 2;
  return (
    <p aria-live="polite" className={`text-sm font-semibold ${done ? "text-success" : "text-accent-ink"}`}>
      {done
        ? "2 dari 2 jawaban dipilih."
        : `${count} dari 2 dipilih — pilih ${2 - count} lagi. Soal ini benar hanya jika kedua jawaban tepat.`}
    </p>
  );
}
