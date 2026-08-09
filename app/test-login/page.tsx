"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";

export default function TestLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  function log(msg: string) {
    setLogs((prev) => [...prev, `[${new Date().toISOString()}] ${msg}`]);
  }

  async function runTest() {
    setLogs([]);
    setRunning(true);

    try {
      // Step 1: Check supabase client
      log("Step 1: Verificando cliente Supabase...");
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      log(`  URL: ${url ? url.substring(0, 30) + "..." : "FALTA"}`);
      log(`  KEY: ${key ? key.substring(0, 20) + "..." : "FALTA"}`);

      if (!url || !key) {
        log("ERROR: Faltan variables de entorno");
        return;
      }

      // Step 2: Test signIn
      log("Step 2: Intentando signIn...");
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        log(`  ERROR signIn: ${signInError.message} (code: ${signInError.status})`);
        log(`  signInData: ${JSON.stringify(signInData)}`);
        return;
      }

      log(`  signIn OK - user.id: ${signInData.user?.id}`);
      log(`  session: ${signInData.session ? "present" : "null"}`);

      if (!signInData.user) {
        log("ERROR: No hay user después de signIn");
        return;
      }

      const userId = signInData.user.id;

      // Step 3: Test get_user_role RPC
      log("Step 3: Llamando RPC get_user_role...");
      const { data: rpcData, error: rpcError } = await supabase
        .rpc("get_user_role", { user_uuid: userId });

      if (rpcError) {
        log(`  RPC ERROR: ${rpcError.message} (code: ${rpcError.code})`);
        log(`  rpcError details: ${JSON.stringify(rpcError)}`);
      } else {
        log(`  RPC OK - role: ${rpcData}`);
      }

      // Step 4: Test direct query (fallback)
      log("Step 4: Query directa a user_roles...");
      const { data: directData, error: directError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (directError) {
        log(`  Direct query ERROR: ${directError.message} (code: ${directError.code})`);
      } else {
        log(`  Direct query OK - role: ${directData?.role}`);
      }

      // Step 5: Determine role
      const role = (rpcData as string) ?? directData?.role ?? "usuario";
      log(`Step 5: Role final: ${role}`);

      if (role === "admin") {
        log("  → Debería ir a /admin");
      } else if (role === "negocio") {
        log("  → Debería ir a /negocio");
      } else {
        log("  → Debería ir a /");
      }

      // Step 6: Sign out (cleanup)
      log("Step 6: Cerrando sesión de prueba...");
      await supabase.auth.signOut();
      log("  Sign out OK");

      log("\n✅ Test completado. Revisa los resultados arriba.");
    } catch (err) {
      log(`EXCEPTION: ${err instanceof Error ? err.message : String(err)}`);
      if (err instanceof Error && err.stack) {
        log(`Stack: ${err.stack}`);
      }
    } finally {
      setRunning(false);
    }
  }

  async function testRpcOnly() {
    setLogs([]);
    setRunning(true);
    try {
      log("Test RPC: Verificando si get_user_role existe...");
      const { data, error } = await supabase.rpc("get_user_role", {
        user_uuid: "00000000-0000-0000-0000-000000000000",
      });
      if (error) {
        log(`RPC error: ${error.message}`);
        log(`¿La función existe? Puede que no exista si el error es "function not found"`);
      } else {
        log(`RPC respondió: ${data} (null = función existe pero usuario no tiene rol)`);
        log("La función get_user_role SÍ existe y funciona.");
      }
    } catch (err) {
      log(`Exception: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Diagnóstico de Login</h1>

      <div className="mb-6 space-y-4 rounded-lg border bg-card p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            placeholder="nutriglar@gmail.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            placeholder="••••••••"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={runTest}
            disabled={running || !email || !password}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {running ? "Ejecutando..." : "Probar login completo"}
          </button>
          <button
            onClick={testRpcOnly}
            disabled={running}
            className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Solo test RPC
          </button>
        </div>
      </div>

      <div className="rounded-lg border bg-black p-4 font-mono text-xs text-green-400">
        {logs.length === 0 ? (
          <div className="text-gray-500">Los resultados aparecerán aquí...</div>
        ) : (
          logs.map((line, i) => (
            <div key={i} className={line.includes("ERROR") ? "text-red-400" : line.includes("✅") ? "text-green-400" : "text-gray-300"}>
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
