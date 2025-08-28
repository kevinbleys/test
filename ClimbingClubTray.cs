using System;
using System.Diagnostics;
using System.Drawing;
using System.ServiceProcess;
using System.Windows.Forms;
using System.Net.Http;
using System.Threading.Tasks;

namespace ClimbingClubTray
{
    public partial class TrayApplication : Form
    {
        private NotifyIcon trayIcon;
        private ContextMenuStrip trayMenu;
        private System.Windows.Forms.Timer statusTimer;
        private HttpClient httpClient;

        public TrayApplication()
        {
            InitializeComponent();
            InitializeTray();
            InitializeTimer();
            httpClient = new HttpClient();

            // Ouvrir automatiquement l'admin interface bij startup
            Task.Delay(5000).ContinueWith(_ => OpenAdminInterface());
        }

        private void InitializeComponent()
        {
            this.WindowState = FormWindowState.Minimized;
            this.ShowInTaskbar = false;
            this.Visible = false;
        }

        private void InitializeTray()
        {
            // Créer le menu contextuel
            trayMenu = new ContextMenuStrip();

            // Menu items
            var adminItem = new ToolStripMenuItem("🖥️ Interface Admin", null, OpenAdminInterface);
            var tabletItem = new ToolStripMenuItem("📱 Interface Tablette", null, OpenTabletInterface);
            var separator1 = new ToolStripSeparator();
            var statusItem = new ToolStripMenuItem("📊 Statut des Services", null, ShowServiceStatus);
            var restartItem = new ToolStripMenuItem("🔄 Redémarrer Services", null, RestartServices);
            var separator2 = new ToolStripSeparator();
            var aboutItem = new ToolStripMenuItem("ℹ️ À propos", null, ShowAbout);
            var exitItem = new ToolStripMenuItem("❌ Quitter", null, OnExit);

            trayMenu.Items.AddRange(new ToolStripItem[] {
                adminItem, tabletItem, separator1, statusItem, restartItem, 
                separator2, aboutItem, exitItem
            });

            // Créer l'icône de la barre des tâches
            trayIcon = new NotifyIcon()
            {
                Icon = CreateClimbingIcon(),
                ContextMenuStrip = trayMenu,
                Visible = true,
                Text = "Logiciel Club d'Escalade"
            };

            // Double-clic pour ouvrir l'admin interface
            trayIcon.DoubleClick += (s, e) => OpenAdminInterface();

            // Notification de démarrage
            trayIcon.ShowBalloonTip(3000, "Club d'Escalade", 
                "Le logiciel est démarré et fonctionne en arrière-plan.", 
                ToolTipIcon.Info);
        }

        private void InitializeTimer()
        {
            // Timer pour vérifier le statut des services
            statusTimer = new System.Windows.Forms.Timer();
            statusTimer.Interval = 30000; // 30 secondes
            statusTimer.Tick += CheckServicesStatus;
            statusTimer.Start();
        }

        private Icon CreateClimbingIcon()
        {
            // Créer un icône simple pour l'escalade
            Bitmap bitmap = new Bitmap(32, 32);
            using (Graphics g = Graphics.FromImage(bitmap))
            {
                g.Clear(Color.Transparent);
                g.FillEllipse(Brushes.DarkBlue, 4, 4, 24, 24);
                g.DrawString("🧗", new Font("Arial", 16), Brushes.White, 2, 2);
            }
            return Icon.FromHandle(bitmap.GetHicon());
        }

