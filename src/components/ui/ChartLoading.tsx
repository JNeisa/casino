// src/components/ui/ChartLoading.tsx
export default function ChartLoading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-500 border-t-transparent"></div>
    </div>
  );
}