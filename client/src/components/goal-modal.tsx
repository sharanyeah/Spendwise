import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { localStorageMutation } from "@/lib/localStorageClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertGoal } from "@shared/schema";

interface GoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GOAL_ICONS = [
  { id: 'fas fa-laptop', name: 'Laptop' },
  { id: 'fas fa-car', name: 'Car' },
  { id: 'fas fa-home', name: 'House' },
  { id: 'fas fa-plane', name: 'Travel' },
  { id: 'fas fa-piggy-bank', name: 'Emergency Fund' },
  { id: 'fas fa-graduation-cap', name: 'Education' },
  { id: 'fas fa-ring', name: 'Wedding' },
  { id: 'fas fa-mobile-alt', name: 'Phone' },
  { id: 'fas fa-camera', name: 'Camera' },
  { id: 'fas fa-bullseye', name: 'General Goal' },
];

export default function GoalModal({ open, onOpenChange }: GoalModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    icon: 'fas fa-bullseye',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createGoal = useMutation({
    mutationFn: async (data: InsertGoal) => {
      return await localStorageMutation('POST', '/api/goals', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({
        title: "Goal created",
        description: "Your new goal has been set successfully.",
      });
      onOpenChange(false);
      setFormData({ name: '', targetAmount: '', currentAmount: '', icon: 'fas fa-bullseye' });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.targetAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createGoal.mutate({
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: formData.currentAmount ? parseFloat(formData.currentAmount) : 0,
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Default to 1 year from now
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="goal-modal">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Goal Name</Label>
            <Input
              id="name"
              placeholder="e.g., New Laptop"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              data-testid="goal-name-input"
              required
            />
          </div>

          <div>
            <Label htmlFor="icon">Icon</Label>
            <Select
              value={formData.icon}
              onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
            >
              <SelectTrigger data-testid="goal-icon-select">
                <SelectValue placeholder="Select icon" />
              </SelectTrigger>
              <SelectContent>
                {GOAL_ICONS.map((icon) => (
                  <SelectItem key={icon.id} value={icon.id}>
                    <div className="flex items-center">
                      <i className={`${icon.id} mr-2`}></i>
                      {icon.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="targetAmount">Target Amount (₹)</Label>
            <Input
              id="targetAmount"
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter target amount"
              value={formData.targetAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
              data-testid="goal-target-input"
              required
            />
          </div>

          <div>
            <Label htmlFor="currentAmount">Current Amount (₹) - Optional</Label>
            <Input
              id="currentAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter current saved amount"
              value={formData.currentAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))}
              data-testid="goal-current-input"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              data-testid="goal-cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createGoal.isPending}
              data-testid="goal-submit-button"
            >
              {createGoal.isPending ? "Creating..." : "Create Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
