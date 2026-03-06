export interface BookingsReport {
  total: number;
  completed: number;
  canceled: number;
  transferred: number;
  inProgress: number;
}

export interface BookingRealtimeReport {
  todayCount: number;
}
