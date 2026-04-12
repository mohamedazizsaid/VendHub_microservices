import { Save, Bell, Mail, CreditCard, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useState } from "react";

export function Settings() {
  const [settings, setSettings] = useState({
    siteName: "EventShop",
    siteUrl: "https://eventshop.com",
    supportEmail: "support@eventshop.com",
    currency: "USD",
    timezone: "UTC",
    emailNotifications: true,
    orderNotifications: true,
    marketingEmails: false,
  });

  const handleSave = () => {
    alert("Settings saved! (This is a demo)");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#16213E] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your platform settings and preferences</p>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#FF6B35]" />
                <CardTitle>General Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Site Name"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
              <Input
                label="Site URL"
                value={settings.siteUrl}
                onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
              />
              <Input
                label="Support Email"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1F4068] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1F4068] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">EST - Eastern Time</option>
                    <option value="PST">PST - Pacific Time</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#FF6B35]" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 dark:text-white">Email Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive email notifications for important updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="w-12 h-6 appearance-none bg-gray-300 dark:bg-gray-600 rounded-full relative cursor-pointer transition-colors checked:bg-[#FF6B35] before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-1 before:left-1 before:transition-transform checked:before:translate-x-6"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 dark:text-white">Order Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get notified about new orders</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.orderNotifications}
                  onChange={(e) => setSettings({ ...settings, orderNotifications: e.target.checked })}
                  className="w-12 h-6 appearance-none bg-gray-300 dark:bg-gray-600 rounded-full relative cursor-pointer transition-colors checked:bg-[#FF6B35] before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-1 before:left-1 before:transition-transform checked:before:translate-x-6"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 dark:text-white">Marketing Emails</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive promotional and marketing emails</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.marketingEmails}
                  onChange={(e) => setSettings({ ...settings, marketingEmails: e.target.checked })}
                  className="w-12 h-6 appearance-none bg-gray-300 dark:bg-gray-600 rounded-full relative cursor-pointer transition-colors checked:bg-[#FF6B35] before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-1 before:left-1 before:transition-transform checked:before:translate-x-6"
                />
              </label>
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#FF6B35]" />
                <CardTitle>Payment Gateways</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1F4068] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center text-white">
                    $
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white">Stripe</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Connected</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1F4068] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded flex items-center justify-center text-white">
                    P
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white">PayPal</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Not connected</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
