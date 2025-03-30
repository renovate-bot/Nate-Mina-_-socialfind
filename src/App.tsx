import React, { useEffect, useState } from 'react';
import { Auth } from './components/Auth';
import { TaskList } from './components/TaskList';
import { supabase } from './lib/supabase';
import { Toaster } from 'react-hot-toast';
import { LogOut } from 'lucide-react';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <Toaster position="top-right" />
      {!session ? (
        <Auth />
      ) : (
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">Task Manager</h1>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </nav>
          <main className="py-10">
            <TaskList />
          </main>
        </div>
      )}
    </>
  );
}

export default App;