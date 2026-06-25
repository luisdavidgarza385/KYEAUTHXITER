"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ExternalLink, Check, Code, Bot, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface App {
  id: string;
  name: string;
}

export default function AdminAPIPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [selectedApp, setSelectedApp] = useState<string>("");
  const [adminKey, setAdminKey] = useState<string>("");
  const [copied, setCopied] = useState<string>("");
  const { toast } = useToast();

  // Estados para el probador
  const [testType, setTestType] = useState<string>("init");
  const [testExpiry, setTestExpiry] = useState<string>("30");
  const [testAmount, setTestAmount] = useState<string>("1");
  const [testLevel, setTestLevel] = useState<string>("1");
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
    // Generar una key de admin (en producción esto debería venir de la base de datos)
    const key = generateAdminKey();
    setAdminKey(key);
  };

  const generateAdminKey = () => {
    // Genera una key aleatoria de 32 caracteres
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
    toast({
      title: "Copiado",
      description: `${label} copiado al portapapeles`,
    });
  };

  const testEndpoint = async () => {
    if (!selectedApp) {
      toast({
        title: "Error",
        description: "Selecciona una aplicación",
        variant: "destructive",
      });
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

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Integración de API</h1>
        <p className="text-muted-foreground mt-2">
          Conecta tu client/loader a nuestra API KeyAuth 1.0 compatible
        </p>
      </div>

      <Tabs defaultValue="examples" className="space-y-6">
        <TabsList>
          <TabsTrigger value="examples">
            <Code className="w-4 h-4 mr-2" />
            Ejemplos de Código
          </TabsTrigger>
          <TabsTrigger value="tester">
            <Bot className="w-4 h-4 mr-2" />
            Probador de Endpoints (Tester)
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: EJEMPLOS DE CÓDIGO */}
        <TabsContent value="examples" className="space-y-6">
          {/* Configuración */}
          <Card>
            <CardHeader>
              <CardTitle>🔑 Credenciales de API</CardTitle>
              <CardDescription>
                Usa estas credenciales para conectar tu aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>APP NAME / ID</Label>
                  <div className="flex gap-2">
                    <Input value={selectedApp} readOnly />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(selectedApp, "App ID")}
                    >
                      {copied === "App ID" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>API SECRET</Label>
                  <div className="flex gap-2">
                    <Input type="password" value={adminKey} readOnly />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(adminKey, "API Secret")}
                    >
                      {copied === "API Secret" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Seleccionar Aplicación</Label>
                <Select value={selectedApp} onValueChange={setSelectedApp}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una app" />
                  </SelectTrigger>
                  <SelectContent>
                    {apps.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Ejemplo de URL */}
          <Card>
            <CardHeader>
              <CardTitle>📝 Ejemplo de URL</CardTitle>
              <CardDescription>URL Completa para inicializar sesión</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL Completa:</Label>
                <div className="flex gap-2">
                  <Input value={exampleUrl} readOnly className="font-mono text-xs" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(exampleUrl, "URL")}
                  >
                    {copied === "URL" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Parámetros:</Label>
                <div className="bg-muted p-4 rounded-lg space-y-1 text-sm font-mono">
                  <div><span className="text-primary">type</span> - init, login, register, license, var, log, logout</div>
                  <div><span className="text-primary">sessionid</span> - Tu API Secret</div>
                  <div><span className="text-primary">name</span> - ID de tu aplicación</div>
                  <div><span className="text-primary">ver</span> - Versión de la app (ej: 1.0)</div>
                  <div><span className="text-primary">hwid</span> - Hardware ID del usuario</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Code className="w-4 h-4 mr-2" />
                  Ver Documentación
                </Button>
                <Button variant="outline" className="flex-1">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Tutorial
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ejemplos de Código */}
          <Card>
            <CardHeader>
              <CardTitle>💻 Ejemplos de Código</CardTitle>
              <CardDescription>Implementaciones en diferentes lenguajes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="csharp">
                <TabsList>
                  <TabsTrigger value="csharp">C#</TabsTrigger>
                  <TabsTrigger value="cpp">C++</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="js">JavaScript</TabsTrigger>
                </TabsList>

                <TabsContent value="csharp">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`using System;
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
}`}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(document.querySelector('pre')?.textContent || "", "Código C#")}
                    >
                      {copied === "Código C#" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="python">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`import requests

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
print(response.json())`}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(document.querySelector('pre')?.textContent || "", "Código Python")}
                    >
                      {copied === "Código Python" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="js">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`const axios = require('axios');

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
    .catch(error => console.error(error));`}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(document.querySelector('pre')?.textContent || "", "Código JS")}
                    >
                      {copied === "Código JS" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="cpp">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`#include <iostream>
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
}`}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(document.querySelector('pre')?.textContent || "", "Código C++")}
                    >
                      {copied === "Código C++" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: PROBADOR DE ENDPOINTS */}
        <TabsContent value="tester" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🧪 Probador de Endpoints (Tester)</CardTitle>
              <CardDescription>
                Prueba los endpoints de la API directamente desde aquí
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Acción (TYPE)</Label>
                  <Select value={testType} onValueChange={setTestType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="init">init (Iniciar Sesión)</SelectItem>
                      <SelectItem value="login">login (Login)</SelectItem>
                      <SelectItem value="register">register (Registro)</SelectItem>
                      <SelectItem value="license">license (Validar License)</SelectItem>
                      <SelectItem value="var">var (Variables)</SelectItem>
                      <SelectItem value="log">log (Logs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>HWID</Label>
                  <Input
                    value={testHwid}
                    onChange={(e) => setTestHwid(e.target.value)}
                    placeholder="TEST-HWID-001"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={testEndpoint} disabled={isLoading} className="flex-1">
                  {isLoading ? "Enviando..." : "✉️ ENVIAR SOLICITUD"}
                </Button>
              </div>

              {testResponse && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Respuesta:</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(testResponse, "Respuesta")}
                    >
                      {copied === "Respuesta" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs max-h-96">
                    {testResponse}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader>
              <CardTitle className="text-green-500">✅ Ejemplos de Respuesta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-green-500">✅ Éxito (init):</Label>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs mt-2">
{`{
  "success": true,
  "message": "Initialized",
  "sessionid": "abc123...",
  "app": {
    "name": "MyApp",
    "version": "1.0"
  }
}`}
                </pre>
              </div>

              <div>
                <Label className="text-red-500">❌ Error:</Label>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs mt-2">
{`{
  "success": false,
  "message": "Invalid credentials"
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
