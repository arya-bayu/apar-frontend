"use client"

import { useEffect, useState, HTMLAttributes } from "react"
import { CalendarIcon } from "@radix-ui/react-icons"
import { addDays, format, subMonths, subYears } from "date-fns"
import { DateRange } from "react-day-picker"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface CalendarRangeProps {
    className?: string
    onChange: (date: DateRange) => void
}
export function CalendarDateRangePicker({
    className,
    onChange,
}: CalendarRangeProps) {
    const [date, setDate] = useState<DateRange | undefined>({
      from: subMonths(new Date(), 12),
      to: new Date(),
    })
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [period, setPeriod] = useState<"lastMonth" | "lastYear" | undefined>("lastYear");

    useEffect(() => {
        setCalendarOpen(false);
        switch (period) {
            case "lastMonth":
                setDate({
                    from: subMonths(new Date(), 1),
                    to: new Date(),
                });
                break;
            case "lastYear":
                setDate({
                    from: subMonths(new Date(), 12),
                    to: new Date(),
                });
                break;
            default:
                break;
        }
    }, [period])

    useEffect(() => {
        date && onChange(date)
    }, [date])

    return (
        <div className={cn("grid gap-2", className)}>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pilih tanggal</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <div className="flex justify-center px-4 pt-4">
                        <Select
                            value={period}
                            onValueChange={(value: "lastMonth" | "lastYear") => setPeriod(value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih Periode" />
                            </SelectTrigger>
                            <SelectContent ref={(ref) => {
                            if (!ref) return;
                            ref.ontouchstart = (e) => {
                                e.preventDefault();
                            }
                            }}>
                                <SelectGroup>
                                    <SelectLabel>Periode</SelectLabel>
                                    <SelectItem value="lastMonth">Sebulan Terakhir</SelectItem>
                                    <SelectItem value="lastYear">Setahun Terakhir</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <Calendar
                        initialFocus
                        mode="range"
                        min={2}
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}