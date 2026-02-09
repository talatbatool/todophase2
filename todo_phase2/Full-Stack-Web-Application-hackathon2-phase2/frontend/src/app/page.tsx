import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100">
          Welcome to TodoApp
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
          The simplest way to manage your daily tasks.
        </p>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/sign-up">Sign Up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}