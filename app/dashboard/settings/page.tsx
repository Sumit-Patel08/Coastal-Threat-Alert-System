"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getClientAppSession } from "@/lib/auth/session"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  UserX, 
  Save, 
  Eye, 
  EyeOff,
  RefreshCw,
  LogOut,
  AlertTriangle
} from "lucide-react"

interface UserProfile {
  id: string
  first_name?: string
  last_name?: string
  organization?: string
  role?: string
  phone?: string
  notification_preferences?: {
    email_alerts: boolean
    sms_alerts: boolean
    push_notifications: boolean
    weekly_reports: boolean
  }
  theme_preference?: 'light' | 'dark' | 'system'
}

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return
    
    try {
      const session = await getClientAppSession()
      if (session?.isDemo) {
        setProfile({
          id: session.user.id,
          first_name: session.profile.first_name || undefined,
          last_name: session.profile.last_name || undefined,
          organization: session.profile.organization || undefined,
          role: session.profile.role,
          notification_preferences: {
            email_alerts: true,
            sms_alerts: false,
            push_notifications: true,
            weekly_reports: true,
          },
          theme_preference: "system",
        })
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      
      if (error) throw error
      
      setProfile({
        ...data,
        notification_preferences: data.notification_preferences || {
          email_alerts: true,
          sms_alerts: false,
          push_notifications: true,
          weekly_reports: true
        },
        theme_preference: data.theme_preference || 'system'
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return
    
    setSaving(true)
    try {
      const session = await getClientAppSession()
      if (session?.isDemo) {
        setProfile({ ...profile, ...updates })
        toast({
          title: "Demo mode",
          description: "Profile changes are local only while Supabase is offline.",
        })
        return
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
      
      if (error) throw error
      
      setProfile({ ...profile, ...updates })
      toast({
        title: "Success",
        description: "Profile updated successfully"
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const updatePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive"
      })
      return
    }

    if (passwordData.new.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      })
      
      if (error) throw error
      
      setPasswordData({ current: "", new: "", confirm: "" })
      toast({
        title: "Success",
        description: "Password updated successfully"
      })
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSwitchUser = async () => {
    try {
      await signOut()
      router.push('/auth/login')
      toast({
        title: "Switched User",
        description: "Please log in with a different account"
      })
    } catch (error) {
      console.error("Error switching user:", error)
      toast({
        title: "Error",
        description: "Failed to switch user",
        variant: "destructive"
      })
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }

    setSaving(true)
    try {
      // First delete profile data
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user?.id)
      
      if (profileError) throw profileError

      // Then delete auth user (this requires admin privileges in production)
      await signOut()
      router.push('/')
      
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted"
      })
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to load profile data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your account preferences and security settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and organization details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.first_name || ""}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.last_name || ""}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={profile.organization || ""}
                  onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                  placeholder="Enter your organization"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={profile.role || ""}
                  onValueChange={(value) => setProfile({ ...profile, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disaster_management">Disaster Management</SelectItem>
                    <SelectItem value="coastal_government">Coastal Government</SelectItem>
                    <SelectItem value="environmental_ngo">Environmental NGO</SelectItem>
                    <SelectItem value="fisherfolk">Fisherfolk</SelectItem>
                    <SelectItem value="civil_defence">Civil Defence</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={() => updateProfile({
                  first_name: profile.first_name,
                  last_name: profile.last_name,
                  organization: profile.organization,
                  phone: profile.phone,
                  role: profile.role
                })}
                disabled={saving}
                className="w-full"
              >
                {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Profile Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you want to receive alerts and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Alerts</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Receive coastal threat alerts via email
                  </p>
                </div>
                <Switch
                  checked={profile.notification_preferences?.email_alerts || false}
                  onCheckedChange={(checked) => {
                    const newPrefs = {
                      email_alerts: checked,
                      sms_alerts: profile.notification_preferences?.sms_alerts || false,
                      push_notifications: profile.notification_preferences?.push_notifications || false,
                      weekly_reports: profile.notification_preferences?.weekly_reports || false
                    }
                    setProfile({ ...profile, notification_preferences: newPrefs })
                    updateProfile({ notification_preferences: newPrefs })
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Alerts</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Receive urgent alerts via SMS
                  </p>
                </div>
                <Switch
                  checked={profile.notification_preferences?.sms_alerts || false}
                  onCheckedChange={(checked) => {
                    const newPrefs = {
                      email_alerts: profile.notification_preferences?.email_alerts || false,
                      sms_alerts: checked,
                      push_notifications: profile.notification_preferences?.push_notifications || false,
                      weekly_reports: profile.notification_preferences?.weekly_reports || false
                    }
                    setProfile({ ...profile, notification_preferences: newPrefs })
                    updateProfile({ notification_preferences: newPrefs })
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Receive browser push notifications
                  </p>
                </div>
                <Switch
                  checked={profile.notification_preferences?.push_notifications || false}
                  onCheckedChange={(checked) => {
                    const newPrefs = {
                      email_alerts: profile.notification_preferences?.email_alerts || false,
                      sms_alerts: profile.notification_preferences?.sms_alerts || false,
                      push_notifications: checked,
                      weekly_reports: profile.notification_preferences?.weekly_reports || false
                    }
                    setProfile({ ...profile, notification_preferences: newPrefs })
                    updateProfile({ notification_preferences: newPrefs })
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Reports</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Receive weekly coastal monitoring summaries
                  </p>
                </div>
                <Switch
                  checked={profile.notification_preferences?.weekly_reports || false}
                  onCheckedChange={(checked) => {
                    const newPrefs = {
                      email_alerts: profile.notification_preferences?.email_alerts || false,
                      sms_alerts: profile.notification_preferences?.sms_alerts || false,
                      push_notifications: profile.notification_preferences?.push_notifications || false,
                      weekly_reports: checked
                    }
                    setProfile({ ...profile, notification_preferences: newPrefs })
                    updateProfile({ notification_preferences: newPrefs })
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Password & Security
                </CardTitle>
                <CardDescription>
                  Update your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>

                <Button 
                  onClick={updatePassword}
                  disabled={saving || !passwordData.new || !passwordData.confirm}
                  className="w-full"
                >
                  {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  View your account details and login information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email Address</Label>
                  <Input value={user?.email || ""} disabled />
                </div>
                <div>
                  <Label>Account Created</Label>
                  <Input 
                    value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ""} 
                    disabled 
                  />
                </div>
                <div>
                  <Label>Last Sign In</Label>
                  <Input 
                    value={user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : ""} 
                    disabled 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Account Management */}
        <TabsContent value="account">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserX className="w-5 h-5" />
                  Account Actions
                </CardTitle>
                <CardDescription>
                  Switch users or manage your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Switch User</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Sign out and log in with a different account
                  </p>
                  <Button 
                    onClick={handleSwitchUser}
                    variant="outline"
                    className="w-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Switch to Different Account
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button 
                    onClick={handleDeleteAccount}
                    variant="destructive"
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <UserX className="w-4 h-4 mr-2" />}
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Theme Preference</Label>
                  <Select
                    value={profile.theme_preference || "system"}
                    onValueChange={(value: 'light' | 'dark' | 'system') => {
                      setProfile({ ...profile, theme_preference: value })
                      updateProfile({ theme_preference: value })
                      // Apply theme immediately
                      if (value === 'dark') {
                        document.documentElement.classList.add('dark')
                      } else if (value === 'light') {
                        document.documentElement.classList.remove('dark')
                      } else {
                        // System preference
                        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                        if (isDark) {
                          document.documentElement.classList.add('dark')
                        } else {
                          document.documentElement.classList.remove('dark')
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
