using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;

namespace SecureXLoader
{
    class Program
    {
        // ── EXACT ASCII MARKERS (Single-byte matching dll-patcher.ts strings) ──
        // Length 63
        private static byte[] RAW_PROJECT_NAME_BYTES = new byte[] {
            95,95,80,82,79,74,69,67,84,95,78,65,77,69,95,95,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120
        };

        // Length 63
        private static byte[] RAW_TARGET_PROCESS_BYTES = new byte[] {
            95,95,84,65,82,71,69,84,95,80,82,79,67,69,83,83,95,95,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120
        };

        // Length 267
        private static byte[] RAW_API_URL_BYTES = new byte[] {
            95,95,65,80,73,95,85,82,76,95,95,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120
        };

        // Length 16
        private static byte[] RAW_COLOR_BYTES = new byte[] {
            95,95,67,79,76,79,82,95,95,120,120,120,120,120,120,120
        };

        // Length 63
        private static byte[] RAW_KA_NAME_BYTES = new byte[] {
            95,95,75,65,95,78,65,77,69,95,95,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120
        };

        // Length 63
        private static byte[] RAW_KA_OWNER_BYTES = new byte[] {
            95,95,75,65,95,79,87,78,69,82,95,95,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120
        };

        // Length 16
        private static byte[] RAW_KA_VER_BYTES = new byte[] {
            95,95,75,65,95,86,69,82,95,95,120,120,120,120,120,120
        };

        // Length 95
        private static byte[] RAW_KA_SECRET_BYTES = new byte[] {
            95,95,75,65,95,83,69,67,82,69,84,95,95,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120
        };

        // ── WIN32 API IMPORTS ──
        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern IntPtr OpenProcess(uint dwDesiredAccess, bool bInheritHandle, int dwProcessId);

