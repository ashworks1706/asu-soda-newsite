import { useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";

interface CalendarEvent {
  id: string;
  name: string;
  location: string;
  description: string | null;
  start: string;
  end: string;
  url?: string;
}

const generateDummyEvents = (baseDate: Date): CalendarEvent[] => {
  const monthStart = startOfMonth(baseDate);
  const monthEnd = endOfMonth(baseDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const dummyEvents: CalendarEvent[] = [];
  
  // Create 1-3 events for random days in the month
  for (let i = 0; i < 8; i++) {
    const eventDay = daysInMonth[Math.floor(Math.random() * daysInMonth.length)];
    const eventHour = 8 + Math.floor(Math.random() * 12); // Events between 8am and 8pm
    
    const startDate = new Date(eventDay);
    startDate.setHours(eventHour, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(eventHour + 1 + Math.floor(Math.random() * 2), 30, 0);
    
    dummyEvents.push({
      name: `Demo Event ${i + 1}`,
      location: `Location ${i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C'}`,
      description: `This is a placeholder event description for demo purposes. This would contain details about the event, its agenda, and other relevant information.`,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      id: ""
    });
  }
  
  return dummyEvents;
};
function EventsPhotoCarousel({setSelectedEvent}: { setSelectedEvent: (event: CalendarEvent | null) => void}) {

  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://api.thesoda.io/calendar/events");
      const data = await response.json();

      if (data?.status === "success" && Array.isArray(data.events)) {
        const formattedEvents = data.events.map((event: any) => ({
          id: event.id,
          name: event.title,
          location: event.location || "No location provided",
          description: event.description || "No description available",
          start: event.start,
          end: event.end,
          url: event.url,
        }));
        setEvents(formattedEvents);
      } else {
        console.log("No events found, using dummy data");
        setEvents(generateDummyEvents(currentDate));
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setEvents(generateDummyEvents(currentDate));
    } finally {
        setIsLoading(false);
      
    }
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentMonthStr = format(currentDate, 'MMMM yyyy');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOffset = monthStart.getDay();

  const calendarDays = [];
  for (let i = 0; i < startDayOffset; i++) {
    calendarDays.push(null);
  }
  calendarDays.push(...daysInMonth);

  const getEventsForDay = (day: Date | null) => {
    if (!day) return [];
    return events.filter(event => isSameDay(parseISO(event.start), day));
  };

  const isCurrentDay = (day: Date | null) => {
    if (!day) return false;
    return isSameDay(day, new Date());
  };

  return (
    <div className="dark cal-shadow md:mt-0 mt-14 md:mx-auto bg-[#ffffff0f] shadow-xl text-gray-300 px-12 pt-8 w-full rounded-lg">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-medium">{currentMonthStr}</h1>
         
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handlePrevMonth} className="hover:bg-[#373737] p-1 rounded">
            <ChevronLeft size={20} />
          </button>
          <button onClick={goToToday} className="hover:bg-[#373737] px-3 py-1 rounded">
            Today
          </button>
          <button onClick={handleNextMonth} className="hover:bg-[#373737] p-1 rounded">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px">
        {isLoading ? (
          <div className="col-span-7">
        <Skeleton className="dark fade-in w-[100%] min-h-[463px] bg-gray-300 rounded" />
          </div>
        ) : (
          <>
            {days.map(day => (
              <div key={day} className="p-2 text-sm text-gray-500">
                {day}
              </div>
            ))}
            {(() => {
              const totalCells = 42;
              const filledCalendarDays = [...calendarDays];
              while (filledCalendarDays.length < totalCells) {
                filledCalendarDays.push(null);
              }
              return filledCalendarDays.map((day, index) => {
                const dayEvents = day ? getEventsForDay(day) : [];
                const hasEvents = dayEvents.length > 0;
                return (
                  <div
                    key={index}
                    className={`w-full h-[70px] p-2 relative rounded-sm ${
                      isCurrentDay(day) ? '' : ''
                    } ${hasEvents ? 'bg-soda-blue hover:bg-blue-900 transition-all cursor-pointer' : ''}`}
                    onClick={() => hasEvents ? setSelectedEvent(dayEvents[0]) : null}
                  >
                    {day && (
                      <>
                        <span className="text-sm fade-in">{format(day, 'd')}</span>
                        <div className="overflow-y-auto">
                          {dayEvents.map((evt, eventIndex) => (
                            <div
                              key={eventIndex}
                              className="mt-1 fade-in rounded p-1 text-xs "
                            >
                              <div className="flex fade-in items-center gap-1 truncate">
                                <span className="truncate md:flex hidden">{evt.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              });
            })()}
          </>
        )}
      </div>
      
    </div>
  );
}

export default EventsPhotoCarousel;
