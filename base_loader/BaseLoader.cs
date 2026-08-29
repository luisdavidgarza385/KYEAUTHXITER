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
        private static byte[] RAW_PROJECT_NAME_BYTES = new byte[] {
            95,95,80,82,79,74,69,67,84,95,78,65,77,69,95,95,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120
        };
        private static byte[] RAW_TARGET_PROCESS_BYTES = new byte[] {
            95,95,84,65,82,71,69,84,95,80,82,79,67,69,83,83,95,95,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120
        };
        private static byte[] RAW_API_URL_BYTES = new byte[] {
            95,95,65,80,73,95,85,82,76,95,95,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120
        };
        private static byte[] RAW_COLOR_BYTES = new byte[] {
            95,95,67,79,76,79,82,95,95,120,120,120,120,120,120,120
        };
        private static byte[] RAW_KA_NAME_BYTES = new byte[] {
            95,95,75,65,95,78,65,77,69,95,95,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120
        };
        private static byte[] RAW_KA_OWNER_BYTES = new byte[] {
            95,95,75,65,95,79,87,78,69,82,95,95,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120
        };
        private static byte[] RAW_KA_VER_BYTES = new byte[] {
            95,95,75,65,95,86,69,82,95,95,120,120,120,120,120,120
        };
        private static byte[] RAW_KA_SECRET_BYTES = new byte[] {
            95,95,75,65,95,83,69,67,82,69,84,95,95,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120
        };

        // ── WIN32 API ──
        [DllImport("kernel32.dll", SetLastError = true)]
        static extern IntPtr OpenProcess(uint dwAccess, bool inherit, int pid);
        [DllImport("kernel32.dll", SetLastError = true)]
        static extern IntPtr VirtualAllocEx(IntPtr hProc, IntPtr addr, uint size, uint allocType, uint protect);
        [DllImport("kernel32.dll", SetLastError = true)]
        static extern bool WriteProcessMemory(IntPtr hProc, IntPtr addr, byte[] buf, uint size, out UIntPtr written);
        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Ansi)]
        static extern IntPtr GetProcAddress(IntPtr hMod, string proc);
        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        static extern IntPtr GetModuleHandle(string name);
        [DllImport("kernel32.dll", SetLastError = true)]
        static extern IntPtr CreateRemoteThread(IntPtr hProc, IntPtr attr, uint stackSize, IntPtr start, IntPtr param, uint flags, out IntPtr threadId);
        [DllImport("kernel32.dll")] static extern UInt32 WaitForSingleObject(IntPtr h, UInt32 ms);
        [DllImport("kernel32.dll")] static extern bool VirtualFreeEx(IntPtr hProc, IntPtr addr, uint size, uint type);
        [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr h);

        const uint PROCESS_ALL_ACCESS = 0x1F0FFF;
        const uint MEM_COMMIT_RESERVE = 0x3000;
        const uint PAGE_READWRITE = 0x04;
        const int  OBFC_KEY = 13;

        static string ReadMarker(byte[] raw)
        {
            string s = Encoding.ASCII.GetString(raw);
            int n = s.IndexOf('\0'); if (n >= 0) s = s.Substring(0, n);
            return s.Trim();
        }

        static string UnshiftUrl(byte[] raw)
        {
            string s = ReadMarker(raw);
            if (s.StartsWith("http")) return s;
            var sb = new StringBuilder();
            foreach (char c in s) sb.Append((char)(c - OBFC_KEY));
            string u = sb.ToString();
            int n = u.IndexOf('\0'); if (n >= 0) u = u.Substring(0, n);
            return u.Trim();
        }

        class DllItem { public string Name, Filename, Url; }

        static void Main(string[] args)
        {
            // Keep markers alive in binary
            if (RAW_COLOR_BYTES.Length < 0 || RAW_KA_NAME_BYTES.Length < 0 ||
                RAW_KA_OWNER_BYTES.Length < 0 || RAW_KA_VER_BYTES.Length < 0 ||
                RAW_KA_SECRET_BYTES.Length < 0) { }

            // ── SMALL FIXED WINDOW (no scrollbar) ──
            try
            {
                Console.CursorVisible = false;
                // Set buffer first, then window
                Console.SetBufferSize(45, 14);
                Console.SetWindowSize(45, 14);
            }
            catch { }

            string projectName = ReadMarker(RAW_PROJECT_NAME_BYTES);
            if (string.IsNullOrEmpty(projectName) || projectName.StartsWith("__PROJECT_NAME__"))
                projectName = "LOADER";

            string targetProcess = ReadMarker(RAW_TARGET_PROCESS_BYTES);
            if (string.IsNullOrEmpty(targetProcess) || targetProcess.StartsWith("__TARGET_PROCESS__"))
                targetProcess = "HD-Player.exe";

            string apiUrl = UnshiftUrl(RAW_API_URL_BYTES);

            try { Console.Title = projectName; } catch { }

            // ── FETCH DLL LIST FROM API ──
            var dllList = new List<DllItem>();
            if (!string.IsNullOrEmpty(apiUrl) && apiUrl.StartsWith("http") && !apiUrl.Contains("localhost"))
            {
                try
                {
                    ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072;
                    using (var wc = new WebClient())
                    {
                        wc.Headers["User-Agent"] = "Loader/2.0";
                        string json = wc.DownloadString(apiUrl);
                        dllList = ParseDlls(json);
                    }
                }
                catch { }
            }

            if (dllList.Count == 0)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("No se pudo conectar al servidor.");
                Console.ResetColor();
                Thread.Sleep(3000);
                return;
            }

            // ── SELECTION MENU (only when >1 DLL) ──
            DllItem selected = null;

            if (dllList.Count == 1)
            {
                selected = dllList[0];
                try { Console.Title = selected.Name; } catch { }
            }
            else
            {
                Console.Clear();
                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine("Welcome to " + projectName);
                Console.WriteLine();

                for (int i = 0; i < dllList.Count; i++)
                {
                    Console.ForegroundColor = ConsoleColor.White;
                    Console.Write("[");
                    Console.ForegroundColor = ConsoleColor.Cyan;
                    Console.Write(i + 1);
                    Console.ForegroundColor = ConsoleColor.White;
                    Console.WriteLine("] " + dllList[i].Name);
                }

                Console.WriteLine();
                Console.Write("Select: ");

                while (selected == null)
                {
                    var key = Console.ReadKey(true); // intercept=true, no echo
                    if (char.IsDigit(key.KeyChar))
                    {
                        int choice = (int)char.GetNumericValue(key.KeyChar);
                        if (choice >= 1 && choice <= dllList.Count)
                        {
                            selected = dllList[choice - 1];
                            break;
                        }
                    }
                    // ignore invalid keys silently
                }

                Console.Clear();
                try { Console.Title = selected.Name; } catch { }
            }

            // ── INJECTION UI ──
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("Welcome to " + selected.Name);
            Console.WriteLine();
            Thread.Sleep(400);

            // Download DLL
            string dllPath = null;
            Step("Checking Updates");
            Thread.Sleep(400);

            if (!string.IsNullOrEmpty(selected.Url))
            {
                try
                {
                    string url = selected.Url;
                    string fname = Path.GetFileName(selected.Filename ?? selected.Name + ".dll");
                    if (string.IsNullOrEmpty(fname)) fname = Guid.NewGuid().ToString("N") + ".dll";
                    string path = Path.Combine(Path.GetTempPath(), fname);
                    using (var wc = new WebClient())
                    {
                        ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072;
                        wc.Headers["User-Agent"] = "Loader/2.0";
                        wc.DownloadFile(url, path);
                    }
                    if (File.Exists(path) && new FileInfo(path).Length > 0)
                        dllPath = path;
                }
                catch { }
            }

            if (string.IsNullOrEmpty(dllPath))
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("Error: DLL no descargada.");
                Console.ResetColor();
                Thread.Sleep(3000);
                return;
            }

            Step("Checking Process Detected");
            Thread.Sleep(400);
            Step("Checking Process Emulator");
            Thread.Sleep(400);

            // Find target process
            string procName = targetProcess.Replace(".exe", "").Replace(".EXE", "");
            Process proc = FindProcess(procName);

            if (proc == null)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("Proceso no encontrado: " + targetProcess);
                Console.ResetColor();
                Thread.Sleep(3000);
                return;
            }

            Step("Injection Process");
            Thread.Sleep(400);

            bool injected = InjectDll(proc.Id, dllPath);

            if (!injected)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("+] Error de inyeccion.");
                Console.ResetColor();
                Thread.Sleep(3000);
                return;
            }

            // ── SUCCESS ──
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("+] Success !");
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("+] Modulos listos.");
            Console.ResetColor();

            Thread.Sleep(3000);
        }

        static void Step(string text)
        {
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("+] " + text);
        }

        static Process FindProcess(string name)
        {
            string[] names = { name, "HD-Player", "BlueStacks", "Bluestacks", "dnplayer", "LdVBoxHeadless", "MEmu" };
            foreach (string n in names)
            {
                Process[] list = Process.GetProcessesByName(n);
                if (list != null && list.Length > 0) return list[0];
            }
            return null;
        }

        static List<DllItem> ParseDlls(string json)
        {
            var list = new List<DllItem>();
            if (string.IsNullOrEmpty(json)) return list;
            try
            {
                foreach (Match m in Regex.Matches(json, @"\{[^{}]*\}"))
                {
                    string obj = m.Value;
                    string url = JsonVal(obj, "url");
                    if (string.IsNullOrEmpty(url)) continue;
                    list.Add(new DllItem
                    {
                        Name     = JsonVal(obj, "name"),
                        Filename = JsonVal(obj, "filename"),
                        Url      = url.Replace("\\/", "/")
                    });
                }
            }
            catch { }
            return list;
        }

        static string JsonVal(string obj, string key)
        {
            var m = Regex.Match(obj, "\"" + key + "\"\\s*:\\s*\"([^\"]+)\"");
            return m.Success ? m.Groups[1].Value : "";
        }

        static bool InjectDll(int pid, string dllPath)
        {
            IntPtr hProc = IntPtr.Zero, mem = IntPtr.Zero, thread = IntPtr.Zero;
            try
            {
                hProc = OpenProcess(PROCESS_ALL_ACCESS, false, pid);
                if (hProc == IntPtr.Zero) return false;

                byte[] bytes = Encoding.ASCII.GetBytes(dllPath + "\0");
                mem = VirtualAllocEx(hProc, IntPtr.Zero, (uint)bytes.Length, MEM_COMMIT_RESERVE, PAGE_READWRITE);
                if (mem == IntPtr.Zero) return false;

                UIntPtr written;
                if (!WriteProcessMemory(hProc, mem, bytes, (uint)bytes.Length, out written)) return false;

                IntPtr k32   = GetModuleHandle("kernel32.dll");
                IntPtr loadA = GetProcAddress(k32, "LoadLibraryA");
                if (loadA == IntPtr.Zero) return false;

                IntPtr tid;
                thread = CreateRemoteThread(hProc, IntPtr.Zero, 0, loadA, mem, 0, out tid);
                if (thread == IntPtr.Zero) return false;

                WaitForSingleObject(thread, 6000);
                return true;
            }
            catch { return false; }
            finally
            {
                if (mem    != IntPtr.Zero && hProc != IntPtr.Zero) VirtualFreeEx(hProc, mem, 0, 0x8000);
                if (thread != IntPtr.Zero) CloseHandle(thread);
                if (hProc  != IntPtr.Zero) CloseHandle(hProc);
            }
        }
    }
}
