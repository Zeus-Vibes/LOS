import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { 
  Store, User, Mail, Phone, MapPin, Lock, Bell, Shield, 
  Save, ArrowLeft, Camera, Eye, EyeOff, Check, Loader2, AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import authService from "@/services/authService";

const Settings = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    first_name: "", last_name: "", email: "", phone_number: "", address: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "", new_password: "", confirm_password: "",
  });

  const [notifications, setNotifications] = useState({
    email_orders: true, email_promotions: false, push_orders: true, push_promotions: false,
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setProfileData({
      first_name: user.first_name || "", last_name: user.last_name || "",
      email: user.email || "", phone_number: user.phone_number || "", address: user.address || "",
    });
    setProfileImage(user.profile_picture || null);
    loadNotificationPreferences();
  }, [user]);

  const loadNotificationPreferences = async () => {
    try {
      const prefs = await authService.getNotificationPreferences();
      setNotifications(prefs);
    } catch (error) {
      console.error('Failed to load notification preferences');
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({ ...profileData, [e.target.id]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.id]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "Image must be less than 5MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const dataToSend: any = { ...profileData };
      // Include profile image if it's a base64 string (newly uploaded)
      if (profileImage && profileImage.startsWith('data:')) {
        dataToSend.profile_picture = profileImage;
      }
      await authService.updateProfile(dataToSend);
      await refreshUser();
      toast({ title: "Profile updated", description: "Your profile has been updated successfully" });
    } catch (error: any) {
      console.error('Profile update error:', error.response?.data);
      const errorMsg = error.response?.data?.detail || 
                       error.response?.data?.error || 
                       Object.values(error.response?.data || {}).flat().join(', ') ||
                       "Failed to update profile";
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({ title: "Error", description: "New passwords don't match", variant: "destructive" });
      return;
    }
    if (passwordData.new_password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await authService.changePassword({ current_password: passwordData.current_password, new_password: passwordData.new_password });
      toast({ title: "Password updated", description: "Your password has been changed successfully" });
      setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to update password", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    try {
      await authService.saveNotificationPreferences(notifications);
      toast({ title: "Preferences saved", description: "Your notification preferences have been saved" });
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to save preferences", variant: "destructive" });
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast({ title: "Error", description: "Please enter your password", variant: "destructive" });
      return;
    }
    setIsDeleting(true);
    try {
      await authService.deleteAccount(deletePassword);
      toast({ title: "Account deleted", description: "Your account has been deleted" });
      await logout();
      navigate('/');
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to delete account", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.user_type) {
      case 'admin': return '/admin';
      case 'shopkeeper': return '/shopkeeper/dashboard';
      case 'customer': return '/customer/dashboard';
      default: return '/browse';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass-strong border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to={getDashboardLink()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">LOS</span>
            </Link>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4" />Profile</TabsTrigger>
            <TabsTrigger value="security" className="gap-2"><Shield className="w-4 h-4" />Security</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2"><Bell className="w-4 h-4" />Notifications</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-3xl font-bold">
                          {user.first_name?.[0] || user.username?.[0] || 'U'}
                        </div>
                      )}
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90">
                        <Camera className="w-4 h-4" />
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{user.first_name} {user.last_name}</h3>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.user_type}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label htmlFor="first_name">First Name</Label><Input id="first_name" value={profileData.first_name} onChange={handleProfileChange} /></div>
                    <div className="space-y-2"><Label htmlFor="last_name">Last Name</Label><Input id="last_name" value={profileData.last_name} onChange={handleProfileChange} /></div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="email">Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input id="email" type="email" className="pl-10" value={profileData.email} onChange={handleProfileChange} /></div></div>
                  <div className="space-y-2"><Label htmlFor="phone_number">Phone Number</Label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input id="phone_number" type="tel" className="pl-10" value={profileData.phone_number} onChange={handleProfileChange} /></div></div>
                  <div className="space-y-2"><Label htmlFor="address">Address</Label><div className="relative"><MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" /><Textarea id="address" className="pl-10 min-h-[80px]" value={profileData.address} onChange={handleProfileChange} placeholder="Enter your address" /></div></div>
                  <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}{isLoading ? "Saving..." : "Save Changes"}</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader><CardTitle>Change Password</CardTitle><CardDescription>Update your password to keep your account secure</CardDescription></CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input id="current_password" type={showCurrentPassword ? "text" : "password"} className="pl-10 pr-10" value={passwordData.current_password} onChange={handlePasswordChange} />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input id="new_password" type={showNewPassword ? "text" : "password"} className="pl-10 pr-10" value={passwordData.new_password} onChange={handlePasswordChange} />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input id="confirm_password" type="password" className="pl-10" value={passwordData.confirm_password} onChange={handlePasswordChange} /></div>
                  </div>
                  <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}{isLoading ? "Updating..." : "Update Password"}</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle><CardDescription>Irreversible actions for your account</CardDescription></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                  <div><h4 className="font-medium">Delete Account</h4><p className="text-sm text-muted-foreground">Permanently delete your account and all data</p></div>
                  <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader><CardTitle>Notification Preferences</CardTitle><CardDescription>Choose how you want to be notified</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Email Notifications</h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div><p className="font-medium">Order Updates</p><p className="text-sm text-muted-foreground">Receive emails about your order status</p></div>
                      <input type="checkbox" checked={notifications.email_orders} onChange={(e) => setNotifications({...notifications, email_orders: e.target.checked})} className="w-5 h-5 rounded" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div><p className="font-medium">Promotions & Offers</p><p className="text-sm text-muted-foreground">Receive emails about deals and discounts</p></div>
                      <input type="checkbox" checked={notifications.email_promotions} onChange={(e) => setNotifications({...notifications, email_promotions: e.target.checked})} className="w-5 h-5 rounded" />
                    </label>
                  </div>
                </div>
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Push Notifications</h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div><p className="font-medium">Order Updates</p><p className="text-sm text-muted-foreground">Get push notifications for order status</p></div>
                      <input type="checkbox" checked={notifications.push_orders} onChange={(e) => setNotifications({...notifications, push_orders: e.target.checked})} className="w-5 h-5 rounded" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div><p className="font-medium">Promotions & Offers</p><p className="text-sm text-muted-foreground">Get notified about deals nearby</p></div>
                      <input type="checkbox" checked={notifications.push_promotions} onChange={(e) => setNotifications({...notifications, push_promotions: e.target.checked})} className="w-5 h-5 rounded" />
                    </label>
                  </div>
                </div>
                <Button onClick={handleSaveNotifications} disabled={isSavingNotifications}>
                  {isSavingNotifications ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  {isSavingNotifications ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" />Delete Account</DialogTitle>
            <DialogDescription>This action cannot be undone. All your data will be permanently deleted.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delete_password">Enter your password to confirm</Label>
              <Input id="delete_password" type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Your password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isDeleting ? "Deleting..." : "Delete My Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
