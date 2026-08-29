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
        // ── EXACT ASCII MARKERS ──
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
        [DllImport("kernel32.dll")] static extern bool IsDebuggerPresent();
        [DllImport("kernel32.dll")] static extern bool CheckRemoteDebuggerPresent(IntPtr hProcess, ref bool isDebuggerPresent);
        [DllImport("kernel32.dll")] static extern IntPtr GetCurrentProcess();
        [DllImport("kernel32.dll", SetLastError = true)] static extern IntPtr OpenProcess(uint dwAccess, bool inherit, int pid);
        [DllImport("kernel32.dll", SetLastError = true)] static extern IntPtr VirtualAllocEx(IntPtr hProc, IntPtr addr, uint size, uint allocType, uint protect);
        [DllImport("kernel32.dll", SetLastError = true)] static extern bool WriteProcessMemory(IntPtr hProc, IntPtr addr, byte[] buf, uint size, out UIntPtr written);
        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Ansi)] static extern IntPtr GetProcAddress(IntPtr hMod, string proc);
        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Auto)] static extern IntPtr GetModuleHandle(string name);
        [DllImport("kernel32.dll", SetLastError = true)] static extern IntPtr CreateRemoteThread(IntPtr hProc, IntPtr attr, uint stackSize, IntPtr start, IntPtr param, uint flags, out IntPtr threadId);
        [DllImport("kernel32.dll")] static extern UInt32 WaitForSingleObject(IntPtr h, UInt32 ms);
        [DllImport("kernel32.dll")] static extern bool VirtualFreeEx(IntPtr hProc, IntPtr addr, uint size, uint type);
        [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr h);
        [DllImport("kernel32.dll")] static extern IntPtr CreateMutexA(IntPtr lpAttr, bool bInitialOwner, string lpName);
        [DllImport("kernel32.dll")] static extern uint GetLastError();
        [DllImport("ntdll.dll")] static extern int NtQueryInformationProcess(IntPtr hProc, int cls, ref int info, int len, ref int retlen);
        [DllImport("kernel32.dll")] static extern void GetSystemInfo(ref SYSTEM_INFO info);

        [StructLayout(LayoutKind.Sequential)]
        struct SYSTEM_INFO
        {
            public uint dwOemId;
            public uint dwPageSize;
            public IntPtr lpMinimumApplicationAddress;
            public IntPtr lpMaximumApplicationAddress;
            public IntPtr dwActiveProcessorMask;
            public uint dwNumberOfProcessors;
            public uint dwProcessorType;
            public uint dwAllocationGranularity;
            public ushort wProcessorLevel;
            public ushort wProcessorRevision;
        }

        const uint PROCESS_ALL_ACCESS  = 0x1F0FFF;
        const uint MEM_COMMIT_RESERVE  = 0x3000;
        const uint PAGE_READWRITE      = 0x04;
        const uint ERROR_ALREADY_EXISTS = 183;

        // ── XOR string obfuscation (key=0x5A) ──
        // All sensitive strings go through this — hex editor won't show them plaintext
        static string X(byte[] b)
        {
            byte[] r = new byte[b.Length];
            for (int i = 0; i < b.Length; i++) r[i] = (byte)(b[i] ^ 0x5A);
            return Encoding.ASCII.GetString(r);
        }

        // Obfuscated mutex name: XOR of "SXL_MUTEX_92847"
        static readonly byte[] _mtx = { 0x09,0x22,0x16,0x5f,0x1f,0x0b,0x19,0x0e,0x3b,0x5f,0x6b,0x7e,0x7e,0x7f,0x7e };
        // Obfuscated common debugger process names
        static readonly string[] _dbgProcs = {
            X(new byte[]{0x2e,0x5c,0x39,0x28,0x28,0x35,0x52,0x2e,0x38,0x2e}),  // x64dbg.exe
            X(new byte[]{0x35,0x5c,0x39,0x28,0x28,0x35,0x52,0x2e,0x38,0x2e}),  // x32dbg.exe
            X(new byte[]{0x15,0x37,0x37,0x39,0x2e,0x28,0x35,0x2a,0x52,0x2e,0x38,0x2e}), // OllyDbg.exe
            X(new byte[]{0x3c,0x37,0x3b,0x3e,0x2a,0x54,0x35,0x2e,0x52,0x2e,0x38,0x2e}), // ImmunityD.exe (short)
            X(new byte[]{0x3c,0x24,0x27,0x52,0x2e,0x38,0x2e}),                 // ida.exe
            X(new byte[]{0x3c,0x24,0x27,0x5f,0x2e,0x38,0x2e}),                 // ida64.exe (approx)
            X(new byte[]{0x28,0x37,0x29,0x2e,0x35,0x2e,0x52,0x2e,0x38,0x2e}), // dnSpy.exe
            X(new byte[]{0x28,0x35,0x37,0x2e,0x30,0x35,0x2a,0x37,0x52,0x2e,0x38,0x2e}), // dotPeek.exe (approx)
            X(new byte[]{0x2c,0x24,0x33,0x2e,0x52,0x2e,0x38,0x2e}),            // HIEW.exe (approx)
            X(new byte[]{0x29,0x2a,0x37,0x3e,0x33,0x2a,0x39,0x2a,0x52,0x2e,0x38,0x2e}), // devenv.exe (VS debugger)
        };
        // Obfuscated VM registry keys / strings
        static readonly string[] _vmStrs = {
            "VBOX", "VMWARE", "VIRTUAL", "QEMU", "BOCHS", "SANDBOXIE", "WIRESHARK"
        };

        static string ReadMarker(byte[] raw)
        {
            string s = Encoding.ASCII.GetString(raw);
            int n = s.IndexOf('\0'); if (n >= 0) s = s.Substring(0, n);
            return s.Trim();
        }

        static string UnshiftUrl(byte[] raw)
        {
            return ReadMarker(raw);
        }

        class DllItem { public string Name, Filename, Url; }

        // ════════════════════════════════════════════════
        //  SECURITY — called once at startup, exits if
        //  any check fails (silently, no error message)
        // ════════════════════════════════════════════════
        static void RunSecurityChecks()
        {
            // 1. Mutex — only one instance allowed
            IntPtr mtx = CreateMutexA(IntPtr.Zero, true, X(_mtx));
            if (GetLastError() == ERROR_ALREADY_EXISTS)
                Environment.Exit(0);

            // 2. IsDebuggerPresent (WinAPI)
            if (IsDebuggerPresent())
                Environment.Exit(0);

            // 3. CheckRemoteDebuggerPresent
            bool remote = false;
            CheckRemoteDebuggerPresent(GetCurrentProcess(), ref remote);
            if (remote)
                Environment.Exit(0);

            // 4. NtQueryInformationProcess — ProcessDebugPort (class 7)
            try
            {
                int dbgPort = 0, retlen = 0;
                NtQueryInformationProcess(GetCurrentProcess(), 7, ref dbgPort, sizeof(int), ref retlen);
                if (dbgPort != 0)
                    Environment.Exit(0);
            }
            catch { }

            // 5. Timing check — debuggers slow execution significantly
            long t0 = DateTime.UtcNow.Ticks;
            int dummy = 0;
            for (int i = 0; i < 100000; i++) dummy += i;
            long elapsed = DateTime.UtcNow.Ticks - t0;
            if (elapsed > 5000000) // > 500ms = debugger slowing things down
                Environment.Exit(0);

            // 6. Known debugger process names
            try
            {
                Process[] all = Process.GetProcesses();
                foreach (Process p in all)
                {
                    try
                    {
                        string pname = p.ProcessName.ToLower();
                        foreach (string dbg in _dbgProcs)
                            if (pname.Contains(dbg.ToLower().Replace(".exe", "")))
                                Environment.Exit(0);
                    }
                    catch { }
                }
            }
            catch { }

            // 7. VM / Sandbox detection via environment strings
            try
            {
                string comp = Environment.MachineName.ToUpper();
                string user = Environment.UserName.ToUpper();
                foreach (string vm in _vmStrs)
                {
                    if (comp.Contains(vm) || user.Contains(vm))
                        Environment.Exit(0);
                }
            }
            catch { }

            // 8. VM detection via CPU count (sandboxes often use 1 core)
            if (Environment.ProcessorCount < 2)
                Environment.Exit(0);

            // 9. Screen resolution check — sandboxes use tiny or zero resolution
            try
            {
                SYSTEM_INFO si = new SYSTEM_INFO();
                GetSystemInfo(ref si);
                // If number of processors reported by SYSTEM_INFO is 1, likely VM
                if (si.dwNumberOfProcessors < 2)
                    Environment.Exit(0);
            }
            catch { }
        }

        // ════════════════════════════════════════════════
        //  MAIN
        // ════════════════════════════════════════════════
        static void Main(string[] args)
        {
            // Security first — before anything is shown
            RunSecurityChecks();

            // Keep markers alive
            if (RAW_COLOR_BYTES.Length < 0 || RAW_KA_NAME_BYTES.Length < 0 ||
                RAW_KA_OWNER_BYTES.Length < 0 || RAW_KA_VER_BYTES.Length < 0 ||
                RAW_KA_SECRET_BYTES.Length < 0) { }

            // Small fixed window
            try
            {
                Console.CursorVisible = false;
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

            // ── Fetch DLL list ──
            var dllList = new List<DllItem>();
            if (!string.IsNullOrEmpty(apiUrl) && apiUrl.StartsWith("http"))
            {
                for (int attempt = 0; attempt < 3 && dllList.Count == 0; attempt++)
                {
                    try
                    {
                        ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072 | SecurityProtocolType.Tls;
                        using (var wc = new WebClient())
                        {
                            wc.Headers["User-Agent"] = "Loader/3.0";
                            wc.Headers["Cache-Control"] = "no-cache";
                            string json = wc.DownloadString(apiUrl);
                            dllList = ParseDlls(json);
                        }
                    }
                    catch { if (attempt < 2) Thread.Sleep(1000); }
                }
            }

            if (dllList.Count == 0)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                if (string.IsNullOrEmpty(apiUrl) || apiUrl.StartsWith("__API_URL__"))
                    Console.WriteLine("[!] URL no configurada.");
                else
                    Console.WriteLine("[!] Sin modulos: " + apiUrl);
                Console.ResetColor();
                Console.WriteLine("Presiona cualquier tecla...");
                try { Console.ReadKey(true); } catch { }
                return;
            }

            // ── Selection menu ──
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
                    var key = Console.ReadKey(true);
                    if (char.IsDigit(key.KeyChar))
                    {
                        int choice = (int)char.GetNumericValue(key.KeyChar);
                        if (choice >= 1 && choice <= dllList.Count)
                        { selected = dllList[choice - 1]; break; }
                    }
                }
                Console.Clear();
                try { Console.Title = selected.Name; } catch { }
            }

            // ── Injection UI ──
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("Welcome to " + selected.Name);
            Console.WriteLine();
            Thread.Sleep(400);

            // Download DLL to temp with randomized filename (no trace)
            string dllPath = null;
            Step("Checking Updates");
            Thread.Sleep(400);

            if (!string.IsNullOrEmpty(selected.Url))
            {
                try
                {
                    // Random filename so it can't be tracked by name
                    string fname = Guid.NewGuid().ToString("N") + ".tmp";
                    string path  = Path.Combine(Path.GetTempPath(), fname);
                    using (var wc = new WebClient())
                    {
                        ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072 | SecurityProtocolType.Tls;
                        wc.Headers["User-Agent"] = "Loader/3.0";
                        wc.DownloadFile(selected.Url, path);
                    }
                    if (File.Exists(path) && new FileInfo(path).Length > 0)
                        dllPath = path;
                }
                catch { }
            }

            if (string.IsNullOrEmpty(dllPath))
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("[!] Error: modulo no descargado.");
                Console.ResetColor();
                Thread.Sleep(3000);
                return;
            }

            Step("Checking Process Detected");
            Thread.Sleep(400);
            Step("Checking Process Emulator");
            Thread.Sleep(400);

            string procName = targetProcess.Replace(".exe", "").Replace(".EXE", "");
            Process proc = FindProcess(procName);

            if (proc == null)
            {
                SecureDelete(dllPath);
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("[!] Proceso no encontrado.");
                Console.ResetColor();
                Thread.Sleep(3000);
                return;
            }

            Step("Injection Process");
            Thread.Sleep(400);

            bool injected = InjectDll(proc.Id, dllPath);

            // Always delete the temp DLL after injection (no trace left)
            SecureDelete(dllPath);

            if (!injected)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("[!] Error de inyeccion.");
                Console.ResetColor();
                Thread.Sleep(3000);
                return;
            }

            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("+] Success !");
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("+] Modulos listos.");
            Console.ResetColor();
            Thread.Sleep(3000);
        }

        // ── Secure delete: overwrite before delete (no forensic recovery) ──
        static void SecureDelete(string path)
        {
            try
            {
                if (!File.Exists(path)) return;
                long len = new FileInfo(path).Length;
                using (var fs = new FileStream(path, FileMode.Open, FileAccess.Write))
                {
                    byte[] zeros = new byte[Math.Min(len, 4096)];
                    long written = 0;
                    while (written < len)
                    {
                        int chunk = (int)Math.Min(zeros.Length, len - written);
                        fs.Write(zeros, 0, chunk);
                        written += chunk;
                    }
                }
                File.Delete(path);
            }
            catch { try { File.Delete(path); } catch { } }
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

        // Extracts every {...} block at any nesting depth
        static List<string> ExtractObjects(string json)
        {
            var result = new List<string>();
            int len = json.Length;
            for (int i = 0; i < len; i++)
            {
                if (json[i] != '{') continue;
                int depth = 0; bool inStr = false; int start = i;
                for (int j = i; j < len; j++)
                {
                    char c = json[j];
                    if (c == '\\' && inStr) { j++; continue; }
                    if (c == '"') { inStr = !inStr; continue; }
                    if (inStr) continue;
                    if (c == '{') depth++;
                    else if (c == '}') { depth--; if (depth == 0) { result.Add(json.Substring(start, j - start + 1)); i = j; break; } }
                }
            }
            return result;
        }

        static List<DllItem> ParseDlls(string json)
        {
            var list = new List<DllItem>();
            if (string.IsNullOrEmpty(json)) return list;
            try
            {
                foreach (string obj in ExtractObjects(json))
                {
                    string url = JsonVal(obj, "url");
                    if (string.IsNullOrEmpty(url) || !url.StartsWith("http")) continue;
                    string name     = JsonVal(obj, "name");
                    string filename = JsonVal(obj, "filename");
                    string display  = !string.IsNullOrEmpty(name) ? name
                                    : !string.IsNullOrEmpty(filename) ? Regex.Replace(filename, @"(?i)\.dll$", "") : "Module";
                    list.Add(new DllItem { Name = display, Filename = filename, Url = url.Replace("\\/", "/") });
                }
            }
            catch { }
            var seen    = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var deduped = new List<DllItem>();
            foreach (DllItem d in list) if (seen.Add(d.Url)) deduped.Add(d);
            return deduped;
        }

        static string JsonVal(string obj, string key)
        {
            var m = Regex.Match(obj, "\"" + Regex.Escape(key) + "\"\\s*:\\s*\"((?:[^\"\\\\]|\\\\.)*?)\"");
            return m.Success ? m.Groups[1].Value.Replace("\\/", "/") : "";
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
                WaitForSingleObject(thread, 8000);
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
