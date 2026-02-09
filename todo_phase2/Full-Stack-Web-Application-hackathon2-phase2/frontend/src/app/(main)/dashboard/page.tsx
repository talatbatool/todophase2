'use client';

import { useEffect, useState } from 'react';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, LogOut, CheckCircle2, Pencil, Save, X } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description?: string;
  is_completed: boolean;
}

const DashboardPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const { logout } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks/');
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to fetch tasks.');
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      toast.error('Task title cannot be empty.');
      return;
    }
    try {
      const response = await api.post('/tasks/', { title: newTaskTitle });
      setTasks([...tasks, response.data]);
      setNewTaskTitle('');
      toast.success('Task added!');
    } catch (error) {
      toast.error('Failed to add task.');
    }
  };

  const toggleTaskCompletion = async (task: Task) => {
    try {
      const updatedTask = { ...task, is_completed: !task.is_completed };
      await api.put(`/tasks/${task.id}`, { is_completed: updatedTask.is_completed });
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t.id !== taskId));
      toast.success('Task deleted.');
    } catch (error) {
      toast.error('Failed to delete task.');
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditTitle('');
  };

  const saveEdit = async (taskId: number) => {
    if (!editTitle.trim()) return;
    try {
        const response = await api.put(`/tasks/${taskId}`, { title: editTitle });
        setTasks(tasks.map((t) => (t.id === taskId ? response.data : t)));
        setEditingTaskId(null);
        toast.success('Task updated successfully!');
    } catch (error) {
        toast.error('Failed to update task.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
      
      <header className="sticky top-0 z-10 flex justify-between items-center px-6 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">TaskFlow</h1>
        </div>
        <Button onClick={logout} variant="ghost" className="hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </header>

      <main className="p-4 md:p-8 max-w-4xl mx-auto">
        <Card className="border-none shadow-xl rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur">
          <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                My Tasks ({tasks.filter(t => !t.is_completed).length} remaining)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            
            <form onSubmit={handleAddTask} className="flex gap-3 mb-8">
              <Input 
                placeholder="What needs to be done?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="h-12 text-lg px-4 border-gray-200 focus-visible:ring-indigo-500 rounded-xl"
              />
              <Button type="submit" className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg">
                Add Task
              </Button>
            </form>

            <ul className="space-y-3">
              {tasks.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                    <p>No tasks yet. Add one above! 🚀</p>
                </div>
              )}
              
              {tasks.map((task) => (
                <li 
                  key={task.id} 
                  className={`
                    group flex items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-200
                    ${task.is_completed 
                        ? 'bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-700 opacity-75' 
                        : 'bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600 shadow-sm hover:shadow-md hover:border-indigo-200'
                    }
                  `}
                >
                  {editingTaskId === task.id ? (
                      <div className="flex w-full gap-2 items-center animate-in fade-in zoom-in-95 duration-200">
                          <Input 
                              value={editTitle} 
                              onChange={(e) => setEditTitle(e.target.value)} 
                              className="h-10 text-lg bg-white dark:bg-gray-800"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(task.id);
                                if (e.key === 'Escape') cancelEditing();
                              }}
                          />
                          <Button size="icon" onClick={() => saveEdit(task.id)} className="bg-green-600 hover:bg-green-700 text-white h-10 w-10 shrink-0">
                              <Save className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={cancelEditing} className="h-10 w-10 shrink-0 hover:bg-red-50 hover:text-red-600">
                              <X className="h-4 w-4" />
                          </Button>
                      </div>
                  ) : (
                      <>
                        <div className="flex items-center gap-4 flex-grow">
                            <div className="flex-shrink-0">
                                <Checkbox
                                checked={task.is_completed}
                                onCheckedChange={() => toggleTaskCompletion(task)}
                                id={`task-${task.id}`}
                                className="h-6 w-6 border-2 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                />
                            </div>
                            
                            <label 
                            htmlFor={`task-${task.id}`}
                            className={`text-lg cursor-pointer select-none transition-all ${
                                task.is_completed 
                                ? 'line-through text-gray-400 decoration-2' 
                                : 'text-gray-700 dark:text-gray-100 font-medium'
                            }`}
                            >
                            {task.title}
                            </label>
                        </div>

                        {/* ✅ FIX: Removed opacity classes, now buttons are always visible */}
                        <div className="flex gap-1">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => startEditing(task)}
                                className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>

                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                      </>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default withAuth(DashboardPage);