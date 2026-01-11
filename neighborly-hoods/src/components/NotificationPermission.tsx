import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, X } from "lucide-react";

const NotificationPermission = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if we've already asked for permission
    const hasAsked = localStorage.getItem('notification_permission_asked');
    
    if (!hasAsked && 'Notification' in window && Notification.permission === 'default') {
      // Show prompt after a short delay
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      localStorage.setItem('notification_permission_asked', 'true');
      setShowPrompt(false);
      
      if (permission === 'granted') {
        new Notification('Notifications Enabled!', {
          body: 'You will now receive order updates and promotions.',
          icon: 'https://img.icons8.com/comic/100/shop.png'
        });
      }
    } catch (error) {
      console.error('Notification permission error:', error);
      setShowPrompt(false);
    }
  };

  const dismissPrompt = () => {
    localStorage.setItem('notification_permission_asked', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <Card className="p-4 max-w-sm shadow-lg border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Enable Notifications</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Get instant updates on your orders and exclusive deals!
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={requestPermission}>
                Enable
              </Button>
              <Button size="sm" variant="ghost" onClick={dismissPrompt}>
                Not Now
              </Button>
            </div>
          </div>
          <button onClick={dismissPrompt} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      </Card>
    </div>
  );
};

export default NotificationPermission;
