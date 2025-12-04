import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound,
  Plus,
  Search,
  Copy,
  Eye,
  EyeOff,
  MoreVertical,
  Star,
  Trash2,
  Edit,
  ExternalLink,
  RefreshCw,
  Check,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { generatePassword, calculatePasswordStrength, getStrengthLabel, type PasswordOptions } from '@/lib/encryption';
import { cn } from '@/lib/utils';

interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  url?: string;
  tags: string[];
  favorite: boolean;
  createdAt: Date;
}

const mockPasswords: PasswordEntry[] = [];

export default function Passwords() {
  const [passwords] = useState<PasswordEntry[]>(mockPasswords);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    notes: '',
    tags: '',
  });
  
  // Password generator state
  const [generatorOptions, setGeneratorOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false,
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  
  const { encryptionKey } = useAuth();
  const { toast } = useToast();

  const handleGeneratePassword = () => {
    const password = generatePassword(generatorOptions);
    setGeneratedPassword(password);
  };

  const handleUsePassword = () => {
    setFormData(prev => ({ ...prev, password: generatedPassword }));
    setIsGeneratorOpen(false);
    toast({ title: 'Password applied' });
  };

  const copyToClipboard = async (text: string, id?: string) => {
    await navigator.clipboard.writeText(text);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
    toast({ title: 'Copied to clipboard' });
  };

  const strength = calculatePasswordStrength(formData.password || generatedPassword);
  const strengthInfo = getStrengthLabel(strength);

  const filteredPasswords = passwords.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Passwords</h1>
          <p className="text-muted-foreground">Securely store and manage your credentials</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Add Password
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Password</DialogTitle>
              <DialogDescription>
                Your password will be encrypted before saving
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Netflix, Gmail"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username / Email</Label>
                <Input
                  id="username"
                  placeholder="your@email.com"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Dialog open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Password Generator</DialogTitle>
                        <DialogDescription>
                          Generate a strong, random password
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        {/* Generated Password Display */}
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="font-mono text-lg break-all">
                            {generatedPassword || 'Click generate'}
                          </div>
                          {generatedPassword && (
                            <div className="flex items-center gap-2 mt-3">
                              <div className={cn(
                                "h-2 flex-1 rounded-full bg-muted-foreground/20 overflow-hidden"
                              )}>
                                <div
                                  className={cn(
                                    "h-full transition-all",
                                    strengthInfo.color === 'destructive' && 'bg-destructive',
                                    strengthInfo.color === 'warning' && 'bg-warning',
                                    strengthInfo.color === 'accent' && 'bg-accent',
                                    strengthInfo.color === 'success' && 'bg-success'
                                  )}
                                  style={{ width: `${strength}%` }}
                                />
                              </div>
                              <span className={cn(
                                "text-sm font-medium",
                                strengthInfo.color === 'destructive' && 'text-destructive',
                                strengthInfo.color === 'warning' && 'text-warning',
                                strengthInfo.color === 'accent' && 'text-accent',
                                strengthInfo.color === 'success' && 'text-success'
                              )}>
                                {strengthInfo.label}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Length Slider */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Length</Label>
                            <span className="text-sm text-muted-foreground">{generatorOptions.length}</span>
                          </div>
                          <Slider
                            value={[generatorOptions.length]}
                            onValueChange={([value]) => setGeneratorOptions(prev => ({ ...prev, length: value }))}
                            min={8}
                            max={64}
                            step={1}
                          />
                        </div>

                        {/* Character Options */}
                        <div className="space-y-3">
                          <Label>Characters</Label>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Uppercase (A-Z)</span>
                              <Switch
                                checked={generatorOptions.includeUppercase}
                                onCheckedChange={(checked) => setGeneratorOptions(prev => ({ ...prev, includeUppercase: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Lowercase (a-z)</span>
                              <Switch
                                checked={generatorOptions.includeLowercase}
                                onCheckedChange={(checked) => setGeneratorOptions(prev => ({ ...prev, includeLowercase: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Numbers (0-9)</span>
                              <Switch
                                checked={generatorOptions.includeNumbers}
                                onCheckedChange={(checked) => setGeneratorOptions(prev => ({ ...prev, includeNumbers: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Symbols (!@#$)</span>
                              <Switch
                                checked={generatorOptions.includeSymbols}
                                onCheckedChange={(checked) => setGeneratorOptions(prev => ({ ...prev, includeSymbols: checked }))}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleGeneratePassword}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Generate
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={handleUsePassword}
                            disabled={!generatedPassword}
                          >
                            Use Password
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                {formData.password && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all",
                          strengthInfo.color === 'destructive' && 'bg-destructive',
                          strengthInfo.color === 'warning' && 'bg-warning',
                          strengthInfo.color === 'accent' && 'bg-accent',
                          strengthInfo.color === 'success' && 'bg-success'
                        )}
                        style={{ width: `${calculatePasswordStrength(formData.password)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {getStrengthLabel(calculatePasswordStrength(formData.password)).label}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="personal, work, social (comma-separated)"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="gradient-primary text-primary-foreground"
                disabled={!encryptionKey || !formData.title || !formData.password}
              >
                Save Password
              </Button>
            </div>
            {!encryptionKey && (
              <p className="text-sm text-warning text-center">
                Encryption key not initialized. Enter your password to unlock.
              </p>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search passwords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Passwords List */}
      <AnimatePresence mode="popLayout">
        {filteredPasswords.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-1">No passwords yet</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Create your first secure password entry
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Password
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-3">
            {filteredPasswords.map((password) => (
              <motion.div
                key={password.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <KeyRound className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{password.title}</h3>
                          {password.favorite && (
                            <Star className="w-4 h-4 text-warning fill-warning" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {password.username}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {password.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(password.username, password.id)}
                        >
                          {copiedId === password.id ? (
                            <Check className="w-4 h-4 text-success" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        {password.url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(password.url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Star className="w-4 h-4 mr-2" />
                              {password.favorite ? 'Remove from favorites' : 'Add to favorites'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Security Note */}
      <Card className="border-border/50 bg-muted/30">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Your data is encrypted</p>
            <p className="text-xs text-muted-foreground">
              All passwords are encrypted on your device using AES-256-GCM before being stored.
              Only you can decrypt them with your master password.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