        private void OpenAdminInterface(object sender = null, EventArgs e = null)
        {
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = "http://localhost:3001/admin",
                    UseShellExecute = true
                });
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Erreur lors de l'ouverture de l'interface admin:\n{ex.Message}", 
                    "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void OpenTabletInterface(object sender, EventArgs e)
        {
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = "http://localhost:3000",
                    UseShellExecute = true
                });
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Erreur lors de l'ouverture de l'interface tablette:\n{ex.Message}", 
                    "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private async void CheckServicesStatus(object sender, EventArgs e)
        {
            bool backendRunning = await IsServiceRunning("http://localhost:3001/api/health");
            bool frontendRunning = await IsServiceRunning("http://localhost:3000");

            if (!backendRunning || !frontendRunning)
            {
                trayIcon.Icon = CreateErrorIcon();
                trayIcon.Text = "Club d'Escalade - Services arrêtés";
            }
            else
            {
                trayIcon.Icon = CreateClimbingIcon();
                trayIcon.Text = "Club d'Escalade - Fonctionnel";
            }
        }

        private async Task<bool> IsServiceRunning(string url)
        {
            try
            {
                var response = await httpClient.GetAsync(url);
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        private Icon CreateErrorIcon()
        {
            Bitmap bitmap = new Bitmap(32, 32);
            using (Graphics g = Graphics.FromImage(bitmap))
            {
                g.Clear(Color.Transparent);
                g.FillEllipse(Brushes.Red, 4, 4, 24, 24);
                g.DrawString("⚠", new Font("Arial", 16), Brushes.White, 6, 2);
            }
            return Icon.FromHandle(bitmap.GetHicon());
        }

        private void ShowServiceStatus(object sender, EventArgs e)
        {
            var backend = IsWindowsServiceRunning("ClimbingClub-Backend") ? "✅ Actif" : "❌ Arrêté";
            var frontend = IsWindowsServiceRunning("ClimbingClub-Frontend") ? "✅ Actif" : "❌ Arrêté";
            var admin = IsWindowsServiceRunning("ClimbingClub-Admin") ? "✅ Actif" : "❌ Arrêté";

            MessageBox.Show($"Statut des Services:\n\n" +
                           $"Backend (Port 3001): {backend}\n" +
                           $"Frontend (Port 3000): {frontend}\n" +
                           $"Admin Dashboard (Port 3002): {admin}",
                           "Statut des Services", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        private bool IsWindowsServiceRunning(string serviceName)
        {
            try
            {
                ServiceController sc = new ServiceController(serviceName);
                return sc.Status == ServiceControllerStatus.Running;
            }
            catch
            {
                return false;
            }
        }

        private void RestartServices(object sender, EventArgs e)
        {
            if (MessageBox.Show("Redémarrer tous les services?", "Confirmation", 
                MessageBoxButtons.YesNo, MessageBoxIcon.Question) == DialogResult.Yes)
            {
                Task.Run(() =>
                {
                    try
                    {
                        // Arrêter les services
                        ExecuteCommand("net stop ClimbingClub-Backend");
                        ExecuteCommand("net stop ClimbingClub-Frontend");
                        ExecuteCommand("net stop ClimbingClub-Admin");

                        System.Threading.Thread.Sleep(2000);

                        // Redémarrer les services
                        ExecuteCommand("net start ClimbingClub-Backend");
                        ExecuteCommand("net start ClimbingClub-Frontend");
                        ExecuteCommand("net start ClimbingClub-Admin");

                        this.Invoke((MethodInvoker)delegate {
                            trayIcon.ShowBalloonTip(3000, "Services Redémarrés", 
                                "Tous les services ont été redémarrés avec succès.", 
                                ToolTipIcon.Info);
                        });
                    }
                    catch (Exception ex)
                    {
                        this.Invoke((MethodInvoker)delegate {
                            MessageBox.Show($"Erreur lors du redémarrage:\n{ex.Message}", 
                                "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        });
                    }
                });
            }
        }

        private void ExecuteCommand(string command)
        {
            Process.Start(new ProcessStartInfo
            {
                FileName = "cmd.exe",
                Arguments = $"/C {command}",
                WindowStyle = ProcessWindowStyle.Hidden,
                CreateNoWindow = true
            }).WaitForExit();
        }

        private void ShowAbout(object sender, EventArgs e)
        {
            MessageBox.Show("Logiciel Club d'Escalade v2.0\n\n" +
                           "Système de gestion pour clubs d'escalade\n" +
                           "Interface tablette + Administration\n\n" +
                           "© 2025 Club d'Escalade\n\n" +
                           "Services:\n" +
                           "• Backend: http://localhost:3001\n" +
                           "• Interface Tablette: http://localhost:3000\n" +
                           "• Interface Admin: http://localhost:3001/admin",
                           "À propos", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        private void OnExit(object sender, EventArgs e)
        {
            if (MessageBox.Show("Fermer le logiciel? Les services continueront à fonctionner.", 
                "Confirmation", MessageBoxButtons.YesNo, MessageBoxIcon.Question) == DialogResult.Yes)
            {
                trayIcon.Visible = false;
                Application.Exit();
            }
        }

        protected override void SetVisibleCore(bool value)
        {
            base.SetVisibleCore(false);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                trayIcon?.Dispose();
                statusTimer?.Dispose();
                httpClient?.Dispose();
            }
            base.Dispose(disposing);
        }
    }

    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new TrayApplication());
        }
    }
}
