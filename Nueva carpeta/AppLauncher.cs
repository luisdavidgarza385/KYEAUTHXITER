using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace SecureXAuthApp
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            string url = "https://keyauthpro.xyz/dashboard";

            // 1. Try launching in standalone App Mode with Chrome or Edge
            string[] browsers = new string[]
            {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Google\Chrome\Application\chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Microsoft\Edge\Application\msedge.exe")
            };

            foreach (string browser in browsers)
            {
                if (File.Exists(browser))
                {
                    try
                    {
                        ProcessStartInfo psi = new ProcessStartInfo
                        {
                            FileName = browser,
                            Arguments = "--app=" + url + " --window-size=1300,850",
                            UseShellExecute = true
                        };
                        Process.Start(psi);
                        return;
                    }
                    catch { }
                }
            }

            // 2. Fallback to default browser
            try
            {
                Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
            }
            catch
            {
                MessageBox.Show("No se pudo abrir el navegador. URL: " + url, "SecureX Auth", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
