import { DataInputs } from "@/components/forms/DataInputs"

export default function InputDataPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Input Data</h1>
          <p className="text-muted-foreground">
            Configure your Google Sheets CSV URLs and starting portfolio value for real-time dashboard updates.
          </p>
        </div>

        <DataInputs />
      </div>
    </div>
  )
}
