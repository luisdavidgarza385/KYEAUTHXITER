"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Code, Bot } from "lucide-react";

interface App {
  id: string;
  name: string;
}

export default function AdminAPIPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [selectedApp, setSelectedApp] = useState<string>("");
  const [adminKey, setAdminKey] = useState<string>("");
  const [copied, setCopied] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("examples");
  const [activeCodeTab, setActiveCodeTab] = useState<string>("csharp");
  const [testType, setTestType] = useState<string>("init");
  const [testHwid, setTestHwid] = useState<string>("TEST-HWID-001");
  const [testResponse, setTestResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchApps();
    fetchAdminKey();
  }, []);

  const fetchApps = async () => {
    try {
      const res = await fetch("/api/admin/apps");
      if (res.ok) {
        const data = await res.json();
        setApps(data);
        if (data.length > 0) {
          setSelectedApp(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching apps:", error);
    }
  };

  const fetchAdminKey = async () => {
    const key = generateAdminKey();
    setAdminKey(key);
  };

  const generateAdminKey = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let key = "";
    for (let i = 0; i < 32; i++) {
      key += chars[Math.floor(Math.random() * chars.length)];
    }
    return key;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const testEndpoint = async () => {
    if (!selectedApp) {
      alert("Selecciona una aplicación");
      return;
    }

    setIsLoading(true);
    setTestResponse("");

    try {
      const params = new URLSearchParams({
        type: testType,
        sessionid: adminKey,
        name: selectedApp,
        hwid: testHwid,
      });

      if (testType === "init") {
        params.append("ver", "1.0");
      }

      const url = `${window.location.origin}/api/1.0/?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      setTestResponse(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setTestResponse(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const apiUrl = typeof window !== "undefined" ? window.location.origin : "https://www.keyauthpro.xyz";
  const exampleUrl = `${apiUrl}/api/1.0/?type=init&sessionid=${adminKey}&name=${selectedApp || "APP_NAME"}&ver=1.0&hwid=HWID`;

  const codeExamples: Record<string, string> = {
    csharp: `using System;
using System.Net.Http;

class Program
{
    static async Task Main()
    {
        string appName = "${selectedApp}";
        string apiSecret = "${adminKey}";
        string apiUrl = "${apiUrl}/api/1.0/";
        
        var client = new HttpClient();
        var response = await client.GetAsync(
            $"{apiUrl}?type=init&sessionid={apiSecret}&name={appName}&ver=1.0&hwid=HWID"
        );
        
        string result = await response.Content.ReadAsStringAsync();
        Console.WriteLine(result);
    }
}`,
    python: `import requests

app_name = "${selectedApp}"
api_secret = "${adminKey}"
api_url = "${apiUrl}/api/1.0/"

params = {
    "type": "init",
    "sessionid": api_secret,
    "name": app_name,
    "ver": "1.0",
    "hwid": "HWID"
}

response = requests.get(api_url, params=params)
print(response.json())`,
    js: `const axios = require('axios');

const appName = "${selectedApp}";
const apiSecret = "${adminKey}";
const apiUrl = "${apiUrl}/api/1.0/";

const params = {
    type: 'init',
    sessionid: apiSecret,
    name: appName,
    ver: '1.0',
    hwid: 'HWID'
};

axios.get(apiUrl, { params })
    .then(response => console.log(response.data))
    .catch(error => console.error(error));`,
    cpp: `#include <iostream>
#include <curl/curl.h>

int main() {
    std::string appName = "${selectedApp}";
    std::string apiSecret = "${adminKey}";
    std::string apiUrl = "${apiUrl}/api/1.0/";
    
    std::string url = apiUrl + "?type=init&sessionid=" + apiSecret + 
                      "&name=" + appName + "&ver=1.0&hwid=HWID";
    
    CURL* curl = curl_easy_init();
    if(curl) {
        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
        curl_easy_perform(curl);
        curl_easy_cleanup(curl);
    }
    return 0;
}`,
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Integración de API</h1>
        <p className="text-gray-400 mt-2">
          Conecta tu client/loader a nuestra API KeyAuth 1.0 compatible
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("examples")}
            className={`px-4 py-2 flex items-center gap-2 border-b-2 transition ${
              activeTab === "examples"
                ? "border-emerald-500 text-white"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Code className="w-4 h-4" />
            Ejemplos de Código
          </button>
          <button
            onClick={() => setActiveTab("tester")}
            className={`px-4 py-2 flex items-center gap-2 border-b-2 transition ${
              activeTab === "tester"
                ? "border-emerald-500 text-white"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Bot className="w-4 h-4" />
            Probador de Endpoints
          </button>
        </div>
      </div>

      {activeTab === "examples" && (
        <div className="space-y-6">
          {/* Credenciales */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">🔑 Credenciales de API</h2>
            <p className="text-gray-400 text-sm mb-4">
              Usa estas credenciales para conectar tu aplicación
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">APP NAME / ID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedApp}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                  <button
                    onClick={() => copyToClipboard(selectedApp, "App ID")}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded text-white transition"
                  >
                    {copied === "App ID" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">API SECRET</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={adminKey}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                  <button
                    onClick={() => copyToClipboard(adminKey, "API Secret")}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded text-white transition"
                  >
                    {copied === "API Secret" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Seleccionar Aplicación</label>
              <select
                value={selectedApp}
                onChange={(e) => setSelectedApp(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ejemplo de URL */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">📝 Ejemplo de URL</h2>
            <p className="text-gray-400 text-sm mb-4">URL Completa para inicializar sesión</p>

            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-gray-300">URL Completa:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={exampleUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-xs"
                />
                <button
                  onClick={() => copyToClipboard(exampleUrl, "URL")}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded text-white transition"
                >
                  {copied === "URL" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="bg-gray-900/50 p-4 rounded-lg space-y-1 text-sm font-mono text-gray-300">
              <div><span className="text-emerald-400">type</span> - init, login, register, license, var, log, logout</div>
              <div><span className="text-emerald-400">sessionid</span> - Tu API Secret</div>
              <div><span className="text-emerald-400">name</span> - ID de tu aplicación</div>
              <div><span className="text-emerald-400">ver</span> - Versión de la app (ej: 1.0)</div>
              <div><span className="text-emerald-400">hwid</span> - Hardware ID del usuario</div>
            </div>
          </div>

          {/* Ejemplos de Código */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">💻 Ejemplos de Código</h2>

            <div className="border-b border-gray-700 mb-4">
              <div className="flex gap-2">
                {["csharp", "cpp", "python", "js"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveCodeTab(lang)}
                    className={`px-4 py-2 border-b-2 transition ${
                      activeCodeTab === lang
                        ? "border-emerald-500 text-white"
                        : "border-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    {lang === "csharp" ? "C#" : lang === "cpp" ? "C++" : lang === "python" ? "Python" : "JavaScript"}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <pre className="bg-gray-900/50 p-4 rounded-lg overflow-x-auto text-xs text-gray-300">
                {codeExamples[activeCodeTab]}
              </pre>
              <button
                onClick={() => copyToClipboard(codeExamples[activeCodeTab], `Código ${activeCodeTab}`)}
                className="absolute top-2 right-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white transition"
              >
                {copied === `Código ${activeCodeTab}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "tester" && (
        <div className="space-y-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">🧪 Probador de Endpoints</h2>
            <p className="text-gray-400 text-sm mb-4">
              Prueba los endpoints de la API directamente desde aquí
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Acción (TYPE)</label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="init">init (Iniciar Sesión)</option>
                  <option value="login">login (Login)</option>
                  <option value="register">register (Registro)</option>
                  <option value="license">license (Validar License)</option>
                  <option value="var">var (Variables)</option>
                  <option value="log">log (Logs)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">HWID</label>
                <input
                  type="text"
                  value={testHwid}
                  onChange={(e) => setTestHwid(e.target.value)}
                  placeholder="TEST-HWID-001"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>
            </div>

            <button
              onClick={testEndpoint}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded transition"
            >
              {isLoading ? "Enviando..." : "✉️ ENVIAR SOLICITUD"}
            </button>

            {testResponse && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-300">Respuesta:</label>
                  <button
                    onClick={() => copyToClipboard(testResponse, "Respuesta")}
                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white transition text-sm"
                  >
                    {copied === "Respuesta" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <pre className="bg-gray-900/50 p-4 rounded-lg overflow-x-auto text-xs text-gray-300 max-h-96">
                  {testResponse}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
