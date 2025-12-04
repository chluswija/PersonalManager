import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Lock, Shield } from 'lucide-react';

export function UnlockPrompt() {
  const { user, encryptionKey, initializeEncryption } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    // Show unlock prompt when user is logged in but encryption key is not set
    if (user && !encryptionKey) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [user, encryptionKey]);

  const handleUnlock = async () => {
    if (!password) {
      toast({
        title: 'Error',
        description: 'Please enter your password',
        variant: 'destructive',
      });
      return;
    }

    setUnlocking(true);
    try {
      await initializeEncryption(password);
      toast({
        title: 'Success',
        description: 'Your data is now unlocked',
      });
      setPassword('');
      setIsOpen(false);
    } catch (error) {
      console.error('Unlock error:', error);
      toast({
        title: 'Error',
        description: 'Incorrect password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle>Unlock Your Vault</DialogTitle>
              <DialogDescription className="mt-1">
                Enter your password to access encrypted data
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your account password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !unlocking) {
                  handleUnlock();
                }
              }}
              autoFocus
            />
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                This is the same password you use to log in. Your data is encrypted 
                with this password and can only be accessed by you.
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setPassword('');
              setIsOpen(false);
            }}
            disabled={unlocking}
          >
            Later
          </Button>
          <Button 
            onClick={handleUnlock} 
            disabled={unlocking || !password}
            className="min-w-24"
          >
            {unlocking ? 'Unlocking...' : 'Unlock'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
