"use client";
import { useState, useEffect } from "react";
import { Code, Terminal, Play, Send, Loader2, Info, CheckCircle2, Copy } from "lucide-react";

export default function ApiPage() {
  const [activeTab, setActiveTab] = useState<"cpp" | "python" | "csharp">("cpp");
  const [appId, setAppId] = useState("GUATEXITER");
  const [appSecret, setAppSecret] = useState("naUbJr6FWdx5nII2JQU6GVOFuqYqHzOVdPrvoVVPFtV2KAfJ");
  const [action, setAction] = useState<"init" | "login" | "register" | "license">("init");
  
  // Input fields for tester
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [hwid, setHwid] = useState("WEB-TESTER-0001");

  const [loading, setLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    // Generate a random HWID on client mount
    setHwid("WEB-" + Math.random().toString(36).slice(2, 10).toUpperCase());
  }, []);

  async function handleTestRequest() {
    setLoading(true);
    setRawResponse(null);

    const body: Record<string, any> = {
      type: action,
      appid: appId,
      secret: appSecret,
      hwid: hwid,
    };

    if (action === "init") {
      body.name = appId;
    } else {
      body.sessionid = sessionId;
    }

    if (action === "login" || action === "register") {
      body.username = username;
      body.pass = password;
    }

    if (action === "register" || action === "license") {
      body.key = licenseKey;
    }

    try {
      const res = await fetch("/api/1.0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setRawResponse(data);
      
      // Auto-populate session ID if init is successful
      if (action === "init" && data.success && data.sessionid) {
        setSessionId(data.sessionid);
      }
    } catch (err: any) {
      setRawResponse({ success: false, error: err.message || "Error de red" });
    } finally {
      setLoading(false);
    }
  }

  const cppCode = `#include <iostream>
#include <string>
#include <curl/curl.h>
#include <nlohmann/json.hpp> // Instala json de nlohmann

using json = nlohmann::json;

// Inicializa sesión
std::string initSession(const std::string& app_id, const std::string& secret, const std::string& hwid) {
    CURL* curl = curl_easy_init();
    if(curl) {
        std::string response_string;
        curl_easy_setopt(curl, CURLOPT_URL, "http://localhost:3002/api/1.0");
        curl_easy_setopt(curl, CURLOPT_POST, 1L);
        
        json data;
        data["type"] = "init";
        data["appid"] = app_id;
        data["secret"] = secret;
        data["hwid"] = hwid;
        
        std::string json_str = data.dump();
        
        struct curl_slist* headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_str.c_str());
        
        // Función de escritura curl para guardar la respuesta...
        // ...
        CURLcode res = curl_easy_perform(curl);
        curl_easy_cleanup(curl);
        return response_string; // Devuelve JSON crudo
    }
    return "";
}`;

  const pythonCode = `import requests

API_URL = "http://localhost:3002/api/1.0"
APP_ID = "${appId}"
APP_SECRET = "${appSecret}"
HWID = "MY_HWID_123"

# 1. Inicializar sesión
def init():
    payload = {
        "type": "init",
        "appid": APP_ID,
        "secret": APP_SECRET,
        "hwid": HWID
    }
    response = requests.post(API_URL, json=payload).json()
    if response.get("success"):
        print("Sesión iniciada:", response["sessionid"])
        return response["sessionid"]
    else:
        print("Error de inicio:", response.get("message"))
        return None

# 2. Login de usuario
def login(session_id, username, password):
    payload = {
        "type": "login",
        "appid": APP_ID,
        "sessionid": session_id,
        "username": username,
        "pass": password,
        "hwid": HWID
    }
    response = requests.post(API_URL, json=payload).json()
    if response.get("success"):
        print("¡Login exitoso! Bienvenido", response["info"]["username"])
    else:
        print("Error al iniciar sesión:", response.get("message"))`;

  const csharpCode = `using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json; // Requiere Newtonsoft.Json NuGet

public class KeyAuthTester {
    private static readonly HttpClient client = new HttpClient();
    private const string ApiUrl = "http://localhost:3002/api/1.0";

    public static async Task<string> InitSession(string appId, string secret, string hwid) {
        var payload = new {
            type = "init",
            appid = appId,
            secret = secret,
            hwid = hwid
        };

        var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");
        var response = await client.PostAsync(ApiUrl, content);
        var json = await response.Content.ReadAsStringAsync();
        return json;
    }
}`;

  const activeCode = activeTab === "cpp" ? cppCode : activeTab === "python" ? pythonCode : csharpCode;

  function copyCodeToClipboard() {
    navigator.clipboard.writeText(activeCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto text-zinc-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 pb-5">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-zinc-100">
            <Code className="w-5 h-5 text-emerald-400" />
            Integración de API
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Conecta tu cheat/loader a nuestra API KeyAuth 1.0 compatible.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Code Examples */}
        <div className="space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" /> Ejemplos de Código
            </h2>
            <div className="flex gap-1.5 text-[11px] bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
              <button
                onClick={() => setActiveTab("cpp")}
                className={`px-3 py-1 rounded font-bold uppercase transition ${
                  activeTab === "cpp" ? "bg-emerald-950/20 text-emerald-400 border border-emerald-900/35" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                C++
              </button>
              <button
                onClick={() => setActiveTab("python")}
                className={`px-3 py-1 rounded font-bold uppercase transition ${
                  activeTab === "python" ? "bg-emerald-950/20 text-emerald-400 border border-emerald-900/35" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setActiveTab("csharp")}
                className={`px-3 py-1 rounded font-bold uppercase transition ${
                  activeTab === "csharp" ? "bg-emerald-950/20 text-emerald-400 border border-emerald-900/35" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                C#
              </button>
            </div>
          </div>

          <div className="relative rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden flex-1 flex flex-col min-h-[400px]">
            {/* Window header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-850 bg-zinc-900/20 text-[11px] text-zinc-500 font-mono">
              <span>{activeTab === "cpp" ? "main.cpp" : activeTab === "python" ? "auth.py" : "KeyAuth.cs"}</span>
              <button
                onClick={copyCodeToClipboard}
                className="flex items-center gap-1 hover:text-zinc-300 transition"
              >
                {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Copiado" : "Copiar"}</span>
              </button>
            </div>
            
            <pre className="p-4 overflow-auto font-mono text-[12px] text-zinc-400 leading-relaxed flex-1 select-text bg-black/40">
              <code>{activeCode}</code>
            </pre>
          </div>
        </div>

        {/* Right Side: Interactive API Tester */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
            <Play className="w-4 h-4 text-emerald-400" /> Probador de Endpoints (Tester)
          </h2>
          
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 block">App Name / ID</label>
                <input
                  type="text"
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-700 px-3 py-1.5 rounded-lg text-xs outline-none focus:border-emerald-500/50 transition font-mono"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 block">App Secret</label>
                <input
                  type="password"
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-700 px-3 py-1.5 rounded-lg text-xs outline-none focus:border-emerald-500/50 transition font-mono"
                  value={appSecret}
                  onChange={(e) => setAppSecret(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 block">Acción API (type)</label>
                <select
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-1.5 rounded-lg text-xs outline-none focus:border-emerald-500/50 transition"
                  value={action}
                  onChange={(e) => setAction(e.target.value as any)}
                >
                  <option value="init" className="bg-zinc-950">init (Iniciar Sesión)</option>
                  <option value="login" className="bg-zinc-950">login (Iniciar Usuario)</option>
                  <option value="register" className="bg-zinc-950">register (Registrar Usuario)</option>
                  <option value="license" className="bg-zinc-950">license (Verificar Licencia)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 block">Hardware ID (hwid)</label>
                <input
                  type="text"
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-1.5 rounded-lg text-xs outline-none focus:border-emerald-500/50 transition font-mono"
                  value={hwid}
                  onChange={(e) => setHwid(e.target.value)}
                />
              </div>
            </div>

            {action !== "init" && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 block">ID Sesión (sessionid)</label>
                <input
                  type="text"
                  required
                  placeholder="Inicia con 'init' primero para obtener sessionid"
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-250 placeholder:text-zinc-600 px-3 py-1.5 rounded-lg text-xs outline-none focus:border-emerald-500/50 transition font-mono"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                />
              </div>
            )}

            {(action === "login" || action === "register") && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 block">Usuario</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-1.5 rounded-lg text-xs outline-none focus:border-emerald-500/50 transition"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="carlos1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 block">Contraseña</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-3 py-1.5 rounded-lg text-xs outline-none focus:border-emerald-500/50 transition font-mono"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {(action === "register" || action === "license") && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 block">Clave de Licencia (key)</label>
                <input
                  type="text"
                  required
                  placeholder="Guate Xiter-XXXX-XXXX-XXXX-XXXX"
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-650 px-3 py-1.5 rounded-lg text-xs outline-none focus:border-emerald-500/50 transition font-mono"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                />
              </div>
            )}

            <button
              onClick={handleTestRequest}
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase transition shadow-lg shadow-emerald-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Procesando petición...</>
              ) : (
                <><Send className="w-3.5 h-3.5" /> Enviar Solicitud</>
              )}
            </button>

            {/* Test response panel */}
            {rawResponse && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Respuesta de la API</div>
                <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-[11px] text-zinc-350 max-h-48 overflow-y-auto select-all">
                  {JSON.stringify(rawResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
