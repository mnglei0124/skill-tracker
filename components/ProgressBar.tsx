interface ProgressBarProps {
  progress: number; // Percentage from 0 to 100
  color?: string; // Optional: Tailwind CSS color class (e.g., 'bg-blue-500')
  height?: string; // Optional: Tailwind CSS height class (e.g., 'h-2')
}

export default function ProgressBar({
  progress,
  color = "bg-indigo-600",
  height = "h-2.5",
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div
      className={`w-full bg-gray-200 rounded-full ${height} dark:bg-gray-700 overflow-hidden`}
    >
      <div
        className={`${color} ${height} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${clampedProgress}%` }}
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
        aria-label="Skill progress"
      ></div>
    </div>
  );
}
