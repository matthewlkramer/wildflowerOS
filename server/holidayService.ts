import fetch from 'node-fetch';

interface GoogleCalendarEvent {
  summary: string;
  start: {
    date: string;
  };
  end: {
    date: string;
  };
}

interface HolidayPeriod {
  name: string;
  startDate: Date;
  endDate: Date;
  duration: number; // days
}

interface GoogleCalendarResponse {
  items: GoogleCalendarEvent[];
}

export class HolidayService {
  private apiKey: string;
  private holidayCalendarId = 'en.usa%23holiday@group.v.calendar.google.com';

  constructor() {
    this.apiKey = process.env.GOOGLE_CALENDAR_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Google Calendar API key not found. Holiday dates will use approximations.');
    }
  }

  async getHolidaysForYear(year: number): Promise<Map<string, HolidayPeriod>> {
    if (!this.apiKey) {
      console.log(`No API key found, using fallback holidays for ${year}`);
      return this.getFallbackHolidays(year);
    }

    try {
      // Get holidays for the academic year (July 1 to June 30 next year)
      const timeMin = `${year}-07-01T00:00:00Z`;
      const timeMax = `${year + 1}-06-30T23:59:59Z`;
      
      console.log(`Fetching holidays from Google Calendar for academic year ${year}-${year + 1}`);
      
      const url = `https://www.googleapis.com/calendar/v3/calendars/${this.holidayCalendarId}/events?` +
        `key=${this.apiKey}&` +
        `timeMin=${timeMin}&` +
        `timeMax=${timeMax}&` +
        `singleEvents=true&` +
        `orderBy=startTime`;

      const response = await fetch(url);
      if (!response.ok) {
        console.error('Google Calendar API error:', response.status, response.statusText);
        return this.getFallbackHolidays(year);
      }

      const data = await response.json() as GoogleCalendarResponse;
      console.log(`Found ${data.items.length} events from Google Calendar for ${year}`);
      return this.parseGoogleCalendarHolidays(data.items, year);
    } catch (error) {
      console.error('Error fetching holidays from Google Calendar:', error);
      return this.getFallbackHolidays(year);
    }
  }

  private parseGoogleCalendarHolidays(events: GoogleCalendarEvent[], year: number): Map<string, HolidayPeriod> {
    const holidays = new Map<string, HolidayPeriod>();

    for (const event of events) {
      const startDate = new Date(event.start.date);
      const endDate = new Date(event.end.date);
      const summary = event.summary.toLowerCase();
      
      // Calculate duration in days
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Map Google Calendar holiday names to our system names with more comprehensive matching
      if (summary.includes('labor day')) {
        holidays.set('Labor Day', { name: 'Labor Day', startDate, endDate, duration });
      } else if (summary.includes('indigenous peoples') || summary.includes('columbus day')) {
        holidays.set('Indigenous Peoples Day', { name: 'Indigenous Peoples Day', startDate, endDate, duration });
      } else if (summary.includes('veterans day')) {
        holidays.set('Veterans Day', { name: 'Veterans Day', startDate, endDate, duration });
      } else if (summary.includes('thanksgiving')) {
        holidays.set('Thanksgiving', { name: 'Thanksgiving', startDate, endDate, duration });
      } else if (summary.includes('martin luther king') || summary.includes('mlk')) {
        holidays.set('MLK Day', { name: 'MLK Day', startDate, endDate, duration });
      } else if (summary.includes('presidents') && summary.includes('day')) {
        holidays.set('Presidents Day', { name: 'Presidents Day', startDate, endDate, duration });
      } else if (summary.includes('good friday')) {
        holidays.set('Good Friday', { name: 'Good Friday', startDate, endDate, duration });
      } else if (summary.includes('memorial day')) {
        holidays.set('Memorial Day', { name: 'Memorial Day', startDate, endDate, duration });
      } else if (summary.includes('juneteenth')) {
        holidays.set('Juneteenth', { name: 'Juneteenth', startDate, endDate, duration });
      } else if (summary.includes('rosh hashanah')) {
        holidays.set('Rosh Hashanah', { name: 'Rosh Hashanah', startDate, endDate, duration });
      } else if (summary.includes('yom kippur')) {
        holidays.set('Yom Kippur', { name: 'Yom Kippur', startDate, endDate, duration });
      } else if (summary.includes('eid')) {
        holidays.set('Eid', { name: 'Eid', startDate, endDate, duration });
      }
    }
    
    // Add Winter Break manually since it's not a single holiday in Google Calendar
    // Winter Break: December 23 to December 31 (9 days)
    const winterBreakStart = new Date(year, 11, 23); // December 23
    const winterBreakEnd = new Date(year, 11, 31);   // December 31
    holidays.set('Winter Break', { 
      name: 'Winter Break', 
      startDate: winterBreakStart, 
      endDate: winterBreakEnd, 
      duration: 9 
    });

    console.log(`Parsed ${holidays.size} holidays for year ${year}`);
    return holidays;
  }

  private getFallbackHolidays(year: number): Map<string, HolidayPeriod> {
    const holidays = new Map<string, HolidayPeriod>();

    // Define holidays with their typical durations
    const holidayDefinitions = [
      {
        name: 'Labor Day',
        startDate: this.getFirstMondayOfMonth(year, 8),
        duration: 1
      },
      {
        name: 'Rosh Hashanah', 
        startDate: new Date(year, 8, 15), // Approximate
        duration: 2 // 2-day holiday
      },
      {
        name: 'Yom Kippur',
        startDate: new Date(year, 8, 25), // Approximate
        duration: 1
      },
      {
        name: 'Indigenous Peoples Day',
        startDate: this.getNthMondayOfMonth(year, 9, 2),
        duration: 1
      },
      {
        name: 'Veterans Day',
        startDate: new Date(year, 10, 11),
        duration: 1
      },
      {
        name: 'Thanksgiving',
        startDate: this.getNthThursdayOfMonth(year, 10, 4),
        duration: 2 // Thursday + Friday
      },
      {
        name: 'Winter Break',
        startDate: new Date(year, 11, 23), // December 23
        duration: 9 // December 23 - December 31 (9 days)
      },
      {
        name: 'MLK Day',
        startDate: this.getNthMondayOfMonth(year + 1, 0, 3),
        duration: 1
      },
      {
        name: 'Presidents Day',
        startDate: this.getNthMondayOfMonth(year + 1, 1, 3),
        duration: 1
      },
      {
        name: 'Good Friday',
        startDate: this.calculateEasterFriday(year + 1),
        duration: 1
      },
      {
        name: 'Eid',
        startDate: new Date(year + 1, 3, 10), // Approximate
        duration: 1 // Can vary, but typically 1-2 days
      },
      {
        name: 'Memorial Day',
        startDate: this.getLastMondayOfMonth(year + 1, 4),
        duration: 1
      },
      {
        name: 'Juneteenth',
        startDate: new Date(year + 1, 5, 19),
        duration: 1
      }
    ];

    for (const holiday of holidayDefinitions) {
      const endDate = new Date(holiday.startDate);
      endDate.setDate(endDate.getDate() + holiday.duration - 1);
      
      holidays.set(holiday.name, {
        name: holiday.name,
        startDate: holiday.startDate,
        endDate: endDate,
        duration: holiday.duration
      });
    }

    return holidays;
  }

  private calculateEasterFriday(year: number): Date {
    // Simple Easter calculation (Gregorian calendar)
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    
    // Good Friday is 2 days before Easter
    const easter = new Date(year, month - 1, day);
    const goodFriday = new Date(easter);
    goodFriday.setDate(easter.getDate() - 2);
    
    return goodFriday;
  }

  private getFirstMondayOfMonth(year: number, month: number): Date {
    const date = new Date(year, month, 1);
    const day = date.getDay();
    const daysToAdd = day === 0 ? 1 : (8 - day);
    return new Date(year, month, 1 + daysToAdd);
  }

  private getNthMondayOfMonth(year: number, month: number, n: number): Date {
    const firstMonday = this.getFirstMondayOfMonth(year, month);
    return new Date(firstMonday.getTime() + (n - 1) * 7 * 24 * 60 * 60 * 1000);
  }

  private getNthThursdayOfMonth(year: number, month: number, n: number): Date {
    const date = new Date(year, month, 1);
    const day = date.getDay();
    const daysToAdd = day === 0 ? 4 : (4 - day + 7) % 7;
    const firstThursday = new Date(year, month, 1 + daysToAdd);
    return new Date(firstThursday.getTime() + (n - 1) * 7 * 24 * 60 * 60 * 1000);
  }

  private getLastMondayOfMonth(year: number, month: number): Date {
    const lastDay = new Date(year, month + 1, 0);
    const day = lastDay.getDay();
    const daysToSubtract = day === 1 ? 0 : (day === 0 ? 6 : day - 1);
    return new Date(lastDay.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);
  }
}