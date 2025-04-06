import LoginForm from '@/components/auth/LoginForm'

export default function Login() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">KryptonPad</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Log in to your account</p>
      </div>
      
      <LoginForm />
    </main>
  )
} 