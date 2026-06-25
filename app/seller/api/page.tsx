"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Code, Terminal, ExternalLink } from "lucide-react";

interface SellerData {
  id: string;
  username: string;
  seller_key: string;
  credits: number | string;
  unlimited_credits: boolean;
  can_use_api: boolean;
}

export default function SellerAPIPage() {
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadSellerData();
  }, []);

  async function loadSellerData() {
    try {
      const res = await fetch("/api/seller/me");
      const data = await res.json();
      
      if (data.success) {
        setSeller(data.data);
      }
    } catch (error) {
      console.error("Error loading seller data:", error);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-gray-400">Cargando...</div>
      </div>
    );
  }

  if (!seller || !seller.can_use_api) {
    return (
      <div className="p-6">
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-yellow-400 mb-2">API No Disponible</h2>
          <p className="text-gray-300">
            Tu cuenta de seller no tiene acceso a la API. Contacta al administrador.
          </p>
        </div>
      </div>
    );
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://tu-keyauth.vercel.app';
  const exampleUrl = `${baseUrl}/api/seller/?sellerkey=${seller.seller_key}&type=add&app_id=d-9067c98495.44a8e4e8-3011-704b-f4d9-5ce54104eaf9&expiry=30&amount=5&level=1&format=json`;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">API & Discord Bot</h1>
        <p className="text-gray-400">Genera licencias automáticamente con tu API key</p>
      </div>

      {/* API Key Card */}
      <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-700/50 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Code className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Tu API Key</h2>
            <p className="text-sm text-gray-400">Usa esta key para generar licencias</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <code className="flex-1 bg-gray-900 text-emerald-300 text-sm px-4 py-3 rounded font-mono break-all">
            {seller.seller_key}
          </code>
          <button
            onClick={() => copyToClipboard(seller.seller_key, 'apikey')}
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition flex items-center gap-2"
          >
            {copied === 'apikey' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied === 'apikey' ? 'Copiado' : 'Copiar'}
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          ⚠️ <strong>Importante:</strong> No compartas tu API key. Cualquiera con esta key puede generar licencias en tu nombre.
        </div>
      </div>

      {/* Usage Examples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* URL Example */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-400" />
            Ejemplo de URL
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">URL Completa:</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-900 text-blue-300 text-xs px-3 py-2 rounded font-mono break-all">
                  {exampleUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(exampleUrl, 'url')}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
                  title="Copiar URL"
                >
                  {copied === 'url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-400 space-y-1">
              <p><strong>Parámetros:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><code className="text-emerald-400">sellerkey</code> - Tu API key</li>
                <li><code className="text-emerald-400">type</code> - add, info, balance</li>
                <li><code className="text-emerald-400">app_id</code> - ID de tu app</li>
                <li><code className="text-emerald-400">expiry</code> - Días (1-3650)</li>
                <li><code className="text-emerald-400">amount</code> - Cantidad (1-1000)</li>
                <li><code className="text-emerald-400">level</code> - Nivel (1-5)</li>
                <li><code className="text-emerald-400">format</code> - json o text</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Acciones Rápidas</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => copyToClipboard(seller.seller_key, 'key2')}
              className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition text-left flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Copiar API Key
              </span>
              {copied === 'key2' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>

            <a
              href={`${baseUrl}/api/seller/?sellerkey=${seller.seller_key}&type=balance&format=json`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition text-left flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Ver Balance (API)
              </span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href="/discord-bot-example/README.md"
              target="_blank"
              className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded transition text-left flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Ver Docs del Bot
              </span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Discord Bot Section */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Bot de Discord</h2>
            <p className="text-sm text-gray-400">Genera licencias automáticamente desde Discord</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-white mb-3">🤖 Configuración del Bot:</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 font-mono text-xs mt-0.5">1.</span>
              <div>
                <code className="text-blue-300">BOT_TOKEN:</code>
                <span className="text-gray-400"> Tu token de Discord Developer Portal</span>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 font-mono text-xs mt-0.5">2.</span>
              <div>
                <code className="text-blue-300">SELLER_KEY:</code>
                <button 
                  onClick={() => copyToClipboard(seller.seller_key, 'botkey')}
                  className="text-emerald-400 hover:text-emerald-300 underline ml-1"
                >
                  {copied === 'botkey' ? '✓ Copiado' : 'Copiar tu key'}
                </button>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 font-mono text-xs mt-0.5">3.</span>
              <div>
                <code className="text-blue-300">API_URL:</code>
                <code className="text-gray-400 ml-1">{baseUrl}/api/seller</code>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 font-mono text-xs mt-0.5">4.</span>
              <div>
                <code className="text-blue-300">APP_ID:</code>
                <span className="text-gray-400"> ID de tu aplicación</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-purple-300 mb-2">📝 Comandos del Bot:</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li><code className="text-emerald-400">!generar [cantidad] [días]</code> - Genera licencias</li>
            <li><code className="text-emerald-400">!balance</code> - Consulta tus créditos</li>
            <li><code className="text-emerald-400">!ayuda</code> - Muestra ayuda</li>
          </ul>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            📦 Encuentra el código del bot en: <code className="text-emerald-400">/discord-bot-example/</code>
          </span>
          <a
            href="https://github.com/luisdavidgarza385/KYEAUTHXITER/tree/master/discord-bot-example"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            Ver en GitHub <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Response Examples */}
      <div className="mt-6 bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Ejemplos de Respuesta</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Success Response */}
          <div>
            <h4 className="text-sm font-semibold text-emerald-400 mb-2">✅ Éxito (JSON):</h4>
            <pre className="bg-gray-900 text-xs text-gray-300 p-3 rounded overflow-x-auto">
{`{
  "success": true,
  "message": "5 licencia(s) creada(s)",
  "data": {
    "licenses": [
      "ABCD-1234-EFGH-5678",
      "IJKL-9012-MNOP-3456",
      ...
    ],
    "count": 5,
    "expiry_days": 30,
    "level": 1
  }
}`}
            </pre>
          </div>

          {/* Error Response */}
          <div>
            <h4 className="text-sm font-semibold text-red-400 mb-2">❌ Error (JSON):</h4>
            <pre className="bg-gray-900 text-xs text-gray-300 p-3 rounded overflow-x-auto">
{`{
  "success": false,
  "message": "Créditos insuficientes",
  "data": null
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
