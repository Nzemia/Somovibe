import {
  DashboardHeaderSkeleton,
  QuickActionsSkeleton,
  TableSkeleton,
  CardPairSkeleton,
} from "@/components/DashboardSkeleton";

export default function TeacherLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeaderSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <QuickActionsSkeleton rows={4} />
        </div>
        <CardPairSkeleton />
      </div>
      <TableSkeleton rows={5} cols={8} />
    </div>
  );
}
