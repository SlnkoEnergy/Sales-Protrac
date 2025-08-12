import React, { createContext, useContext, useEffect, useState } from "react";
import { startOfDay, subDays, subMonths, subYears } from "date-fns";

interface DateRangeType {
  startDate: Date;
  endDate: Date;
  key: string;
}

interface FilterItem {
  label: string;
  range: (() => [Date, Date]) | null;
}

interface DateFilterContextType {
  selectedFilter: string;
  setSelectedFilter: (label: string) => void;
  dateRange: DateRangeType[];
  setDateRange: React.Dispatch<React.SetStateAction<DateRangeType[]>>;
  showPicker: boolean;
  setShowPicker: React.Dispatch<React.SetStateAction<boolean>>;
  filters: FilterItem[];
}

const filters: FilterItem[] = [
  { label: "Today", range: () => [startOfDay(new Date()), new Date()] },
  { label: "1 Week", range: () => [subDays(new Date(), 7), new Date()] },
  { label: "1 Month", range: () => [subMonths(new Date(), 1), new Date()] },
  { label: "3 Months", range: () => [subMonths(new Date(), 3), new Date()] },
  { label: "6 Months", range: () => [subMonths(new Date(), 6), new Date()] },
  { label: "9 Months", range: () => [subMonths(new Date(), 9), new Date()] },
  { label: "1 Year", range: () => [subYears(new Date(), 1), new Date()] },
  { label: "Custom", range: null },
];

const DateFilterContext = createContext<DateFilterContextType | undefined>(
  undefined
);

export const DateFilterProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedFilter, _setSelectedFilter] = useState("1 Year");
  const [dateRange, setDateRange] = useState<DateRangeType[]>([
    {
      startDate: startOfDay(new Date()),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [showPicker, setShowPicker] = useState(false);

  const setSelectedFilter = (label: string) => {
    _setSelectedFilter(label);

    if (label === "Custom") {
      setShowPicker(true);
    } else {
      const selected = filters.find((f) => f.label === label);
      if (selected && selected.range) {
        const [startDate, endDate] = selected.range();
        setDateRange([{ startDate, endDate, key: "selection" }]);
        setShowPicker(false);
      }
    }
  };

  useEffect(() => {
    setSelectedFilter("1 Year");
  }, []);

  return (
    <DateFilterContext.Provider
      value={{
        selectedFilter,
        setSelectedFilter,
        dateRange,
        setDateRange,
        showPicker,
        setShowPicker,
        filters,
      }}
    >
      {children}
    </DateFilterContext.Provider>
  );
};

export const useDateFilter = (): DateFilterContextType => {
  const context = useContext(DateFilterContext);
  if (!context) {
    throw new Error("useDateFilter must be used within a DateFilterProvider");
  }
  return context;
};
