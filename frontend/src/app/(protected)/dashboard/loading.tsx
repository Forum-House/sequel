export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto" />
        <p className="text-xl font-heading font-bold">Loading Dashboard...</p>
      </div>
    </div>
  );
}
