interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="flex flex-col items-center gap-8">
      <h1 className="text-4xl font-bold">Spotify C&C</h1>
      <p className="text-xl text-gray-600">Compare and Conquer</p>
      <button
        onClick={onLogin}
        type="button"
        className="rounded-lg bg-green-600 px-8 py-3 text-white font-semibold hover:bg-green-700 transition-colors"
      >
        Login with Spotify
      </button>
    </div>
  );
}
