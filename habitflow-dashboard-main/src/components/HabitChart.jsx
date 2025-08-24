import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay } from 'date-fns';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--muted-foreground))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--primary))', 'hsl(var(--muted))', 'hsl(var(--border))'];

const HabitChart = ({ habits, progress }) => {
  const [chartType, setChartType] = useState('bar');
  const [timeRange, setTimeRange] = useState('week');

  const chartData = useMemo(() => {
    const days = timeRange === 'week' ? 7 : 30;
    const dateRange = eachDayOfInterval({
      start: subDays(new Date(), days - 1),
      end: new Date()
    });

    return dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayProgress = progress.filter(p => p.date === dateStr);
      
      const completedHabits = dayProgress.filter(p => {
        const habit = habits.find(h => h.id === p.habit_id);
        return habit && p.completed_count >= habit.target_count;
      }).length;

      return {
        date: format(date, timeRange === 'week' ? 'EEE' : 'MMM d'),
        completed: completedHabits,
        total: habits.length,
        percentage: habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0,
      };
    });
  }, [habits, progress, timeRange]);

  const pieData = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayProgress = progress.filter(p => p.date === today);
    
    const habitStats = habits.map(habit => {
      const habitProgress = todayProgress.find(p => p.habit_id === habit.id);
      const completed = habitProgress ? habitProgress.completed_count >= habit.target_count : false;
      return {
        name: habit.name,
        value: completed ? 1 : 0,
        color: habit.color,
      };
    });

    const completed = habitStats.filter(h => h.value === 1).length;
    const pending = habitStats.filter(h => h.value === 0).length;

    return [
      { name: 'Completed', value: completed, color: 'hsl(var(--primary))' },
      { name: 'Pending', value: pending, color: 'hsl(var(--destructive))' },
    ].filter(item => item.value > 0);
  }, [habits, progress]);

  const weeklyStats = useMemo(() => {
    const startOfThisWeek = startOfWeek(new Date());
    const endOfThisWeek = endOfWeek(new Date());
    
    const weekDays = eachDayOfInterval({
      start: startOfThisWeek,
      end: endOfThisWeek
    });

    return weekDays.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayProgress = progress.filter(p => p.date === dateStr);
      
      const completedCount = dayProgress.filter(p => {
        const habit = habits.find(h => h.id === p.habit_id);
        return habit && p.completed_count >= habit.target_count;
      }).length;

      return {
        day: format(date, 'EEEE'),
        completed: completedCount,
        total: habits.length,
        isToday: isSameDay(date, new Date()),
      };
    });
  }, [habits, progress]);

  const totalCompletions = useMemo(() => {
    return progress.reduce((sum, p) => {
      const habit = habits.find(h => h.id === p.habit_id);
      return sum + (habit && p.completed_count >= habit.target_count ? 1 : 0);
    }, 0);
  }, [habits, progress]);

  const streak = useMemo(() => {
    let currentStreak = 0;
    let date = new Date();
    
    while (currentStreak < 365) { // Max check 1 year
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayProgress = progress.filter(p => p.date === dateStr);
      
      const allCompleted = habits.length > 0 && habits.every(habit => {
        const habitProgress = dayProgress.find(p => p.habit_id === habit.id);
        return habitProgress && habitProgress.completed_count >= habit.target_count;
      });

      if (allCompleted) {
        currentStreak++;
        date = subDays(date, 1);
      } else {
        break;
      }
    }
    
    return currentStreak;
  }, [habits, progress]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streak} days</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Completions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompletions}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklyStats.reduce((sum, day) => sum + day.completed, 0)} / {weeklyStats.length * habits.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {habits.length > 0 ? Math.round((weeklyStats.reduce((sum, day) => sum + day.completed, 0) / (weeklyStats.length * habits.length)) * 100) : 0}% completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={chartType} onValueChange={setChartType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="line">Line Chart</SelectItem>
            <SelectItem value="pie">Pie Chart</SelectItem>
          </SelectContent>
        </Select>
        
        {chartType !== 'pie' && (
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {chartType === 'pie' ? 'Today\'s Progress' : `Habit Completion - ${timeRange === 'week' ? 'Last 7 Days' : 'Last 30 Days'}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' && (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
                {chartType === 'line' && (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Line type="monotone" dataKey="percentage" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                )}
                {chartType === 'pie' && pieData.length > 0 && (
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyStats.map((day) => (
                <div key={day.day} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${day.isToday ? 'font-semibold text-primary' : ''}`}>
                      {day.day}
                    </span>
                    {day.isToday && <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Today</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {day.completed} / {day.total}
                    </span>
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ 
                          width: `${day.total > 0 ? (day.completed / day.total) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HabitChart;