import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Task {
  id: string;
  title: string;
  is_complete: boolean;
  created_at: string;
  user_id: string;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
    const subscription = supabase
      .channel('tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      toast.error('Error fetching tasks');
    } finally {
      setLoading(false);
    }
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const { error } = await supabase.from('tasks').insert([
        {
          title: newTask.trim(),
          is_complete: false,
        },
      ]);

      if (error) throw error;
      setNewTask('');
      toast.success('Task added successfully!');
    } catch (error) {
      toast.error('Error adding task');
    }
  }

  async function toggleTask(task: Task) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_complete: !task.is_complete })
        .eq('id', task.id);

      if (error) throw error;
      toast.success('Task updated!');
    } catch (error) {
      toast.error('Error updating task');
    }
  }

  async function deleteTask(id: string) {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      toast.success('Task deleted!');
    } catch (error) {
      toast.error('Error deleting task');
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={addTask} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center">Loading tasks...</div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleTask(task)}
                  className="text-gray-500 hover:text-indigo-600"
                >
                  {task.is_complete ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </button>
                <div>
                  <p
                    className={`text-lg ${
                      task.is_complete ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(task.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}