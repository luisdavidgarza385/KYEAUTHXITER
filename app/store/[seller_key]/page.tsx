"use client";

import { useState, useEffect } from "react";
import { TypewriterBrand } from "@/components/TypewriterBrand";
import { Key, CheckCircle, XCircle, Loader2, Copy, Check } from "lucide-react";
import { useParams } from "next/navigation";

interface SellerInfo {
  username: string;
  status: string;
}

export default function PublicStorePage() {
  const params = useParams();
  const sellerKey = params.seller_key as string;

  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "success" | "error">("form");
  const [generatedLicenses, setGeneratedLicenses] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    discord_tag: "",
    app_id: "",
    expiry: "30",
    amount: "1",
  });

  useEffect(() => {
    if (sellerKey) {
      loadSellerInfo();
    }
  }, [sellerKey]);

  async function loadSellerInfo() {
    try {
      const res = await fetch(`/api/store/seller-info?seller_key=${sellerKey}`);
      const data = await res.json();
      if (data.success) {
        setSellerInfo(data.data);
      }
    } catch (error) {
      console.error("Error loading seller info:", error);
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.app_id) {
      setErrorMessage("Por favor selecciona una aplicación");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(`/api/seller/?sellerkey=${sellerKey}&type=add&app_id=${formData.app_id}&expiry=${formData.expiry}&amount=${formData.amount}&level=1&format=json`);
      
      const data = await res.json();

      if (data.success) {
        setGeneratedLicenses(data.data.licenses);
        setStep("success");

        // Send webhook or email notification (opcional)
        await sendNotification(formData.username, formData.email, formData.discord_tag, data.data.licenses);
      } else {
        setErrorMessage(data.message || "Error al generar licencias");
        setStep("error");
      }
    } catch (error: any) {
      setErrorMessage("Error de conexión. Intenta de nuevo.");
      setStep("error");
    } finally {
      setLoading(false);
    }
  }

  async function sendNotification(username: string, email: string, discordTag: string, licenses: string[]) {
    try {
      await fetch("/api/store/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seller_key: sellerKey,
          username,
          email,
          discord_tag: discordTag,
          licenses,
        }),
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }

  function copyToClipboard(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  function reset() {
    setStep("form");
    setFormData({
      username: "",
      email: "",
      discord_tag: "",
      app_id: "",
      expiry: "30",
      amount: "1",
    });
    setGeneratedLicenses([]);
    setErrorMessage("");
  }

  if (!sellerInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <TypewriterBrand />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Tienda de {sellerInfo.username}
          </h1>
          <p className="text-gray-400 text-sm">
            Genera tu licencia al instante
          </p>
        </div>

        {/* Form */}
        {step === "form" && (
          <div className="bg-gray-800/80 backdrop-blur border border-emerald-500/20 rounded-xl p-6 shadow-2xl">
            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Usuario *
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition"
                  placeholder="Tu nombre de usuario"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition"
                  placeholder="tu@email.com"
                />
              </div>

              {/* Discord Tag */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Discord (opcional)
                </label>
                <input
                  type="text"
                  value={formData.discord_tag}
                  onChange={(e) => setFormData({ ...formData, discord_tag: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition"
                  placeholder="usuario#1234"
                />
              </div>

              {/* App ID */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ID de Aplicación *
                </label>
                <input
                  type="text"
                  required
                  value={formData.app_id}
                  onChange={(e) => setFormData({ ...formData, app_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition font-mono text-sm"
                  placeholder="d-xxx.xxx-xxx"
                />
              </div>

              {/* Expiry & Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Días
                  </label>
                  <select
                    value={formData.expiry}
                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition"
                  >
                    <option value="1">1 día</option>
                    <option value="7">7 días</option>
                    <option value="30">30 días</option>
                    <option value="90">90 días</option>
                    <option value="180">180 días</option>
                    <option value="365">365 días</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    Generar Licencia
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="bg-gray-800/80 backdrop-blur border border-emerald-500/50 rounded-xl p-6 shadow-2xl">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                ¡Licencia Generada!
              </h2>
              <p className="text-gray-400 text-sm">
                Tu licencia ha sido creada exitosamente
              </p>
            </div>

            {/* Licenses */}
            <div className="space-y-3 mb-6">
              {generatedLicenses.map((license, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 flex items-center justify-between"
                >
                  <code className="text-emerald-400 font-mono text-sm font-semibold">
                    {license}
                  </code>
                  <button
                    onClick={() => copyToClipboard(license, index)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
              <p className="text-emerald-400 text-sm font-medium mb-1">
                📧 Revisa tu email
              </p>
              <p className="text-gray-400 text-xs">
                También hemos enviado las licencias a tu correo electrónico
                {formData.discord_tag && " y Discord"}
              </p>
            </div>

            {/* Details */}
            <div className="text-sm text-gray-400 space-y-1 mb-6">
              <p>👤 Usuario: <span className="text-white">{formData.username}</span></p>
              <p>⏱️ Duración: <span className="text-white">{formData.expiry} días</span></p>
              <p>🔢 Cantidad: <span className="text-white">{generatedLicenses.length}</span></p>
            </div>

            {/* Reset Button */}
            <button
              onClick={reset}
              className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
            >
              Generar Otra Licencia
            </button>
          </div>
        )}

        {/* Error */}
        {step === "error" && (
          <div className="bg-gray-800/80 backdrop-blur border border-red-500/50 rounded-xl p-6 shadow-2xl">
            <div className="text-center mb-6">
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Error
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                {errorMessage}
              </p>
            </div>

            <button
              onClick={reset}
              className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
            >
              Intentar de Nuevo
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-xs">
          <p>Powered by KeyAuth Pro</p>
        </div>
      </div>
    </div>
  );
}
