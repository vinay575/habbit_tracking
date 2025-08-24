import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format, isToday, isFuture, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Plus, Minus, Calendar } from 'lucide-react';
import { deleteHabit, updateProgress } from '@/store/slices/habitSlice';
import HabitForm from './HabitForm';
import { useToast } from '@/hooks/use-toast';

const HabitCard = ({ habit }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { progress } = useSelector((state) => state.habits);
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayProgress = progress.find(p => p.habit_id === habit.id && p.date === today);
  const currentCount = todayProgress?.completed_count || 0;
  const progressPercentage = Math.min((currentCount / habit.target_count) * 100, 100);
  const isCompleted = currentCount >= habit.target_count;

  const handleDelete = async () => {
    try {
      await dispatch(deleteHabit(habit.id)).unwrap();
      toast({
        title: "Habit deleted",
        description: "The habit has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete habit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProgressUpdate = async (increment) => {
    const newCount = Math.max(0, currentCount + increment);
    
    try {
      await dispatch(updateProgress({
        habitId: habit.id,
        date: today,
        completedCount: newCount,
      })).unwrap();
      
      if (newCount >= habit.target_count && currentCount < habit.target_count) {
        toast({
          title: "Congratulations! 🎉",
          description: `You've completed your ${habit.name} goal for today!`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get the last 7 days of progress for mini chart
  const getRecentProgress = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayProgress = progress.find(p => p.habit_id === habit.id && p.date === dateStr);
      const completed = dayProgress ? dayProgress.completed_count >= habit.target_count : false;
      days.push({ date: dateStr, completed, isToday: dateStr === today });
    }
    return days;
  };

  const recentProgress = getRecentProgress();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: habit.color }}
              />
              {habit.name}
            </CardTitle>
            {habit.description && (
              <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isCompleted ? "default" : "secondary"}>
              {habit.frequency}
            </Badge>
            <HabitForm habit={habit} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Habit</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{habit.name}"? This action cannot be undone and will remove all associated progress data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span>Today's Progress</span>
            <span className="font-medium">
              {currentCount} / {habit.target_count}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleProgressUpdate(-1)}
              disabled={currentCount === 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="font-bold text-lg min-w-[3ch] text-center">
              {currentCount}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleProgressUpdate(1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {isCompleted && (
            <Badge className="bg-green-500">
              ✓ Completed
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Last 7 days</span>
          </div>
          <div className="flex gap-1">
            {recentProgress.map((day, index) => (
              <div
                key={day.date}
                className={`w-6 h-6 rounded-sm border-2 flex items-center justify-center text-xs font-medium transition-colors ${
                  day.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : day.isToday
                    ? 'border-primary bg-primary/10'
                    : 'border-muted bg-muted/30'
                }`}
                title={format(parseISO(day.date), 'MMM d')}
              >
                {day.completed && '✓'}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitCard;