export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-6xl font-bold mb-4 text-gray-800">404</h1>
      <p className="text-xl mb-6 text-gray-600">Page Not Found</p>
      <a
        href="/"
        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
      >
        Back Home
      </a>
    </div>
  );
}
