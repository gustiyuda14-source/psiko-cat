"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/app/components/ui-client";
import { Badge } from "@/app/components/ui";

// Kelola akun peserta — alur dan aturan sama dengan admin.html di dajiks-cest.
type Account = { id: string; nama: string; aktif: boolean; admin: boolean; created_at: string | null };
type Credential = { id: string; nama: string; password: string };
type ApiError = Error & { status?: number; data?: { duplicates?: { nama: string; id: string }[] } };

const CHUNK = 25;
const parseNames = (txt: string) =>
  [...new Set(txt.split(/\r?\n/).map((l) => l.trim().replace(/^"(.*)"$/, "$1").replace(/\s+/g, " ").toLocaleUpperCase("id")).filter(Boolean))].filter(
    (n, i) => !(i === 0 && n === "NAMA")
  );
const csvCell = (v: string) => (/[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);

async function api<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/admin/accounts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error ?? `Gagal (${res.status})`), { status: res.status, data }) as ApiError;
  return data as T;
}

export default function AccountsManager() {
  const [names, setNames] = useState("");
  const [newErr, setNewErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Credential[]>([]);
  const [copyMsg, setCopyMsg] = useState("");
  const [users, setUsers] = useState<Account[]>([]);
  const [me, setMe] = useState("");
  const [q, setQ] = useState("");
  const [listErr, setListErr] = useState("");
  const resRef = useRef<HTMLElement>(null);
  const count = useMemo(() => parseNames(names).length, [names]);

  const loadList = useCallback(async () => {
    setListErr("");
    try {
      const d = await api<{ users: Account[]; me: string }>({ action: "list" });
      setUsers(d.users);
      setMe(d.me);
    } catch (e) {
      setListErr((e as Error).message);
    }
  }, []);

  useEffect(() => {
    // Muat daftar sekali saat halaman dibuka (sinkronisasi dengan server, seperti loadList() di CEST).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadList();
  }, [loadList]);

  // Password hanya tampil sekali: cegah tab tertutup tanpa sengaja.
  useEffect(() => {
    if (!created.length) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [created.length]);

  function showResult(rows: Credential[]) {
    setCreated(rows);
    setCopyMsg("");
    requestAnimationFrame(() => resRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  async function generate() {
    const list = parseNames(names);
    setNewErr("");
    if (!list.length) return setNewErr("Isi minimal satu nama.");
    setBusy(true);
    const done: Credential[] = [];
    try {
      let allowDuplicates = false;
      for (let i = 0; i < list.length; i += CHUNK) {
        const part = list.slice(i, i + CHUNK);
        try {
          const r = await api<{ created: Credential[] }>({ action: "create", names: part, allowDuplicates });
          done.push(...r.created);
          allowDuplicates = false;
        } catch (err) {
          const e = err as ApiError;
          if (e.status !== 409 || !e.data?.duplicates) throw e;
          const dup = e.data.duplicates.map((d) => `${d.nama} (${d.id})`).join(", ");
          if (!confirm(`Nama ini sudah punya akun: ${dup}.\n\nTetap buat akun baru untuk nama yang sama?`))
            throw new Error("Dibatalkan. Hapus nama yang sudah punya akun dari daftar, lalu ulangi.");
          allowDuplicates = true;
          i -= CHUNK; // ulangi potongan yang sama
        }
      }
      setNames("");
    } catch (e) {
      setNewErr((done.length ? `Sebagian sudah dibuat (${done.length} akun, lihat tabel di bawah). ` : "") + (e as Error).message);
    } finally {
      setBusy(false);
    }
    if (done.length) {
      showResult(done);
      await loadList();
    }
  }

  const loginUrl = typeof window === "undefined" ? "" : window.location.origin + "/login?ref=akun"; // query baru: WA sudah cache /login tanpa preview
  const card = (u: Credential) => `D'Ajiks Akademi — Psiko CAT\nNama: ${u.nama}\nUsername: ${u.id}\nPassword: ${u.password}\nMasuk: ${loginUrl}\n(Tolong ID dan password-nya di-save ya, agar tidak terhapus pesan sementara atau hilang)`;

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(created.map(card).join("\n\n"));
      setCopyMsg("Tersalin.");
    } catch {
      setCopyMsg("Gagal menyalin otomatis. Pilih teks di tabel dan salin manual.");
    }
  }
  function downloadCsv() {
    const csv = "username,nama,password\n" + created.map((u) => [u.id, u.nama, u.password].map(csvCell).join(",")).join("\n") + "\n";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `akun-peserta-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(a);
    a.click();
    a.remove();
  }
  function closeResult() {
    if (!confirm("Tutup daftar password? Setelah ini password tidak bisa ditampilkan lagi.")) return;
    setCreated([]);
  }

  async function resetPw(u: Account) {
    if (!confirm(`Reset password ${u.nama} (${u.id})?\nPassword lama langsung tidak berlaku dan sesi login peserta ini berakhir.`)) return;
    try {
      showResult([await api<Credential>({ action: "reset", id: u.id })]);
    } catch (e) {
      setListErr((e as Error).message);
    }
  }
  async function toggle(u: Account) {
    if (u.aktif && !confirm(`Nonaktifkan ${u.nama} (${u.id})? Peserta tidak bisa login sampai diaktifkan lagi.`)) return;
    try {
      await api({ action: "update", id: u.id, aktif: !u.aktif });
      await loadList();
    } catch (e) {
      setListErr((e as Error).message);
    }
  }
  async function rename(u: Account) {
    const nama = prompt(`Nama baru untuk ${u.id}:`, u.nama);
    if (nama == null || !nama.trim() || nama.trim().toUpperCase() === u.nama) return;
    try {
      await api({ action: "update", id: u.id, nama });
      await loadList();
    } catch (e) {
      setListErr((e as Error).message);
    }
  }

  const needle = q.trim().toLowerCase();
  const rows = users.filter((u) => !needle || u.id.includes(needle) || u.nama.toLowerCase().includes(needle)).slice().reverse();
  const meName = users.find((u) => u.id === me)?.nama ?? me;

  return (
    <div className="mt-6 space-y-6">
      {me && <p className="text-sm text-muted-foreground">Masuk sebagai {meName}</p>}

      <section className="surface-card space-y-3 p-5 sm:p-6" aria-labelledby="h-new">
        <h2 id="h-new" className="font-heading text-xl text-foreground">Buat akun baru</h2>
        <p className="text-sm text-muted-foreground">
          Tulis satu nama per baris (boleh tempel dari Excel/CSV). Username dibuat otomatis (p001, p002, …) dan password berupa nama depan + @ atau * + 4 angka (contoh: budi@4821). Akun langsung bisa dipakai login, tanpa deploy.
        </p>
        <label htmlFor="names" className="block text-sm font-semibold text-foreground">Nama peserta</label>
        <textarea
          id="names"
          spellCheck={false}
          value={names}
          onChange={(e) => setNames(e.target.value)}
          placeholder={"BUDI SANTOSO\nSITI AMINAH"}
          className="block min-h-40 w-full resize-y rounded-md border border-border bg-[var(--surface-card)] p-4 text-sm leading-relaxed text-foreground"
        />
        <p className="tnum text-sm text-muted-foreground" aria-live="polite">{count} nama</p>
        {newErr && <p role="alert" className="text-sm text-destructive">{newErr}</p>}
        <Button variant="primary" onClick={() => void generate()} disabled={busy}>{busy ? "Membuat…" : "Generate akun"}</Button>
      </section>

      {created.length > 0 && (
        <section ref={resRef} className="surface-card space-y-3 p-5 sm:p-6" aria-labelledby="h-res">
          <h2 id="h-res" className="font-heading text-xl text-foreground">Akun baru</h2>
          <p className="rounded-md border border-[var(--warning,#b7791f)]/40 bg-[var(--surface-inset)] p-3 text-sm text-foreground">
            <b>Simpan sekarang.</b> Password hanya tampil di layar ini. Setelah ditutup, password tidak bisa dilihat lagi (hanya bisa direset).
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead><tr className="text-left text-muted-foreground"><th className="py-2 pr-4">Username</th><th className="py-2 pr-4">Nama</th><th className="py-2">Password</th></tr></thead>
              <tbody>
                {created.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="py-2 pr-4 font-mono">{u.id}</td><td className="py-2 pr-4">{u.nama}</td><td className="py-2 font-mono">{u.password}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => void copyAll()}>Salin semua (siap kirim WA)</Button>
            <Button variant="secondary" onClick={downloadCsv}>Unduh CSV</Button>
            <Button variant="ghost" onClick={closeResult}>Selesai, tutup</Button>
          </div>
          <p className="text-sm text-muted-foreground" aria-live="polite">{copyMsg}</p>
        </section>
      )}

      <section className="surface-card space-y-3 p-5 sm:p-6" aria-labelledby="h-list">
        <h2 id="h-list" className="font-heading text-xl text-foreground">Daftar akun</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama atau username…"
            aria-label="Cari akun"
            autoComplete="off"
            className="min-h-10 w-full max-w-xs rounded-md border border-border bg-[var(--surface-card)] px-3 text-sm text-foreground"
          />
          <span className="tnum text-sm text-muted-foreground" aria-live="polite">
            {rows.length} dari {users.length} akun · {users.filter((u) => u.aktif).length} aktif
          </span>
        </div>
        {listErr && <p role="alert" className="text-sm text-destructive">{listErr}</p>}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead><tr className="text-left text-muted-foreground"><th className="py-2 pr-4">Username</th><th className="py-2 pr-4">Nama</th><th className="py-2 pr-4">Status</th><th className="py-2">Aksi</th></tr></thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className={`border-t border-border ${u.aktif ? "" : "opacity-60"}`}>
                  <td className="py-2 pr-4 font-mono">{u.id}</td>
                  <td className="py-2 pr-4">{u.nama} {u.admin && <Badge tone="success" className="ml-2">admin</Badge>}</td>
                  <td className="py-2 pr-4">{u.aktif ? "Aktif" : "Nonaktif"}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1.5">
                      <Button variant="ghost" size="sm" onClick={() => void resetPw(u)}>Reset password</Button>
                      {u.id !== me && (
                        <Button variant={u.aktif ? "danger" : "secondary"} size="sm" onClick={() => void toggle(u)}>{u.aktif ? "Nonaktifkan" : "Aktifkan"}</Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => void rename(u)}>Ganti nama</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
