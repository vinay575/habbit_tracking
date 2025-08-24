import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, LogOut, TrendingUp, Target, Calendar, CheckCircle2 } from 'lucide-react';
import { fetchHabits, fetchProgress, setFilter, setSortBy } from '@/store/slices/habitSlice';
import { signOut } from '@/store/slices/authSlice';
import HabitForm from './HabitForm';
import HabitCard from './HabitCard';
import HabitChart from './HabitChart';
import { format } from 'date-fns';

const HabitDashboard = () => {
  const dispatch = useDispatch();
  const { habits, progress, loading, filter, sortBy } = useSelector((state) => state.habits);
  const { user } = useSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchHabits());
    dispatch(fetchProgress());
  }, [dispatch]);

  const handleSignOut = async () => {
    await dispatch(signOut());
  };

  // Filter and sort habits
  const filteredAndSortedHabits = habits
    .filter(habit => {
      const matchesSearch = habit.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (filter === 'all') return true;
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayProgress = progress.find(p => p.habit_id === habit.id && p.date === today);
      const isCompleted = todayProgress ? todayProgress.completed_count >= habit.target_count : false;
      
      return filter === 'completed' ? isCompleted : !isCompleted;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'progress':
          const today = format(new Date(), 'yyyy-MM-dd');
          const aProgress = progress.find(p => p.habit_id === a.id && p.date === today);
          const bProgress = progress.find(p => p.habit_id === b.id && p.date === today);
          const aPercentage = aProgress ? (aProgress.completed_count / a.target_count) * 100 : 0;
          const bPercentage = bProgress ? (bProgress.completed_count / b.target_count) * 100 : 0;
          return bPercentage - aPercentage;
        default:
          return 0;
      }
    });

  // Calculate stats
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayStats = habits.reduce((stats, habit) => {
    const todayProgress = progress.find(p => p.habit_id === habit.id && p.date === today);
    const isCompleted = todayProgress ? todayProgress.completed_count >= habit.target_count : false;
    
    return {
      total: stats.total + 1,
      completed: stats.completed + (isCompleted ? 1 : 0),
      inProgress: stats.inProgress + (todayProgress && !isCompleted ? 1 : 0),
    };
  }, { total: 0, completed: 0, inProgress: 0 });

  const completionRate = todayStats.total > 0 ? Math.round((todayStats.completed / todayStats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                HabitFlow
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                Welcome back, {user?.email}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <HabitForm />
              <Button variant="outline" onClick={handleSignOut} className="gap-2 flex-shrink-0">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{todayStats.completed}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{todayStats.inProgress}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="habits" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="habits">My Habits</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="habits" className="space-y-6">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 overflow-x-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search habits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={filter} onValueChange={(value) => dispatch(setFilter(value))}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Habits</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value) => dispatch(setSortBy(value))}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="progress">Sort by Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Habits Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="h-2 bg-muted rounded"></div>
                      <div className="h-8 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredAndSortedHabits.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="text-4xl">🎯</div>
                    <h3 className="text-xl font-semibold">No habits found</h3>
                    <p className="text-muted-foreground">
                      {habits.length === 0
                        ? "Start your journey by creating your first habit!"
                        : "Try adjusting your search or filter criteria."}
                    </p>
                    {habits.length === 0 && <HabitForm />}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredAndSortedHabits.map((habit) => (
                  <HabitCard key={habit.id} habit={habit} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="analytics">
            <HabitChart habits={habits} progress={progress} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HabitDashboard;