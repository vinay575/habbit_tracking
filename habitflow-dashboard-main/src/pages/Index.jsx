import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import HabitDashboard from '@/components/HabitDashboard';

const Index = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // If user is authenticated, show the dashboard
  if (user) {
    return <HabitDashboard />;
  }

  // If not authenticated, show landing page
  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-border/50">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            HabitFlow
          </CardTitle>
          <CardDescription>
            Track your habits, build better routines, and achieve your goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 text-center">
            <div className="text-4xl">🎯</div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Start Your Journey</h3>
              <p className="text-sm text-muted-foreground">
                Create habits, track progress, and visualize your success with beautiful charts and insights.
              </p>
            </div>
          </div>
          <Button className="w-full" size="lg" onClick={handleGetStarted}>
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;