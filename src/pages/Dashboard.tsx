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
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const quickActions = [
  { icon: KeyRound, label: 'Add Password', path: '/passwords', color: 'primary' },
  { icon: FileText, label: 'New Note', path: '/notes', color: 'accent' },
  { icon: CheckSquare, label: 'Add Task', path: '/todos', color: 'success' },
  { icon: Receipt, label: 'Log Expense', path: '/expenses', color: 'warning' },
];

const stats = [
  { label: 'Passwords', value: '0', icon: KeyRound, trend: null },
  { label: 'Notes', value: '0', icon: FileText, trend: null },
  { label: 'Tasks', value: '0', icon: CheckSquare, trend: null },
  { label: 'Documents', value: '0', icon: Wallet, trend: null },
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
  const { user, encryptionKey } = useAuth();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting()}, {user?.displayName?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-muted-foreground">
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
              <Button variant="outline" size="sm">
                Unlock
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-${action.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-5 h-5 text-${action.color}`} />
                      </div>
                      <span className="font-medium text-sm">{action.label}</span>
                      <Plus className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    {stat.trend && (
                      <span className="text-xs text-success flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {stat.trend}
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
