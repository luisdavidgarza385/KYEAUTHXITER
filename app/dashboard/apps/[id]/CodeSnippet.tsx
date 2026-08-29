"use client";
import { useState } from "react";
import Link from "next/link";
import { Copy, Check, Code, PlayCircle } from "lucide-react";

type Lang = "cpp" | "csharp" | "python" | "javascript" | "typescript" | "php" | "java" | "vbnet" | "rust" | "go" | "lua" | "ruby" | "perl";

const LANGS: { value: Lang; label: string }[] = [
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "php", label: "PHP" },
  { value: "java", label: "Java" },
  { value: "vbnet", label: "VB.Net" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "lua", label: "Lua" },
  { value: "ruby", label: "Ruby" },
  { value: "perl", label: "Perl" },
];

function snippet(
  lang: Lang,
  name: string,
  ownerid: string,
  version: string,
  url: string,
  secret: string
): string {
  const path = "";
  switch (lang) {
    case "cpp":
      return `#include <iostream>
#include <string>
#include "skCrypt.h"

std::string name = skCrypt("${name}").decrypt();
std::string ownerid = skCrypt("${ownerid}").decrypt();
std::string version = skCrypt("${version}").decrypt();
std::string url = skCrypt("${url}").decrypt();
std::string path = skCrypt("${path}").decrypt();
std::string secret = skCrypt("${secret}").decrypt();`;
    case "csharp":
      return `using System;

string name = "${name}";
string ownerid = "${ownerid}";
string version = "${version}";
string url = "${url}";
string path = "${path}";
string secret = "${secret}";`;
    case "python":
      return `name = "${name}"
ownerid = "${ownerid}"
version = "${version}"
url = "${url}"
path = "${path}"
secret = "${secret}"`;
    case "javascript":
      return `const name = "${name}";
const ownerid = "${ownerid}";
const version = "${version}";
const url = "${url}";
const path = "${path}";
const secret = "${secret}";`;
    case "typescript":
      return `const name: string = "${name}";
const ownerid: string = "${ownerid}";
const version: string = "${version}";
const url: string = "${url}";
const path: string = "${path}";
const secret: string = "${secret}";`;
    case "php":
      return `$name = "${name}";
$ownerid = "${ownerid}";
$version = "${version}";
$url = "${url}";
$path = "${path}";
$secret = "${secret}";`;
    case "java":
      return `String name = "${name}";
String ownerid = "${ownerid}";
String version = "${version}";
String url = "${url}";
String path = "${path}";
String secret = "${secret}";`;
    case "vbnet":
      return `Dim name = "${name}"
Dim ownerid = "${ownerid}"
Dim version = "${version}"
Dim url = "${url}"
Dim path = "${path}"
Dim secret = "${secret}"`;
    case "rust":
      return `let name = "${name}";
let ownerid = "${ownerid}";
let version = "${version}";
let url = "${url}";
let path = "${path}";
let secret = "${secret}";`;
    case "go":
      return `name := "${name}"
ownerid := "${ownerid}"
version := "${version}"
url := "${url}"
path := "${path}"
secret := "${secret}"`;
    case "lua":
      return `local name = "${name}"
local ownerid = "${ownerid}"
local version = "${version}"
local url = "${url}"
local path = "${path}"
local secret = "${secret}"`;
    case "ruby":
      return `name = "${name}"
ownerid = "${ownerid}"
version = "${version}"
url = "${url}"
path = "${path}"
secret = "${secret}"`;
    case "perl":
      return `my $name = "${name}";
my $ownerid = "${ownerid}";
my $version = "${version}";
my $url = "${url}";
my $path = "${path}";
my $secret = "${secret}";`;
  }
}

export function CodeSnippet({
  name,
  ownerid,
  version,
  url,
  secret,
}: {
  name: string;
  ownerid: string;
  version: string;
  url: string;
  secret: string;
}) {
  const [lang, setLang] = useState<Lang>("cpp");
  const [show, setShow] = useState(true);
  const [copied, setCopied] = useState(false);
  const code = snippet(lang, name, ownerid, version, url, secret);

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <div className="mb-3">
        <h2 className="text-base font-semibold text-text">Application Credentials</h2>
        <p className="text-xs text-text-muted mt-0.5">
          Simply replace the placeholder code in the example with these
        </p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setShow(!show)}
          className={"relative w-10 h-5 rounded-full transition " + (show ? "bg-accent" : "bg-bg-hover border border-border")}
          aria-label="Toggle code snippet"
        >
          <span
            className={
              "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all " +
              (show ? "left-[22px]" : "left-0.5")
            }
          />
        </button>
        <span className="text-sm text-text-muted">Display Code Snippet</span>
      </div>

      {show && (
        <>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm text-text">Select Language:</span>
            <select
              className="input text-sm py-1.5 px-3 max-w-[180px]"
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
            >
              {LANGS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-border bg-[#0e0e14] overflow-hidden">
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <pre className="p-4 text-[13px] font-mono leading-relaxed whitespace-pre">
                {code.split("\n").map((line, i) => (
                  <div key={i} className="text-text-muted">
                    {renderLine(line)}
                  </div>
                ))}
              </pre>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 border-t border-border bg-bg-secondary/40 text-xs text-text-dim">
              <span>scroll →</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={copy}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 text-sm font-medium transition"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy Code"}
            </button>
            <Link
              href={`/docs?lang=${lang}&app=${ownerid}`}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 text-sm font-medium transition"
            >
              <Code className="w-4 h-4" />
              View Example
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-md bg-bg-card hover:bg-bg-hover text-white px-4 py-2.5 text-sm font-medium border border-border transition"
            >
              <PlayCircle className="w-4 h-4" />
              View Tutorial
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function renderLine(line: string) {
  const parts: { text: string; color: string }[] = [];
  const regex = /(skCrypt\("[^"]*"\)|"[^"]*"|#\w+|\b(?:std::|string|let|const|var|String|Dim|local|my|to_string|decrypt|include|using)\b)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(line)) !== null) {
    if (m.index > last) parts.push({ text: line.slice(last, m.index), color: "#9ca3af" });
    const tok = m[0];
    if (tok.startsWith("skCrypt(") || tok.startsWith('"') || tok.startsWith('\\"')) {
      parts.push({ text: tok, color: "#e0a868" });
    } else if (tok.startsWith("#")) {
      parts.push({ text: tok, color: "#7c8eb5" });
    } else {
      parts.push({ text: tok, color: "#c084fc" });
    }
    last = m.index + tok.length;
  }
  if (last < line.length) parts.push({ text: line.slice(last), color: "#9ca3af" });
  return parts.map((p, i) => (
    <span key={i} style={{ color: p.color }}>
      {p.text}
    </span>
  ));
}
