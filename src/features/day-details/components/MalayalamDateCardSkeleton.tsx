import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MalayalamDateCardSkeleton() {
  return (
    <Card className="gap-4 rounded-md bg-accent-100 py-6">
      <CardContent className="flex flex-col gap-4">
        <Skeleton className="h-3 w-28" />
        <div className="flex gap-4">
          {[0, 1].map((idx) => (
            <div key={idx} className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
        <Skeleton className="h-4 w-40" />
      </CardContent>
    </Card>
  )
}
