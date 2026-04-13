import { Button } from "../ui/button";
import { ADMIN_DATE_RANGE_OPTIONS, AdminDateRange } from "../../lib/admin-date-range";

interface AdminDateRangeFilterProps {
  value: AdminDateRange;
  onChange: (value: AdminDateRange) => void;
}

export function AdminDateRangeFilter({ value, onChange }: AdminDateRangeFilterProps) {
  return (
    <div className="inline-flex items-center gap-2 flex-wrap">
      {ADMIN_DATE_RANGE_OPTIONS.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "primary" : "outline"}
          size="sm"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