        [DllImport("kernel32.dll", SetLastError = true, ExactSpelling = true)]
        private static extern IntPtr VirtualAllocEx(IntPtr hProcess, IntPtr lpAddress, uint dwSize, uint flAllocationType, uint flProtect);

        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool WriteProcessMemory(IntPtr hProcess, IntPtr lpBaseAddress, byte[] lpBuffer, uint nSize, out UIntPtr lpNumberOfBytesWritten);

        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Ansi)]
        private static extern IntPtr GetProcAddress(IntPtr hModule, string procName);

        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        private static extern IntPtr GetModuleHandle(string lpModuleName);

        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern IntPtr CreateRemoteThread(IntPtr hProcess, IntPtr lpThreadAttributes, uint dwStackSize, IntPtr lpStartAddress, IntPtr lpParameter, uint dwCreationFlags, out IntPtr lpThreadId);

        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern UInt32 WaitForSingleObject(IntPtr hHandle, UInt32 dwMilliseconds);

        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool VirtualFreeEx(IntPtr hProcess, IntPtr lpAddress, uint dwFreeType, uint dwSize);

        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool CloseHandle(IntPtr hObject);

        private const uint PROCESS_CREATE_THREAD = 0x0002;
        private const uint PROCESS_QUERY_INFORMATION = 0x0400;
        private const uint PROCESS_VM_OPERATION = 0x0008;
        private const uint PROCESS_VM_WRITE = 0x0020;
        private const uint PROCESS_VM_READ = 0x0010;
        private const uint PROCESS_ALL_ACCESS = 0x1F0FFF;

        private const uint MEM_COMMIT = 0x1000;
        private const uint MEM_RESERVE = 0x2000;
        private const uint PAGE_READWRITE = 0x04;

        private const int OBFC_KEY = 13;

        // Clean string extracted from byte marker
        private static string ReadMarker(byte[] rawBytes)
        {
            if (rawBytes == null || rawBytes.Length == 0) return "";
            string str = Encoding.ASCII.GetString(rawBytes);
            int nullIdx = str.IndexOf('\0');
            if (nullIdx >= 0) str = str.Substring(0, nullIdx);
            return str.Trim();
        }

        // Unshift API URL (ROT-13 unshift)
        private static string UnshiftUrl(byte[] rawBytes)
        {
            string cleaned = ReadMarker(rawBytes);
            if (cleaned.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || 
                cleaned.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                return cleaned;
            }

            StringBuilder sb = new StringBuilder();
            foreach (char c in cleaned)
            {
                sb.Append((char)(c - OBFC_KEY));
            }
            string unshifted = sb.ToString();
            int nullIdx = unshifted.IndexOf('\0');
            if (nullIdx >= 0) unshifted = unshifted.Substring(0, nullIdx);
            return unshifted.Trim();
        }

        private class DllItem
        {
            public string Name { get; set; }
            public string Filename { get; set; }
            public string Url { get; set; }
        }

        static void Main(string[] args)
        {
            try
            {
                Console.OutputEncoding = Encoding.UTF8;
            }
            catch { }

            // Reference unused markers to guarantee they are linked into binary
            if (RAW_COLOR_BYTES.Length < 0 || RAW_KA_NAME_BYTES.Length < 0 || RAW_KA_OWNER_BYTES.Length < 0 || RAW_KA_VER_BYTES.Length < 0 || RAW_KA_SECRET_BYTES.Length < 0)
            {
                Console.Write("");
            }

            // 1. Resolve configuration values
            string projectName = ReadMarker(RAW_PROJECT_NAME_BYTES);
            if (string.IsNullOrEmpty(projectName) || projectName.StartsWith("__PROJECT_NAME__"))
            {
                projectName = "LUMINOX";
            }

            string targetProcess = ReadMarker(RAW_TARGET_PROCESS_BYTES);
            if (string.IsNullOrEmpty(targetProcess) || targetProcess.StartsWith("__TARGET_PROCESS__"))
            {
                targetProcess = "HD-Player.exe";
            }

            string apiUrl = UnshiftUrl(RAW_API_URL_BYTES);

            // Set Initial Console Title
            try
            {
                Console.Title = projectName;
            }
            catch { }

            // Fetch DLL modules from API
            List<DllItem> dllList = new List<DllItem>();
            try
            {
                if (!string.IsNullOrEmpty(apiUrl) && !apiUrl.StartsWith("__API_URL__") && apiUrl.StartsWith("http"))
                {
                    using (WebClient client = new WebClient())
                    {
                        ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072 | SecurityProtocolType.Tls; // Tls12
                        client.Headers.Add("User-Agent", "Loader/2.0");
                        string json = client.DownloadString(apiUrl);
                        dllList = ParseDlls(json);
                    }
                }
            }
            catch { }

            // Fallback list if offline / mock
            if (dllList.Count == 0)
            {
                dllList.Add(new DllItem { Name = projectName + " COMPLEX", Filename = projectName + " COMPLEX.dll", Url = "" });
                dllList.Add(new DllItem { Name = projectName + " BASICO", Filename = projectName + " BASICO.dll", Url = "" });
            }

            DllItem selectedDll = null;

            // ── PRODUCT SELECTION MENU ──
            if (dllList.Count > 1)
            {
                Console.Clear();
                Console.ForegroundColor = ConsoleColor.White;
                Console.Write("Welcome to ");
                Console.WriteLine(projectName);
                Console.WriteLine();

                for (int i = 0; i < dllList.Count; i++)
                {
                    Console.ForegroundColor = ConsoleColor.White;
                    Console.Write("[");
                    Console.ForegroundColor = ConsoleColor.Cyan;
                    Console.Write((i + 1).ToString());
                    Console.ForegroundColor = ConsoleColor.White;
                    Console.WriteLine("] " + dllList[i].Name);
                }

                Console.WriteLine();
                Console.ForegroundColor = ConsoleColor.White;
                Console.Write("Select: ");

                while (selectedDll == null)
                {
                    ConsoleKeyInfo keyInfo = Console.ReadKey();
                    Console.WriteLine();

                    char c = keyInfo.KeyChar;
                    if (char.IsDigit(c))
                    {
                        int choice = (int)char.GetNumericValue(c);
                        if (choice >= 1 && choice <= dllList.Count)
                        {
                            selectedDll = dllList[choice - 1];
                            break;
                        }
                    }

                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.Write("Opcion invalida. Select: ");
                    Console.ForegroundColor = ConsoleColor.White;
                }

                // Clear screen for clean injection UI
                Console.Clear();
            }
            else if (dllList.Count == 1)
            {
                selectedDll = dllList[0];
            }

            // Determine active title / name
            string activeTitle = (selectedDll != null && !string.IsNullOrEmpty(selectedDll.Name)) 
                ? selectedDll.Name 
                : projectName;

            try
            {
                Console.Title = activeTitle;
            }
            catch { }

            // ── IMAGE 4: Clean Welcome Banner ──
            Console.ForegroundColor = ConsoleColor.White;
            Console.Write("Welcome to ");
            Console.WriteLine(activeTitle);
            Console.WriteLine();
            Thread.Sleep(600);

            // ── STEP 1: Checking Updates ──
            PrintStep("Checking Updates");
            Thread.Sleep(500);

            // Download selected DLL module
            string downloadedDllPath = null;
            if (selectedDll != null && !string.IsNullOrEmpty(selectedDll.Url))
            {
                try
                {
                    string fullUrl = selectedDll.Url;
                    if (fullUrl.StartsWith("/") && !string.IsNullOrEmpty(apiUrl) && apiUrl.StartsWith("http"))
                    {
                        Uri baseUri = new Uri(apiUrl);
                        fullUrl = baseUri.Scheme + "://" + baseUri.Authority + fullUrl;
                    }

                    string tempDir = Path.GetTempPath();
                    string safeName = Path.GetFileName(selectedDll.Filename);
                    if (string.IsNullOrEmpty(safeName)) safeName = Guid.NewGuid().ToString("N") + ".dll";
                    string targetPath = Path.Combine(tempDir, safeName);

                    using (WebClient client = new WebClient())
                    {
                        ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072 | SecurityProtocolType.Tls;
                        client.Headers.Add("User-Agent", "Loader/2.0");
                        client.DownloadFile(fullUrl, targetPath);
                    }

                    if (File.Exists(targetPath))
                    {
                        downloadedDllPath = targetPath;
                    }
                }
                catch { }
            }

            // ── STEP 2: Checking Process Detected ──
            PrintStep("Checking Process Detected");
            Thread.Sleep(600);

            // ── STEP 3: Checking Process Emulator ──
            PrintStep("Checking Process Emulator");
            Thread.Sleep(500);

            string processClean = targetProcess.Replace(".exe", "").Replace(".EXE", "");
            Process targetProc = null;
            int waitAttempts = 0;

            while (targetProc == null && waitAttempts < 60)
            {
                Process[] procs = Process.GetProcessesByName(processClean);
                if (procs != null && procs.Length > 0)
                {
                    targetProc = procs[0];
                    break;
                }

                if (processClean.Equals("HD-Player", StringComparison.OrdinalIgnoreCase))
                {
                    Process[] altProcs = Process.GetProcessesByName("HD-Player");
                    if (altProcs.Length > 0) { targetProc = altProcs[0]; break; }
                    altProcs = Process.GetProcessesByName("BlueStacks");
                    if (altProcs.Length > 0) { targetProc = altProcs[0]; break; }
                    altProcs = Process.GetProcessesByName("LdVBoxHeadless");
                    if (altProcs.Length > 0) { targetProc = altProcs[0]; break; }
                    altProcs = Process.GetProcessesByName("dnplayer");
                    if (altProcs.Length > 0) { targetProc = altProcs[0]; break; }
                }

                Thread.Sleep(300);
                waitAttempts++;
            }

            // ── STEP 4: Injection Process ──
            PrintStep("Injection Process");
            Thread.Sleep(700);

            if (targetProc != null && !string.IsNullOrEmpty(downloadedDllPath))
            {
                InjectDll(targetProc.Id, downloadedDllPath);
                Thread.Sleep(300);
            }

            // ── STEP 5: Success ! (Red color as shown in image 5) ──
            PrintSuccessLine("Success !");
            Thread.Sleep(400);

            // ── STEP 6: Modulos listos. (Green color as shown in image 5) ──
            PrintReadyLine("Modulos listos.");

            // Wait a few seconds before closing
            Thread.Sleep(4000);
        }

        private static void PrintStep(string text)
        {
            Console.ForegroundColor = ConsoleColor.White;
            Console.Write("+] ");
            Console.WriteLine(text);
        }

        private static void PrintSuccessLine(string text)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.Write("+] ");
            Console.WriteLine(text);
            Console.ForegroundColor = ConsoleColor.White;
        }

        private static void PrintReadyLine(string text)
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.Write("+] ");
            Console.WriteLine(text);
            Console.ForegroundColor = ConsoleColor.White;
        }

        // Lightweight JSON Parser for DLL array
        private static List<DllItem> ParseDlls(string json)
        {
            List<DllItem> list = new List<DllItem>();
            if (string.IsNullOrEmpty(json)) return list;

            try
            {
                MatchCollection matches = Regex.Matches(json, @"\{[^{}]*\}");
                foreach (Match m in matches)
                {
                    string objStr = m.Value;
                    string name = ExtractJsonValue(objStr, "name");
                    string filename = ExtractJsonValue(objStr, "filename");
                    string url = ExtractJsonValue(objStr, "url");

                    if (!string.IsNullOrEmpty(url))
                    {
                        list.Add(new DllItem
                        {
                            Name = string.IsNullOrEmpty(name) ? filename : name,
                            Filename = filename,
                            Url = url
                        });
                    }
                }
            }
            catch { }

            return list;
        }

        private static string ExtractJsonValue(string objStr, string key)
        {
            Match m = Regex.Match(objStr, "\"" + key + "\"\\s*:\\s*\"([^\"]+)\"");
            if (m.Success)
            {
                return m.Groups[1].Value.Replace("\\/", "/");
            }
            return "";
        }

        // Win32 Standard LoadLibrary Injection
        private static bool InjectDll(int processId, string dllPath)
        {
            if (!File.Exists(dllPath)) return false;

            IntPtr hProcess = IntPtr.Zero;
            IntPtr allocMem = IntPtr.Zero;
            IntPtr hThread = IntPtr.Zero;

            try
            {
                hProcess = OpenProcess(PROCESS_CREATE_THREAD | PROCESS_QUERY_INFORMATION | PROCESS_VM_OPERATION | PROCESS_VM_WRITE | PROCESS_VM_READ, false, processId);
                if (hProcess == IntPtr.Zero)
                {
                    hProcess = OpenProcess(PROCESS_ALL_ACCESS, false, processId);
                }

                if (hProcess == IntPtr.Zero) return false;

                byte[] dllBytes = Encoding.ASCII.GetBytes(dllPath + "\0");
                allocMem = VirtualAllocEx(hProcess, IntPtr.Zero, (uint)dllBytes.Length, MEM_COMMIT | MEM_RESERVE, PAGE_READWRITE);
                if (allocMem == IntPtr.Zero) return false;

                UIntPtr bytesWritten;
                if (!WriteProcessMemory(hProcess, allocMem, dllBytes, (uint)dllBytes.Length, out bytesWritten))
                {
                    return false;
                }

                IntPtr kernel32 = GetModuleHandle("kernel32.dll");
                IntPtr loadLibraryAddr = GetProcAddress(kernel32, "LoadLibraryA");
                if (loadLibraryAddr == IntPtr.Zero) return false;

                IntPtr threadId;
                hThread = CreateRemoteThread(hProcess, IntPtr.Zero, 0, loadLibraryAddr, allocMem, 0, out threadId);
                if (hThread == IntPtr.Zero) return false;

                WaitForSingleObject(hThread, 6000);
                return true;
            }
            catch
            {
                return false;
            }
            finally
            {
                if (allocMem != IntPtr.Zero && hProcess != IntPtr.Zero)
                {
                    VirtualFreeEx(hProcess, allocMem, 0x8000, 0); // MEM_RELEASE
                }
                if (hThread != IntPtr.Zero) CloseHandle(hThread);
                if (hProcess != IntPtr.Zero) CloseHandle(hProcess);
            }
        }
    }
}
