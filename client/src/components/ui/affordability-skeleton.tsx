
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AffordabilitySkeleton() {
  return (
    <div className="space-y-8">
      <Card className="p-8 space-y-6 min-h-[540px]">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-48" />
        </div>
        <Skeleton className="h-6 w-full max-w-[500px]" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-8">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="space-y-6">
              <div>
                <Skeleton className="h-6 w-24 mb-4" />
                <Skeleton className="h-8 w-32" />
              </div>
              <div>
                <Skeleton className="h-6 w-24 mb-4" />
                <Skeleton className="h-8 w-32" />
              </div>
              <div>
                <Skeleton className="h-6 w-24 mb-4" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
