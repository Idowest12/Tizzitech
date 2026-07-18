import React from 'react';

// Main pulsing utility class for beautiful skeleton loads
export const SkeletonPulse: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse bg-neutral-900 rounded-md ${className || ''}`}
      {...props}
    />
  );
};

// Storefront Product Grid Card Skeleton Loader
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-transparent w-full">
      {/* Aspect Ratio 4:3 Image Box */}
      <div className="aspect-[4/3] bg-neutral-950/60 border border-neutral-900 border-b-0 relative flex items-center justify-center overflow-hidden">
        <SkeletonPulse className="w-full h-full rounded-none bg-neutral-900/60" />
        
        {/* Fake Tags */}
        <div className="absolute top-2 left-2 flex gap-2">
          <SkeletonPulse className="h-5 w-16 rounded-none bg-neutral-800" />
          <SkeletonPulse className="h-5 w-12 rounded-none bg-neutral-800" />
        </div>
        
        {/* Fake Heart */}
        <div className="absolute top-2 right-2">
          <SkeletonPulse className="h-8 w-8 rounded-full bg-neutral-800" />
        </div>
      </div>

      {/* Details Box */}
      <div className="flex flex-col space-y-3 p-4 bg-neutral-950/80 border border-neutral-900 border-t-0 flex-1 min-h-[160px]">
        {/* Brand & Name Row */}
        <div className="flex gap-2">
          <SkeletonPulse className="h-4 w-12 bg-neutral-800" />
          <SkeletonPulse className="h-4 flex-1 bg-neutral-800" />
        </div>

        {/* Description Lines */}
        <div className="space-y-2 flex-1">
          <SkeletonPulse className="h-3 w-full bg-neutral-900" />
          <SkeletonPulse className="h-3 w-4/5 bg-neutral-900" />
        </div>

        {/* Price & Buy Button Row */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-900/60 mt-auto">
          <SkeletonPulse className="h-6 w-24 bg-neutral-800" />
          <SkeletonPulse className="h-8 w-28 rounded-none bg-neutral-800" />
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard Top Stat Cards Skeleton Loader
export const DashboardStatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={idx} className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="space-y-2.5 flex-1">
              {/* Stat Title */}
              <SkeletonPulse className="h-3.5 w-2/3 bg-neutral-800" />
              {/* Stat Value */}
              <SkeletonPulse className="h-7 w-5/6 bg-neutral-800 mt-2" />
            </div>
            {/* Round Icon box */}
            <SkeletonPulse className="h-9 w-9 rounded-lg bg-neutral-900" />
          </div>
          {/* Footer Helper Text */}
          <SkeletonPulse className="h-3.5 w-1/2 bg-neutral-900 mt-4" />
        </div>
      ))}
    </div>
  );
};

// Admin Table Rows Skeleton Loader
interface TableRowsSkeletonProps {
  cols?: number;
  rows?: number;
}

export const TableRowsSkeleton: React.FC<TableRowsSkeletonProps> = ({ cols = 5, rows = 6 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="hover:bg-neutral-900/20 transition-colors">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} className="py-4 px-6">
              {cIdx === 0 ? (
                // Leading column usually has an image or main ID with subtitle
                <div className="flex items-center gap-4">
                  <SkeletonPulse className="h-11 w-11 rounded-lg bg-neutral-800 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <SkeletonPulse className="h-3.5 w-32 bg-neutral-800" />
                    <SkeletonPulse className="h-3 w-20 bg-neutral-900" />
                  </div>
                </div>
              ) : cIdx === cols - 1 ? (
                // Actions/align-right column
                <div className="flex justify-end">
                  <SkeletonPulse className="h-7 w-12 bg-neutral-900" />
                </div>
              ) : (
                // General text columns
                <div className="space-y-1">
                  <SkeletonPulse className={`h-3 w-20 bg-neutral-900 ${cIdx % 2 === 0 ? 'w-24' : 'w-16'}`} />
                </div>
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

// Recharts Area/Bar Chart Skeleton Loader
export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 mt-6 flex flex-col shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <SkeletonPulse className="h-5 w-24 bg-neutral-800" />
          <SkeletonPulse className="h-3 w-44 bg-neutral-900" />
        </div>
        <SkeletonPulse className="h-8 w-48 rounded-lg bg-neutral-900" />
      </div>

      {/* Simulated Chart Bars/Lines */}
      <div className="w-full mt-4 h-[350px] flex flex-col justify-between relative overflow-hidden">
        {/* Horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
          <div className="border-t border-neutral-900 w-full" />
          <div className="border-t border-neutral-900 w-full" />
          <div className="border-t border-neutral-900 w-full" />
          <div className="border-t border-neutral-900 w-full" />
          <div className="border-t border-neutral-900 w-full" />
        </div>

        {/* Pulsing bars mimicking chart columns */}
        <div className="flex items-end justify-between h-[280px] px-8 relative z-10 pt-10">
          <SkeletonPulse className="h-[40%] w-[5%] bg-neutral-900/80 rounded-t-sm" />
          <SkeletonPulse className="h-[25%] w-[5%] bg-neutral-900/80 rounded-t-sm" />
          <SkeletonPulse className="h-[60%] w-[5%] bg-neutral-900/80 rounded-t-sm" />
          <SkeletonPulse className="h-[35%] w-[5%] bg-neutral-900/80 rounded-t-sm" />
          <SkeletonPulse className="h-[75%] w-[5%] bg-neutral-900/80 rounded-t-sm" />
          <SkeletonPulse className="h-[90%] w-[5%] bg-neutral-900/80 rounded-t-sm" />
          <SkeletonPulse className="h-[55%] w-[5%] bg-neutral-900/80 rounded-t-sm" />
          <SkeletonPulse className="h-[65%] w-[5%] bg-neutral-900/80 rounded-t-sm" />
          <SkeletonPulse className="h-[80%] w-[5%] bg-neutral-900/80 rounded-t-sm" />
          <SkeletonPulse className="h-[85%] w-[5%] bg-neutral-900/80 rounded-t-sm" />
          <SkeletonPulse className="h-[95%] w-[5%] bg-neutral-900/80 rounded-t-sm" />
        </div>

        {/* X-Axis Labels Placeholders */}
        <div className="flex justify-between px-8 pt-4 border-t border-neutral-900">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'].map((mon) => (
            <SkeletonPulse key={mon} className="h-3 w-8 bg-neutral-900" />
          ))}
        </div>
      </div>
    </div>
  );
};
