export interface CalendarProps {
  initialDate?: Date;
  onChange?: (range: { start: Date; end: Date }) => void;
  renderDay?: (date: Date, hovered: boolean, isOutOfRange: boolean) => React.ReactNode;
  renderDayHead?: (date: Date, hovered: boolean, isOutOfRange: boolean) => React.ReactNode;
  daySlotMinHeight?: number;
}
