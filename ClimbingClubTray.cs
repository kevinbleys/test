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
            try
            {
                Console.WriteLine("=== CLIMBING CLUB TRAY APP STARTING ===");
                Console.WriteLine("1. Initializing components...");
                InitializeComponent();

                Console.WriteLine("2. Initializing tray...");
                InitializeTray();

                Console.WriteLine("3. Initializing timer...");
                InitializeTimer();

                Console.WriteLine("4. Creating HTTP client...");
                httpClient = new HttpClient();

                Console.WriteLine("5. Scheduling admin interface opening...");
                Task.Delay(5000).ContinueWith(_ => {
                    Console.WriteLine("6. Opening admin interface...");
                    OpenAdminInterface();
                });

                Console.WriteLine("✅ Tray application initialized successfully!");

                // Show immediate confirmation
                MessageBox.Show("Climbing Club Tray App Started!\n\nLook for the icon in the system tray (bottom right).", 
                    "App Started", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR during initialization: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                MessageBox.Show($"Error starting tray app:\n{ex.Message}", "Startup Error", 
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void InitializeComponent()
        {
            this.WindowState = FormWindowState.Minimized;
            this.ShowInTaskbar = false;
            this.Visible = false;
            Console.WriteLine("   Component initialized - window will be hidden");
        }

        private void InitializeTray()
        {
            try
            {
                Console.WriteLine("   Creating context menu...");
                // Créer le menu contextuel
                trayMenu = new ContextMenuStrip();

                // Menu items (sans emoji pour compatibility)
                var adminItem = new ToolStripMenuItem("Interface Admin", null, OpenAdminInterface);
                var tabletItem = new ToolStripMenuItem("Interface Tablette", null, OpenTabletInterface);
                var separator1 = new ToolStripSeparator();
                var statusItem = new ToolStripMenuItem("Statut des Services", null, ShowServiceStatus);
                var restartItem = new ToolStripMenuItem("Redemarrer Services", null, RestartServices);
                var separator2 = new ToolStripSeparator();
                var aboutItem = new ToolStripMenuItem("A propos", null, ShowAbout);
                var exitItem = new ToolStripMenuItem("Quitter", null, OnExit);

                trayMenu.Items.AddRange(new ToolStripItem[] {
                    adminItem, tabletItem, separator1, statusItem, restartItem, 
                    separator2, aboutItem, exitItem
                });

                Console.WriteLine("   Creating tray icon...");
                // Créer l'icône de la barre des tâches
                trayIcon = new NotifyIcon()
                {
                    Icon = CreateSimpleIcon(),
                    ContextMenuStrip = trayMenu,
                    Visible = true,
                    Text = "Logiciel Club d'Escalade"
                };

                // Double-clic pour ouvrir l'admin interface
                trayIcon.DoubleClick += (s, e) => {
                    Console.WriteLine("Tray icon double-clicked");
                    OpenAdminInterface();
                };

                Console.WriteLine("   Showing startup notification...");
                // Notification de démarrage
                trayIcon.ShowBalloonTip(3000, "Club d'Escalade", 
                    "Le logiciel est demarre et fonctionne en arriere-plan.", 
                    ToolTipIcon.Info);

                Console.WriteLine("✅ Tray initialized successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR in InitializeTray: {ex.Message}");
                throw;
            }
        }

        private void InitializeTimer()
        {
            try
            {
                // Timer pour vérifier le statut des services
                statusTimer = new System.Windows.Forms.Timer();
                statusTimer.Interval = 30000; // 30 secondes
                statusTimer.Tick += CheckServicesStatus;
                statusTimer.Start();
                Console.WriteLine("   Timer started (30 second interval)");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR in InitializeTimer: {ex.Message}");
                throw;
            }
        }

        private Icon CreateSimpleIcon()
        {
            try
            {
                // Créer un icône simple (geen emoji)
                Bitmap bitmap = new Bitmap(32, 32);
                using (Graphics g = Graphics.FromImage(bitmap))
                {
                    g.Clear(Color.Transparent);
                    g.FillEllipse(Brushes.DarkBlue, 4, 4, 24, 24);
                    // Gebruik gewone letter in plaats van emoji
                    Font font = new Font("Arial", 14, FontStyle.Bold);
                    g.DrawString("C", font, Brushes.White, 8, 6);
                    font.Dispose();
                }
                Console.WriteLine("   Simple icon created");
                return Icon.FromHandle(bitmap.GetHicon());
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR creating icon: {ex.Message}");
                // Return system icon as fallback
                return SystemIcons.Application;
            }
        }

        private void OpenAdminInterface(object sender = null, EventArgs e = null)
        {
            try
            {
                Console.WriteLine("Opening admin interface: http://localhost:3001/admin");
                Process.Start(new ProcessStartInfo
                {
                    FileName = "http://localhost:3001/admin",
                    UseShellExecute = true
                });
                Console.WriteLine("✅ Admin interface opened");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR opening admin interface: {ex.Message}");
                MessageBox.Show($"Erreur lors de l'ouverture de l'interface admin:\n{ex.Message}", 
                    "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void OpenTabletInterface(object sender, EventArgs e)
        {
            try
            {
                Console.WriteLine("Opening tablet interface: http://localhost:3000");
                Process.Start(new ProcessStartInfo
                {
                    FileName = "http://localhost:3000",
                    UseShellExecute = true
                });
                Console.WriteLine("✅ Tablet interface opened");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR opening tablet interface: {ex.Message}");
                MessageBox.Show($"Erreur lors de l'ouverture de l'interface tablette:\n{ex.Message}", 
                    "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private async void CheckServicesStatus(object sender, EventArgs e)
        {
            try
            {
                Console.WriteLine("Checking service status...");
                bool backendRunning = await IsServiceRunning("http://localhost:3001/api/health");
                bool frontendRunning = await IsServiceRunning("http://localhost:3000");

                Console.WriteLine($"Backend running: {backendRunning}, Frontend running: {frontendRunning}");

                if (!backendRunning || !frontendRunning)
                {
                    trayIcon.Icon = CreateErrorIcon();
                    trayIcon.Text = "Club d'Escalade - Services arretes";
                }
                else
                {
                    trayIcon.Icon = CreateSimpleIcon();
                    trayIcon.Text = "Club d'Escalade - Fonctionnel";
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR in CheckServicesStatus: {ex.Message}");
            }
        }

        private async Task<bool> IsServiceRunning(string url)
        {
            try
            {
                var response = await httpClient.GetAsync(url);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Service check failed for {url}: {ex.Message}");
                return false;
            }
        }

        private Icon CreateErrorIcon()
        {
            try
            {
                Bitmap bitmap = new Bitmap(32, 32);
                using (Graphics g = Graphics.FromImage(bitmap))
                {
                    g.Clear(Color.Transparent);
                    g.FillEllipse(Brushes.Red, 4, 4, 24, 24);
                    Font font = new Font("Arial", 12, FontStyle.Bold);
                    g.DrawString("!", font, Brushes.White, 12, 6);
                    font.Dispose();
                }
                return Icon.FromHandle(bitmap.GetHicon());
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR creating error icon: {ex.Message}");
                return SystemIcons.Error;
            }
        }

        private void ShowServiceStatus(object sender, EventArgs e)
        {
            try
            {
                Console.WriteLine("Showing service status dialog");
                var backend = IsWindowsServiceRunning("ClimbingClub-Backend") ? "Active" : "Arrete";
                var frontend = IsWindowsServiceRunning("ClimbingClub-Frontend") ? "Active" : "Arrete";
                var admin = IsWindowsServiceRunning("ClimbingClub-Admin") ? "Active" : "Arrete";

                MessageBox.Show($"Statut des Services:\n\n" +
                               $"Backend (Port 3001): {backend}\n" +
                               $"Frontend (Port 3000): {frontend}\n" +
                               $"Admin Dashboard (Port 3002): {admin}",
                               "Statut des Services", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR in ShowServiceStatus: {ex.Message}");
            }
        }

        private bool IsWindowsServiceRunning(string serviceName)
        {
            try
            {
                ServiceController sc = new ServiceController(serviceName);
                bool isRunning = sc.Status == ServiceControllerStatus.Running;
                Console.WriteLine($"Service {serviceName}: {sc.Status}");
                sc.Dispose();
                return isRunning;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error checking service {serviceName}: {ex.Message}");
                return false;
            }
        }

        private void RestartServices(object sender, EventArgs e)
        {
            if (MessageBox.Show("Redemarrer tous les services?", "Confirmation", 
                MessageBoxButtons.YesNo, MessageBoxIcon.Question) == DialogResult.Yes)
            {
                Task.Run(() =>
                {
                    try
                    {
                        Console.WriteLine("Restarting services...");
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
                            trayIcon.ShowBalloonTip(3000, "Services Redemarres", 
                                "Tous les services ont ete redemarres avec succes.", 
                                ToolTipIcon.Info);
                        });
                        Console.WriteLine("✅ Services restarted successfully");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"❌ ERROR restarting services: {ex.Message}");
                        this.Invoke((MethodInvoker)delegate {
                            MessageBox.Show($"Erreur lors du redemarrage:\n{ex.Message}", 
                                "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        });
                    }
                });
            }
        }

        private void ExecuteCommand(string command)
        {
            try
            {
                Console.WriteLine($"Executing command: {command}");
                Process.Start(new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = $"/C {command}",
                    WindowStyle = ProcessWindowStyle.Hidden,
                    CreateNoWindow = true
                }).WaitForExit();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR executing command '{command}': {ex.Message}");
            }
        }

        private void ShowAbout(object sender, EventArgs e)
        {
            MessageBox.Show("Logiciel Club d'Escalade v2.0\n\n" +
                           "Systeme de gestion pour clubs d'escalade\n" +
                           "Interface tablette + Administration\n\n" +
                           "© 2025 Club d'Escalade\n\n" +
                           "Services:\n" +
                           "• Backend: http://localhost:3001\n" +
                           "• Interface Tablette: http://localhost:3000\n" +
                           "• Interface Admin: http://localhost:3001/admin",
                           "A propos", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        private void OnExit(object sender, EventArgs e)
        {
            if (MessageBox.Show("Fermer le logiciel? Les services continueront a fonctionner.", 
                "Confirmation", MessageBoxButtons.YesNo, MessageBoxIcon.Question) == DialogResult.Yes)
            {
                Console.WriteLine("User requested exit");
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
                Console.WriteLine("Disposing tray application");
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
            // VOOR DEBUG: Allocate console
            AllocConsole();
            Console.WriteLine("=== CLIMBING CLUB TRAY APPLICATION ===");
            Console.WriteLine($"Started at: {DateTime.Now}");

            try
            {
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                Application.Run(new TrayApplication());
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ FATAL ERROR: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                MessageBox.Show($"Fatal error:\n{ex.Message}", "Fatal Error", 
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
            }

            Console.WriteLine("Application ended");
            Console.WriteLine("Press any key to close console...");
            Console.ReadKey();
        }

        [System.Runtime.InteropServices.DllImport("kernel32.dll")]
        static extern bool AllocConsole();
    }
}
