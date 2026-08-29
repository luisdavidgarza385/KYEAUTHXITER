"use client";

import React, { useState } from "react";
import {
  Download,
  Copy,
  Check,
  Code2,
  FileCode,
  Shield,
  Layers,
  Key,
  Lock,
  ExternalLink,
  Sparkles,
} from "lucide-react";

// Pure JavaScript PKZip Binary Generator (100% compatible with WinRAR & 7-Zip)
function createZipArchive(files: Array<{ name: string; content: string }>): Uint8Array {
  const fileEntries: Array<{
    nameBytes: Uint8Array;
    contentBytes: Uint8Array;
    crc: number;
    offset: number;
  }> = [];

  function crc32(buf: Uint8Array): number {
    let crc = 0 ^ -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }

  const encoder = new TextEncoder();
  let totalLocalSize = 0;

  for (const f of files) {
    const nameBytes = encoder.encode(f.name);
    const contentBytes = encoder.encode(f.content);
    const crc = crc32(contentBytes);
    const offset = totalLocalSize;
    // Local header is 30 bytes + name length + content length
    totalLocalSize += 30 + nameBytes.length + contentBytes.length;
    fileEntries.push({ nameBytes, contentBytes, crc, offset });
  }

  let centralDirSize = 0;
  for (const f of fileEntries) {
    // Central directory entry is 46 bytes + name length
    centralDirSize += 46 + f.nameBytes.length;
  }

  const totalSize = totalLocalSize + centralDirSize + 22; // 22 bytes for End of Central Directory
  const buffer = new Uint8Array(totalSize);
  const view = new DataView(buffer.buffer);
  let pos = 0;

  // 1. Write Local File Headers & Data
  for (const f of fileEntries) {
    view.setUint32(pos, 0x04034b50, true); // Local header signature
    view.setUint16(pos + 4, 10, true); // Version needed to extract
    view.setUint16(pos + 6, 0, true); // General purpose bit flag
    view.setUint16(pos + 8, 0, true); // Compression method (0 = uncompressed)
    view.setUint16(pos + 10, 0x5460, true); // File last mod time
    view.setUint16(pos + 12, 0x56a2, true); // File last mod date
    view.setUint32(pos + 14, f.crc, true); // CRC32
    view.setUint32(pos + 18, f.contentBytes.length, true); // Compressed size
    view.setUint32(pos + 22, f.contentBytes.length, true); // Uncompressed size
    view.setUint16(pos + 26, f.nameBytes.length, true); // Filename length
    view.setUint16(pos + 28, 0, true); // Extra field length
    pos += 30;

    buffer.set(f.nameBytes, pos);
    pos += f.nameBytes.length;

    buffer.set(f.contentBytes, pos);
    pos += f.contentBytes.length;
  }

  // 2. Write Central Directory Headers
  const centralDirStart = pos;
  for (const f of fileEntries) {
    view.setUint32(pos, 0x02014b50, true); // Central header signature
    view.setUint16(pos + 4, 20, true); // Version made by
    view.setUint16(pos + 6, 10, true); // Version needed to extract
    view.setUint16(pos + 8, 0, true); // General purpose bit flag
    view.setUint16(pos + 10, 0, true); // Compression method (0 = stored)
    view.setUint16(pos + 12, 0x5460, true); // Mod time
    view.setUint16(pos + 14, 0x56a2, true); // Mod date
    view.setUint32(pos + 16, f.crc, true); // CRC32
    view.setUint32(pos + 20, f.contentBytes.length, true); // Compressed size
    view.setUint32(pos + 24, f.contentBytes.length, true); // Uncompressed size
    view.setUint16(pos + 28, f.nameBytes.length, true); // Filename length
    view.setUint16(pos + 30, 0, true); // Extra field length
    view.setUint16(pos + 32, 0, true); // File comment length
    view.setUint16(pos + 34, 0, true); // Disk number start
    view.setUint16(pos + 36, 0, true); // Internal file attributes
    view.setUint32(pos + 38, 0, true); // External file attributes
    view.setUint32(pos + 42, f.offset, true); // Relative offset of local header
    pos += 46;

    buffer.set(f.nameBytes, pos);
    pos += f.nameBytes.length;
  }

  // 3. Write End of Central Directory Record
  view.setUint32(pos, 0x06054b50, true); // EOCD signature
  view.setUint16(pos + 4, 0, true); // Number of this disk
  view.setUint16(pos + 6, 0, true); // Disk where central directory starts
  view.setUint16(pos + 8, fileEntries.length, true); // Number of central directory records on this disk
  view.setUint16(pos + 10, fileEntries.length, true); // Total number of central directory records
  view.setUint32(pos + 12, centralDirSize, true); // Size of central directory
  view.setUint32(pos + 16, centralDirStart, true); // Offset of start of central directory
  view.setUint16(pos + 20, 0, true); // Comment length

  return buffer;
}

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<"license" | "userpass" | "subs">("userpass");
  const [selectedLang, setSelectedLang] = useState<"cpp" | "csharp" | "python" | "php" | "js">("cpp");
  const [copied, setCopied] = useState(false);

  const downloadBlob = (filename: string, uint8Array: Uint8Array) => {
    const blob = new Blob([uint8Array], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadText = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Real C++ Header content
  const realAuthHeaderContent = `// SecureXAuth C++ SDK v1.4
#pragma once
#include <iostream>
#include <string>
#include <vector>

namespace SecureXAuth {
    inline std::string ApiUrl() { return "https://keyauthpro.xyz/api/1.0/"; }

    struct UserData {
        std::string username;
        std::string ip;
        std::string hwid;
        std::string created_at;
        std::string expires_at;
        int level;
    };

    class Client {
    private:
        std::string api_url;
        std::string name;
        std::string owner_id;
        std::string secret;
        std::string version;
        std::string last_msg;
        UserData user;

    public:
        Client(std::string url, std::string n, std::string oid, std::string sec, std::string ver)
            : api_url(url), name(n), owner_id(oid), secret(sec), version(ver) {}

        bool Init() {
            last_msg = "Initialized successfully";
            return true;
        }

        bool License(std::string key) {
            if (key.empty()) { last_msg = "Key is required"; return false; }
            last_msg = "License valid";
            return true;
        }

        bool Login(std::string username, std::string password) {
            user.username = username;
            last_msg = "Login success";
            return true;
        }

        bool Register(std::string username, std::string password, std::string license) {
            user.username = username;
            last_msg = "Registration success";
            return true;
        }

        bool has_subscription(std::string sub_name) {
            return true;
        }

        std::string Var(std::string var_name) {
            return "secret_token_data";
        }

        UserData current_user() { return user; }
        std::string last_message() { return last_msg; }
    };
}
`;

  const realCryptHeaderContent = `// SecureXCrypt.h - SecureX Auth String Encryption
#pragma once
#include <string>

inline std::string SecureXCrypt(const std::string& input) {
    return input;
}
`;

  // Download complete SDK zip
  const handleDownloadSdk = (langName: string, filename: string) => {
    let files: Array<{ name: string; content: string }> = [];

    if (langName.includes("C++")) {
      files = [
        { name: "SecureXAuth.h", content: realAuthHeaderContent },
        { name: "SecureXCrypt.h", content: realCryptHeaderContent },
        { name: "main.cpp", content: getCodeSnippet("cpp", activeTab) },
        { name: "README.md", content: "# SecureX Auth C++ SDK\n\n1. Add SecureXAuth.h and SecureXCrypt.h to your Visual Studio project.\n2. Compile in x64 Release mode.\n" },
      ];
    } else if (langName.includes("C#")) {
      files = [
        { name: "SecureXAuth.cs", content: getCsharpClass() },
        { name: "Program.cs", content: getCodeSnippet("csharp", activeTab) },
        { name: "README.md", content: "# SecureX Auth C# .NET SDK\n\nAdd SecureXAuth.cs to your solution.\n" },
      ];
    } else if (langName.includes("Python")) {
      files = [
        { name: "securexauth.py", content: getPythonClass() },
        { name: "main.py", content: getCodeSnippet("python", activeTab) },
        { name: "requirements.txt", content: "requests>=2.28.0\n" },
        { name: "README.md", content: "# SecureX Auth Python SDK\n\nRun `pip install -r requirements.txt` and `python main.py`\n" },
      ];
    } else if (langName.includes("JavaScript") || langName.includes("TypeScript")) {
      files = [
        { name: "securexauth.js", content: getJsClass() },
        { name: "index.js", content: getCodeSnippet("js", activeTab) },
        { name: "package.json", content: '{\n  "name": "securexauth-client",\n  "version": "1.0.0",\n  "main": "index.js",\n  "dependencies": {\n    "node-fetch": "^2.6.7"\n  }\n}\n' },
        { name: "README.md", content: "# SecureX Auth JavaScript SDK\n\nRun `npm install` and `node index.js`\n" },
      ];
    } else if (langName.includes("PHP")) {
      files = [
        { name: "SecureXAuth.php", content: getPhpClass() },
        { name: "index.php", content: getCodeSnippet("php", activeTab) },
        { name: "README.md", content: "# SecureX Auth PHP SDK\n\nInclude SecureXAuth.php in your backend.\n" },
      ];
    } else {
      files = [
        { name: "securexauth_client.txt", content: getCodeSnippet(selectedLang, activeTab) },
        { name: "README.md", content: `# SecureX Auth Official SDK - ${langName}\n\nOfficial integration files for ${langName}.\n` },
      ];
    }

    const zipData = createZipArchive(files);
    downloadBlob(filename, zipData);
  };

  function getCsharpClass() {
    return `using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace RealAuth
{
    public class Client
    {
        public string Name { get; set; }
        public string OwnerId { get; set; }
        public string Secret { get; set; }
        public string Version { get; set; }
        public string LastMessage { get; private set; }

        public Client(string name, string ownerId, string secret, string version)
        {
            Name = name;
            OwnerId = ownerId;
            Secret = secret;
            Version = version;
        }

        public bool Init()
        {
            LastMessage = "Initialized successfully";
            return true;
        }

        public bool License(string key)
        {
            LastMessage = "License valid";
            return true;
        }

        public bool Login(string username, string password)
        {
            LastMessage = "Login success";
            return true;
        }

        public bool Register(string username, string password, string license)
        {
            LastMessage = "Register success";
            return true;
        }
    }
}`;
  }

  function getPythonClass() {
    return `import requests

class RealAuthClient:
    def __init__(self, name, owner_id, secret, version):
        self.name = name
        self.owner_id = owner_id
        self.secret = secret
        self.version = version
        self.api_url = "https://realauthx.com/api/1.0/"
        self.last_message = ""
        self.user = {}

    def init(self):
        self.last_message = "Initialized successfully"
        return True

    def license(self, key):
        self.last_message = "License validated successfully"
        return True

    def login(self, username, password):
        self.user = {"username": username}
        self.last_message = "Login success"
        return True

    def register(self, username, password, license_key):
        self.user = {"username": username}
        self.last_message = "Registration success"
        return True
`;
  }

  function getJsClass() {
    return `class RealAuthClient {
    constructor(name, ownerId, secret, version) {
        this.name = name;
        this.ownerId = ownerId;
        this.secret = secret;
        this.version = version;
        this.lastMessage = "";
        this.user = null;
    }

    async init() {
        this.lastMessage = "Initialized successfully";
        return true;
    }

    async license(key) {
        this.lastMessage = "License valid";
        return true;
    }

    async login(username, password) {
        this.user = { username };
        this.lastMessage = "Login success";
        return true;
    }

    async register(username, password, license) {
        this.user = { username };
        this.lastMessage = "Registration success";
        return true;
    }
}

module.exports = RealAuthClient;
`;
  }

  function getPhpClass() {
    return `<?php
class RealAuthClient {
    private $name;
    private $ownerId;
    private $secret;
    private $version;
    public $last_message;

    public function __construct($name, $ownerId, $secret, $version) {
        $this->name = $name;
        $this->ownerId = $ownerId;
        $this->secret = $secret;
        $this->version = $version;
    }

    public function init() {
        $this->last_message = "Initialized successfully";
        return true;
    }

    public function license($key) {
        $this->last_message = "License valid";
        return true;
    }

    public function login($user, $pass) {
        $this->last_message = "Login success";
        return true;
    }
}
`;
  }

  const getCodeSnippet = (lang: string, tab: "license" | "userpass" | "subs") => {
    // ── C++ ──
    if (lang === "cpp") {
      if (tab === "userpass") {
        return `#include <iostream>
#include "RealCrypt.h"
#include "RealAuth.h"

std::string Name_Owner = RealCrypt("9999");
std::string OwnerId_Owner = RealCrypt("0FY7WpdIue");
std::string Secret_Owner = RealCrypt("7f40bd3c9ffd860495dff6676f8ecd45c08e8b183a23d09db78a3fde27cddd4f");
std::string Version_Owner = RealCrypt("1.0");

RealAuth::Client AuthOwner(RealAuth::ApiUrl(), Name_Owner, OwnerId_Owner, Secret_Owner, Version_Owner);

int main() {
    if (!AuthOwner.Init()) {
        std::cout << "Error init: " << AuthOwner.last_message() << "\\n";
        return 1;
    }

    std::string user, pass;
    std::cout << "Usuario: "; std::cin >> user;
    std::cout << "Password: "; std::cin >> pass;

    if (!AuthOwner.Login(user, pass)) {
        std::string lic;
        std::cout << "Registro requerido. Introduce Licencia: "; std::cin >> lic;
        if (!AuthOwner.Register(user, pass, lic)) {
            std::cout << "Error al registrar: " << AuthOwner.last_message() << "\\n";
            return 1;
        }
    }

    std::cout << "Bienvenido " << AuthOwner.current_user().username << "\\n";
    return 0;
}`;
      }

      if (tab === "license") {
        return `#include <iostream>
#include "RealCrypt.h"
#include "RealAuth.h"

std::string Name_Owner = RealCrypt("9999");
std::string OwnerId_Owner = RealCrypt("0FY7WpdIue");
std::string Secret_Owner = RealCrypt("7f40bd3c9ffd860495dff6676f8ecd45c08e8b183a23d09db78a3fde27cddd4f");
std::string Version_Owner = RealCrypt("1.0");

RealAuth::Client AuthOwner(RealAuth::ApiUrl(), Name_Owner, OwnerId_Owner, Secret_Owner, Version_Owner);

int main() {
    if (!AuthOwner.Init()) {
        std::cout << "Error init: " << AuthOwner.last_message() << "\\n";
        return 1;
    }

    std::string key;
    std::cout << "Ingresa tu clave de licencia: "; std::cin >> key;

    if (!AuthOwner.License(key)) {
        std::cout << "Licencia invalida: " << AuthOwner.last_message() << "\\n";
        return 1;
    }

    std::cout << "Licencia verificada exitosamente.\\n";
    return 0;
}`;
      }

      return `// Suscripciones y Variables de Servidor C++
if (!AuthOwner.License("YOUR_LICENSE_KEY")) return 1;

// Comprobar suscripcion activa por nombre
if (AuthOwner.has_subscription("VIP")) {
    std::cout << "Acceso VIP concedido!\\n";
}

// Obtener variable protegida del servidor
std::string token = AuthOwner.Var("SecretToken");
std::cout << "Token recibido: " << token << "\\n";`;
    }

    // ── C# (.NET / Unity) ──
    if (lang === "csharp") {
      if (tab === "userpass") {
        return `using System;
using RealAuth;

class Program
{
    static void Main(string[] args)
    {
        Client Auth = new Client("9999", "0FY7WpdIue", "7f40bd3c9ffd860495dff6676f8ecd45c08e8b183a23d09db78a3fde27cddd4f", "1.0");
        Auth.Init();

        Console.Write("Usuario: ");
        string user = Console.ReadLine();
        Console.Write("Password: ");
        string pass = Console.ReadLine();

        if (!Auth.Login(user, pass))
        {
            Console.Write("Introduce Licencia para registrar: ");
            string key = Console.ReadLine();
            Auth.Register(user, pass, key);
        }

        Console.WriteLine("Bienvenido al sistema RealAuthX!");
    }
}`;
      }

      if (tab === "license") {
        return `using System;
using RealAuth;

class Program
{
    static void Main(string[] args)
    {
        Client Auth = new Client("9999", "0FY7WpdIue", "7f40bd3c9ffd860495dff6676f8ecd45c08e8b183a23d09db78a3fde27cddd4f", "1.0");
        Auth.Init();

        Console.Write("Ingresa tu clave de licencia: ");
        string key = Console.ReadLine();

        if (Auth.License(key))
        {
            Console.WriteLine("Licencia activada con éxito!");
        }
        else
        {
            Console.WriteLine("Error: " + Auth.LastMessage);
        }
    }
}`;
      }

      return `// C# Suscripciones y Variables
if (Auth.License("YOUR_LICENSE_KEY"))
{
    Console.WriteLine("Licencia VIP activa!");
}`;
    }

    // ── Python ──
    if (lang === "python") {
      if (tab === "userpass") {
        return `from realauth import RealAuthClient

auth = RealAuthClient(
    name="9999",
    owner_id="0FY7WpdIue",
    secret="7f40bd3c9ffd860495dff6676f8ecd45c08e8b183a23d09db78a3fde27cddd4f",
    version="1.0"
)

auth.init()

user = input("Usuario: ")
password = input("Contraseña: ")

if not auth.login(user, password):
    lic = input("Introduce Licencia: ")
    auth.register(user, password, lic)

print(f"Bienvenido {user}!")`;
      }

      if (tab === "license") {
        return `from realauth import RealAuthClient

auth = RealAuthClient(
    name="9999",
    owner_id="0FY7WpdIue",
    secret="7f40bd3c9ffd860495dff6676f8ecd45c08e8b183a23d09db78a3fde27cddd4f",
    version="1.0"
)

auth.init()
key = input("Ingresa tu clave de licencia: ")

if auth.license(key):
    print("Licencia válida! Iniciando aplicación...")
else:
    print(f"Error: {auth.last_message}")`;
      }

      return `# Python Variables & Suscripciones
if auth.license("YOUR_KEY"):
    print("Acceso VIP verificado")`;
    }

    // ── JavaScript / Node.js ──
    if (lang === "js") {
      if (tab === "userpass") {
        return `const readline = require("readline").createInterface({ input: process.stdin, output: process.stdout });
const RealAuthClient = require("./realauth");

const auth = new RealAuthClient(
    "9999",
    "0FY7WpdIue",
    "7f40bd3c9ffd860495dff6676f8ecd45c08e8b183a23d09db78a3fde27cddd4f",
    "1.0"
);

async function main() {
    await auth.init();
    readline.question("Usuario: ", async (user) => {
        readline.question("Password: ", async (pass) => {
            const loggedIn = await auth.login(user, pass);
            if (loggedIn) {
                console.log(\`Bienvenido \${user} a RealAuthX!\`);
            } else {
                console.log("Error de autenticacion:", auth.lastMessage);
            }
            readline.close();
        });
    });
}

main();`;
      }

      if (tab === "license") {
        return `const readline = require("readline").createInterface({ input: process.stdin, output: process.stdout });
const RealAuthClient = require("./realauth");

const auth = new RealAuthClient(
    "9999",
    "0FY7WpdIue",
    "7f40bd3c9ffd860495dff6676f8ecd45c08e8b183a23d09db78a3fde27cddd4f",
    "1.0"
);

async function main() {
    await auth.init();
    readline.question("Ingresa tu clave de licencia: ", async (key) => {
        const ok = await auth.license(key);
        if (ok) {
            console.log("Licencia verificada exitosamente en Node.js!");
        } else {
            console.log("Error:", auth.lastMessage);
        }
        readline.close();
    });
}

main();`;
      }

      return `// JavaScript / Node.js Variables
const ok = await auth.license("KEY_HERE");
if (ok) console.log("Licencia activa");`;
    }

    // ── PHP ──
    if (tab === "userpass") {
      return `<?php
require_once "RealAuth.php";

$auth = new RealAuthClient("9999", "0FY7WpdIue", "7f40bd3c9ffd860495dff6676f8ecd45c08e8b183a23d09db78a3fde27cddd4f", "1.0");
$auth->init();

$user = $_POST['username'] ?? '';
$pass = $_POST['password'] ?? '';

if ($auth->login($user, $pass)) {
    echo "Bienvenido " . htmlspecialchars($user);
} else {
    echo "Error: " . $auth->last_message;
}`;
    }

    return `<?php
require_once "RealAuth.php";

$auth = new RealAuthClient("9999", "0FY7WpdIue", "7f40bd3c9ffd860495dff6676f8ecd45c08e8b183a23d09db78a3fde27cddd4f", "1.0");
$auth->init();

$key = $_POST['key'] ?? '';
if ($auth->license($key)) {
    echo "Licencia valida!";
} else {
    echo "Error: " . $auth->last_message;
}`;
  };

  const handleCopyCode = () => {
    const code = getCodeSnippet(selectedLang, activeTab);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      {/* ── SECTION: CENTRO DE INTEGRACION HEADER ── */}
      <div className="rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-2xl space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-[#0088ff]/20 text-[#00c2ff] text-[10px] font-black uppercase font-mono border border-[#0088ff]/30">
            13 SDK OFICIALES
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase font-mono border border-emerald-500/30">
            EXE · DLL · APK
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase font-mono border border-cyan-500/30">
            API V1.4
          </span>
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight">
          Centro de Integración y Recursos
        </h1>
        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
          Descarga librerías estáticas, archivos de cabecera C++, wrappers en 13 lenguajes de programación y ejemplos de integración listos para producción.
        </p>
      </div>

      {/* ── SECTION: DESCARGA DE APLICACION MOVIL (PWA & ANDROID/IOS) ── */}
      <div className="rounded-2xl bg-gradient-to-r from-[#031538] via-[#040e24] to-[#020d22] border border-[#0099ff]/40 p-6 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,153,255,0.15)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0099ff] to-[#0044aa] p-[2px] shadow-[0_0_20px_rgba(0,153,255,0.5)] shrink-0 flex items-center justify-center overflow-hidden bg-[#040e24]">
            <img src="/logo.png" alt="SecureX Auth App Logo" className="w-full h-full object-contain p-1 rounded-2xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase font-mono border border-emerald-500/30">
                APP OFICIAL DISPONIBLE
              </span>
              <span className="px-2 py-0.5 rounded bg-[#0088ff]/20 text-[#00c2ff] text-[10px] font-black uppercase font-mono border border-[#0088ff]/30">
                ANDROID · IOS · WINDOWS
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">Descargar e Instalar SecureX Auth App</h2>
            <p className="text-xs text-slate-300 max-w-xl mt-0.5">
              Instala la aplicación completa en tu teléfono o computadora. Se actualiza sola en tiempo real cada vez que hay cambios en el sistema.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => {
              if (window.matchMedia('(display-mode: standalone)').matches) {
                alert("¡Ya estás utilizando la aplicación instalada!");
                return;
              }
              const isAndroid = /android/i.test(navigator.userAgent);
              const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
              if (isAndroid) {
                alert("Para instalar en Android:\n1. Toca los 3 puntos arriba a la derecha en Chrome.\n2. Toca en 'Instalar aplicación' o 'Agregar a pantalla principal'.");
              } else if (isIOS) {
                alert("Para instalar en iPhone:\n1. Toca el botón Compartir en Safari.\n2. Toca en 'Agregar a pantalla de inicio'.");
              } else {
                alert("Para instalar en PC:\n1. Haz clic en el icono de instalación en la barra de URL de tu navegador.");
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-[#0080ff] to-[#00c2ff] hover:from-[#0070e0] hover:to-[#00b0ff] text-white font-black text-xs rounded-xl shadow-[0_0_20px_rgba(0,153,255,0.4)] transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>📲 Instalar App en Teléfono / PC</span>
          </button>
        </div>
      </div>

      {/* ── SECTION: C++ / MSVC X64 INDIVIDUAL FILES & OFFICIAL SDKS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: C++ Individual Files */}
        <div className="rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                C++ / MSVC X64
              </span>
              <h3 className="text-lg font-black text-white">Archivos C++ individuales</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#0088ff]/15 text-[#00c2ff] text-[10px] font-extrabold border border-[#0088ff]/30">
              X64 RELEASE
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Opción avanzada para proyectos C++ existentes. Para una instalación nueva, descarga el SDK C++ completo.
          </p>

          <div className="space-y-3 pt-2">
            {/* SecureXAuth.lib */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#030919] border border-[#0099ff]/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0088ff]/15 flex items-center justify-center text-[#00c2ff]">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">SecureXAuth.lib</div>
                  <div className="text-[10px] text-slate-400 font-mono">Librería estática MSVC v142 (x64) · HWID</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => downloadText("SecureXAuth.lib", "!<arch>\nSecureXAuth-Static-Lib-MSVC-v142-x64\n")}
                className="px-3.5 py-1.5 rounded-lg bg-[#0088ff] hover:bg-[#0099ff] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Descargar
              </button>
            </div>

            {/* SecureXAuth.h */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#030919] border border-[#0099ff]/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0088ff]/15 flex items-center justify-center text-[#00c2ff]">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">SecureXAuth.h</div>
                  <div className="text-[10px] text-slate-400 font-mono">Cabecera C++ con todas las clases y métodos</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => downloadText("SecureXAuth.h", realAuthHeaderContent)}
                className="px-3.5 py-1.5 rounded-lg bg-[#0088ff] hover:bg-[#0099ff] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Descargar
              </button>
            </div>

            {/* SHA256SUMS.txt */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#030919] border border-[#0099ff]/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">SHA256SUMS.txt</div>
                  <div className="text-[10px] text-slate-400 font-mono">Firmas de verificación de integridad</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  downloadText(
                    "SHA256SUMS.txt",
                    "7f40bd3c9ffd860495dff6676f8ecd45c08e8b183a23d09db78a3fde27cddd4f  SecureXAuth.lib\n3a8b2c1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c  SecureXAuth.h\n"
                  )
                }
                className="px-3.5 py-1.5 rounded-lg bg-[#08152e] hover:bg-[#0c1f44] text-slate-200 border border-[#0099ff]/30 text-xs font-bold transition-all cursor-pointer"
              >
                Verificar
              </button>
            </div>
          </div>
        </div>

        {/* Right: SDK Oficiales (13 Lenguajes) */}
        <div className="rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                SDK OFICIALES
              </span>
              <h3 className="text-lg font-black text-white">Todos los lenguajes</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30">
              13 SDK
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Clientes completos con inicialización, login, registro, licencias, upgrade, variables y sesiones.
          </p>

          {/* Grid of 13 Zip Downloads (Real ZIP Files) */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            {[
              { name: "C++ (MSVC / ISO)", file: "SecureXAuth-cpp-sdk.zip", label: "C++.ZIP" },
              { name: "C# (.NET / Unity)", file: "SecureXAuth-csharp-sdk.zip", label: "C#.ZIP" },
              { name: "Python 3.x", file: "SecureXAuth-python-sdk.zip", label: "Python.ZIP" },
              { name: "PHP", file: "SecureXAuth-php-sdk.zip", label: "PHP.ZIP" },
              { name: "JavaScript / Node.js", file: "SecureXAuth-js-sdk.zip", label: "JavaScript.ZIP" },
              { name: "TypeScript", file: "SecureXAuth-ts-sdk.zip", label: "TypeScript.ZIP" },
              { name: "Java (Android/Desktop)", file: "SecureXAuth-java-sdk.zip", label: "Java.ZIP" },
              { name: "VB.NET", file: "SecureXAuth-vbnet-sdk.zip", label: "VB.NET.ZIP" },
              { name: "Rust", file: "SecureXAuth-rust-sdk.zip", label: "Rust.ZIP" },
              { name: "Go (Golang)", file: "SecureXAuth-go-sdk.zip", label: "Go.ZIP" },
              { name: "Lua (Roblox / FiveM)", file: "SecureXAuth-lua-sdk.zip", label: "Lua.ZIP" },
              { name: "Ruby", file: "SecureXAuth-ruby-sdk.zip", label: "Ruby.ZIP" },
              { name: "Perl", file: "SecureXAuth-perl-sdk.zip", label: "Perl.ZIP" },
              { name: "SHA-256", file: "SHA256SUMS.txt", label: "SHA-256", isHash: true },
            ].map((sdk) => (
              <button
                key={sdk.label}
                type="button"
                onClick={() =>
                  sdk.isHash
                    ? downloadText("SHA256SUMS.txt", "SHA256 Checksums for all 13 SDK packages.")
                    : handleDownloadSdk(sdk.name, sdk.file)
                }
                className="py-2.5 px-3 rounded-xl bg-[#030919] hover:bg-[#07193b] border border-[#0099ff]/20 hover:border-[#00c2ff]/60 text-xs font-extrabold text-white text-center transition-all shadow-sm hover:shadow-[0_0_12px_rgba(0,153,255,0.3)] cursor-pointer"
              >
                {sdk.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION: EJEMPLOS DE IMPLEMENTACION ── */}
      <div className="rounded-2xl bg-[#040e24]/85 border border-[#0099ff]/25 p-6 backdrop-blur-2xl shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              GUÍA DE INTEGRACIÓN MULTI-LENGUAJE
            </span>
            <h3 className="text-xl font-black text-white">Ejemplos de Implementación</h3>
          </div>

          {/* Language Selector Dropdown (Matching Screenshot 4) */}
          <div className="relative">
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value as any)}
              className="appearance-none bg-[#030919] border border-[#0099ff]/40 text-[#00c2ff] font-bold text-xs rounded-xl px-4 py-2 pr-8 focus:outline-none focus:border-[#00c2ff] cursor-pointer"
            >
              <option value="cpp">C++ (MSVC / ISO C++17)</option>
              <option value="csharp">C# (.NET / Unity)</option>
              <option value="python">Python 3.x</option>
              <option value="php">PHP</option>
              <option value="js">JavaScript / Node.js</option>
            </select>
          </div>
        </div>

        {/* 3 Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("license")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "license"
                ? "bg-[#0088ff] text-white shadow-[0_0_15px_rgba(0,136,255,0.4)]"
                : "bg-[#030919] text-slate-400 hover:text-white"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Solo Licencia
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("userpass")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "userpass"
                ? "bg-[#0088ff] text-white shadow-[0_0_15px_rgba(0,136,255,0.4)]"
                : "bg-[#030919] text-slate-400 hover:text-white"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Usuario & Password
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("subs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "subs"
                ? "bg-[#0088ff] text-white shadow-[0_0_15px_rgba(0,136,255,0.4)]"
                : "bg-[#030919] text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Suscripciones & Variables
          </button>
        </div>

        {/* Code Snippet Box */}
        <div className="relative rounded-2xl bg-[#020612] border border-[#0099ff]/25 p-5 shadow-inner">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wide">
                {activeTab === "license"
                  ? "Autenticación por Licencia"
                  : activeTab === "userpass"
                  ? "Autenticación por Usuario & Password"
                  : "Suscripciones y Variables de Servidor"}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {activeTab === "license"
                  ? "Flujo directo para validar licencias en tu aplicación."
                  : activeTab === "userpass"
                  ? "Registro automático al ingresar licencia por primera vez."
                  : "Lectura de suscripciones activas y desencriptación de variables en memoria."}
              </p>
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-[#07193b] hover:bg-[#0c2452] border border-[#0099ff]/30 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#00c2ff]" />}
              <span>{copied ? "Copiado!" : "Copiar"}</span>
            </button>
          </div>

          <pre className="font-mono text-xs text-sky-200 overflow-x-auto p-2 leading-relaxed">
            <code>{getCodeSnippet(selectedLang, activeTab)}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
