// Run: node --import tsx scripts/check-sidebar-navigation.ts
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Sidebar from "../app/dashboard/Sidebar";

// tsx's standalone JSX transform needs React; Next normally supplies its JSX runtime.
Object.assign(globalThis, { React });
const router = {} as NonNullable<React.ContextType<typeof AppRouterContext>>;
for (const path of ["/dashboard", "/dashboard/latihan", "/dashboard/latihan/kecermatan"]) {
  const html = renderToStaticMarkup(
    React.createElement(AppRouterContext.Provider, { value: router },
      React.createElement(PathnameContext.Provider, { value: path },
        React.createElement(Sidebar, { name: "QA", username: "qa" }))),
  );
  assert.match(html, /<a[^>]+href="\/dashboard\/latihan"[^>]*>[\s\S]*?Latihan<\/a>/);
  assert.match(html, /<button[^>]+aria-label="(?:Buka|Tutup) pilihan latihan"/);
  if (path.includes("latihan")) assert.match(html, /id="desktop-latihan-submenu"/);
  console.log("Sidebar navigation passed:", path);
}
