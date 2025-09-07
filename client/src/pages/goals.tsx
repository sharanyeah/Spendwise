import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/currency";
import { localStorageMutation } from "@/lib/localStorageClient";
import { useToast } from "@/hooks/use-toast";
import GoalModal from "@/components/goal-modal";
import type { Goal } from "@shared/schema";

export default function Goals() {
  const [goalModal, setGoalModal] = useState(false);
  const [updateModal, setUpdateModal] = useState<{ open: boolean; goal?: Goal }>({ open: false });
  const [updateAmount, setUpdateAmount] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      await localStorageMutation('DELETE', `/api/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({
        title: "Goal deleted",
        description: "Goal has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, currentAmount }: { id: string; currentAmount: number }) => {
      return await localStorageMutation('PATCH', `/api/goals/${id}`, { currentAmount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({
        title: "Goal updated",
        description: "Your progress has been saved successfully.",
      });
      setUpdateModal({ open: false });
      setUpdateAmount('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const openUpdateModal = (goal: Goal) => {
    setUpdateModal({ open: true, goal });
    setUpdateAmount(goal.currentAmount);
  };

  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateModal.goal || !updateAmount) return;
    
    updateGoal.mutate({
      id: updateModal.goal.id,
      currentAmount: parseFloat(updateAmount),
    });
  };

  return (
    <div className="min-h-screen">
      <header className="bg-card border-b border-border px-8 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">Financial Goals</h1>
            <p className="text-base text-muted-foreground mt-1">Set targets and track your savings progress</p>
          </div>
          <Button 
            onClick={() => setGoalModal(true)}
            data-testid="add-goal-button"
          >
            <i className="fas fa-plus mr-2"></i>
            Create Goal
          </Button>
        </div>
      </header>

      <div className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-2 bg-muted rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-muted rounded w-20"></div>
                    <div className="h-4 bg-muted rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-bullseye text-4xl text-muted-foreground mb-4"></i>
            <p className="text-xl font-semibold mb-2">No goals set yet</p>
            <p className="text-base text-muted-foreground mb-4">
              Create financial goals to track your progress and stay motivated
            </p>
            <Button onClick={() => setGoalModal(true)} data-testid="create-first-goal">
              <i className="fas fa-plus mr-2"></i>
              Create Your First Goal
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="goals-grid">
            {goals.map((goal) => {
              const progress = (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100;
              const isCompleted = progress >= 100;
              
              return (
                <Card key={goal.id} className={`${isCompleted ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <i className={`${goal.icon} text-primary text-xl`}></i>
                        <div>
                          <h3 className="font-semibold">{goal.name}</h3>
                          {isCompleted && (
                            <span className="text-xs text-primary font-medium">✓ Completed</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGoal.mutate(goal.id)}
                        disabled={deleteGoal.isPending}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        data-testid={`delete-goal-${goal.id}`}
                      >
                        <i className="fas fa-trash text-sm"></i>
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all ${isCompleted ? 'bg-primary' : 'bg-primary'}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatCurrency(goal.currentAmount)}</span>
                        <span>{formatCurrency(goal.targetAmount)}</span>
                      </div>
                      
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUpdateModal(goal)}
                          className="w-full"
                          data-testid={`update-goal-${goal.id}`}
                        >
                          <i className="fas fa-edit mr-2"></i>
                          Update Progress
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <GoalModal 
        open={goalModal} 
        onOpenChange={setGoalModal} 
      />

      <Dialog open={updateModal.open} onOpenChange={(open) => setUpdateModal({ open })}>
        <DialogContent className="sm:max-w-md" data-testid="update-goal-modal">
          <DialogHeader>
            <DialogTitle>Update Goal Progress</DialogTitle>
          </DialogHeader>
          
          {updateModal.goal && (
            <form onSubmit={handleUpdateGoal} className="space-y-4">
              <div>
                <Label>Goal: {updateModal.goal.name}</Label>
                <p className="text-sm text-muted-foreground">
                  Target: {formatCurrency(updateModal.goal.targetAmount)}
                </p>
              </div>

              <div>
                <Label htmlFor="currentAmount">Current Saved Amount (₹)</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  max={parseFloat(updateModal.goal.targetAmount)}
                  value={updateAmount}
                  onChange={(e) => setUpdateAmount(e.target.value)}
                  data-testid="update-amount-input"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUpdateModal({ open: false })}
                  className="flex-1"
                  data-testid="update-goal-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={updateGoal.isPending}
                  data-testid="update-goal-submit"
                >
                  {updateGoal.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
