import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  KeyRound,
  FileText,
  CheckSquare,
  Wallet,
  Receipt,
  Plus,
  TrendingUp,
  Shield,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';

const quickActions = [
  { icon: KeyRound, label: 'Add Password', path: '/passwords', color: 'primary' },
  { icon: FileText, label: 'New Note', path: '/notes', color: 'accent' },
  { icon: CheckSquare, label: 'Add Task', path: '/todos', color: 'success' },
  { icon: Receipt, label: 'Log Expense', path: '/expenses', color: 'warning' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user, encryptionKey, initializeEncryption } = useAuth();
  const { toast } = useToast();
  const [isUnlockDialogOpen, setIsUnlockDialogOpen] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  
  // Real-time stats
  const [stats, setStats] = useState({
    passwords: 0,
    notes: 0,
    todos: 0,
    expenses: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Load and listen to real-time counts
  useEffect(() => {
    if (!user) return;

    setStatsLoading(true);
    const unsubscribers: (() => void)[] = [];
    let loadedCount = 0;
    const totalCollections = 4;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalCollections) {
        setStatsLoading(false);
      }
    };

    // Listen to passwords count
    const passwordsQuery = query(collection(db, 'passwords'), where('userId', '==', user.uid));
    const unsubPasswords = onSnapshot(passwordsQuery, (snapshot) => {
      setStats(prev => ({ ...prev, passwords: snapshot.size }));
      checkAllLoaded();
    });
    unsubscribers.push(unsubPasswords);

    // Listen to notes count
    const notesQuery = query(collection(db, 'notes'), where('userId', '==', user.uid));
    const unsubNotes = onSnapshot(notesQuery, (snapshot) => {
      setStats(prev => ({ ...prev, notes: snapshot.size }));
      checkAllLoaded();
    });
    unsubscribers.push(unsubNotes);

    // Listen to todos count
    const todosQuery = query(collection(db, 'todos'), where('userId', '==', user.uid));
    const unsubTodos = onSnapshot(todosQuery, (snapshot) => {
      setStats(prev => ({ ...prev, todos: snapshot.size }));
      checkAllLoaded();
    });
    unsubscribers.push(unsubTodos);

    // Listen to expenses count
    const expensesQuery = query(collection(db, 'expenses'), where('userId', '==', user.uid));
    const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
      setStats(prev => ({ ...prev, expenses: snapshot.size }));
      checkAllLoaded();
    });
    unsubscribers.push(unsubExpenses);

    // Cleanup all listeners
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [user]);

  const handleUnlock = async () => {
    if (!unlockPassword) {
      toast({
        title: 'Error',
        description: 'Please enter your password',
        variant: 'destructive',
      });
      return;
    }

    setUnlocking(true);
    try {
      await initializeEncryption(unlockPassword);
      toast({
        title: 'Success',
        description: 'Encryption unlocked successfully',
      });
      setIsUnlockDialogOpen(false);
      setUnlockPassword('');
    } catch (error) {
      console.error('Unlock error:', error);
      toast({
        title: 'Error',
        description: 'Failed to unlock. Please check your password.',
        variant: 'destructive',
      });
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 sm:space-y-6 md:space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
          {greeting()}, {user?.displayName?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Here's an overview of your personal data
        </p>
      </motion.div>

      {/* Encryption Status */}
      {!encryptionKey && (
        <motion.div variants={itemVariants}>
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Encryption not initialized</p>
                <p className="text-sm text-muted-foreground">
                  Enter your password to unlock encrypted data
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsUnlockDialogOpen(true)}>
                <Lock className="w-4 h-4 mr-2" />
                Unlock
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Unlock Dialog */}
      <Dialog open={isUnlockDialogOpen} onOpenChange={setIsUnlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock Encrypted Data</DialogTitle>
            <DialogDescription>
              Enter your account password to unlock your encrypted passwords and notes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="unlock-password">Password</Label>
              <Input
                id="unlock-password"
                type="password"
                placeholder="Enter your password"
                value={unlockPassword}
                onChange={(e) => setUnlockPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !unlocking) {
                    handleUnlock();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsUnlockDialogOpen(false)} disabled={unlocking}>
              Cancel
            </Button>
            <Button onClick={handleUnlock} disabled={unlocking || !unlockPassword}>
              {unlocking ? 'Unlocking...' : 'Unlock'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} to={action.path}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group"
                >
                  <Card className="hover:shadow-md transition-all cursor-pointer border-border/50 hover:border-primary/30">
                    <CardContent className="p-3 md:p-4 flex flex-col md:flex-row items-center gap-2 md:gap-3">
                      <div className={`w-10 h-10 md:w-10 md:h-10 rounded-lg bg-${action.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
                        <Icon className={`w-5 h-5 text-${action.color}`} />
                      </div>
                      <span className="font-medium text-xs md:text-sm text-center md:text-left leading-tight">{action.label}</span>
                      <Plus className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold mb-4">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="border-border/50">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <KeyRound className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">
                  {statsLoading ? (
                    <span className="inline-block w-10 h-6 md:w-12 md:h-8 bg-muted animate-pulse rounded"></span>
                  ) : (
                    stats.passwords
                  )}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Passwords</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <FileText className="w-4 h-4 md:w-5 md:h-5 text-accent" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">
                  {statsLoading ? (
                    <span className="inline-block w-10 h-6 md:w-12 md:h-8 bg-muted animate-pulse rounded"></span>
                  ) : (
                    stats.notes
                  )}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Notes</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-success" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">
                  {statsLoading ? (
                    <span className="inline-block w-10 h-6 md:w-12 md:h-8 bg-muted animate-pulse rounded"></span>
                  ) : (
                    stats.todos
                  )}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Tasks</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <Receipt className="w-4 h-4 md:w-5 md:h-5 text-warning" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">
                  {statsLoading ? (
                    <span className="inline-block w-10 h-6 md:w-12 md:h-8 bg-muted animate-pulse rounded"></span>
                  ) : (
                    stats.expenses
                  )}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Expenses</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Getting Started */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <CardHeader>
            <CardTitle>Get started with Personal Manager</CardTitle>
            <CardDescription>
              Your secure space for passwords, notes, and more
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-medium">Store Passwords</h3>
                <p className="text-sm text-muted-foreground">
                  Securely store and generate strong passwords with client-side encryption.
                </p>
                <Link to="/passwords" className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:underline">
                  Add password <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-accent" />
                </div>
                <h3 className="font-medium">Digital Vault</h3>
                <p className="text-sm text-muted-foreground">
                  Keep cards, documents, and important files in your encrypted vault.
                </p>
                <Link to="/vault" className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:underline">
                  Open vault <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-success" />
                </div>
                <h3 className="font-medium">Track Expenses</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your spending with categories, charts, and receipt uploads.
                </p>
                <Link to="/expenses" className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:underline">
                  View expenses <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
