import CalendarView from '@/features/calendar/CalendarView';

export const metadata = {
  title: 'Calendar · AKPsi Outreach',
};

export default function CalendarPage() {
  return (
    <div className="h-full p-6">
      <CalendarView />
    </div>
  );
}
