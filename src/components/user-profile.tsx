import type { Session } from "@/hooks/use-auth";

interface UserProfileProps {
  session: Session;
  onLogout: () => void;
}

export function UserProfile({ session, onLogout }: UserProfileProps) {
  return (
    <div className="flex flex-col items-center gap-8 max-w-2xl w-full">
      <h1 className="text-4xl font-bold">Spotify C&C</h1>
      <div className="w-full bg-white rounded-lg shadow-lg p-8 border">
        <div className="flex items-center gap-4 mb-6">
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h2 className="text-2xl font-semibold">{session.user.name}</h2>
            <p className="text-gray-600">{session.user.email}</p>
          </div>
        </div>
        <div className="border-t pt-4 space-y-2">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">User ID:</span> {session.user.id}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Email Verified:</span>{" "}
            {session.user.emailVerified ? "Yes" : "No"}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Account Created:</span>{" "}
            {new Date(session.user.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={onLogout}
          type="button"
          className="mt-6 w-full rounded-lg bg-red-600 px-8 py-3 text-white font-semibold hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
