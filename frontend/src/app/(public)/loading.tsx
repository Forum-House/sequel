export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xl font-heading font-bold">Loading...</p>
      </div>
    </div>
  );
}
