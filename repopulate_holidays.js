const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Helper methods for date calculations
function getFirstMondayOfMonth(year, month) {
  const date = new Date(year, month, 1);
  const day = date.getDay();
  const daysToAdd = day === 0 ? 1 : (8 - day);
  return new Date(year, month, 1 + daysToAdd);
}

function getNthMondayOfMonth(year, month, n) {
  const firstMonday = getFirstMondayOfMonth(year, month);
  return new Date(firstMonday.getTime() + (n - 1) * 7 * 24 * 60 * 60 * 1000);
}

function getNthThursdayOfMonth(year, month, n) {
  const date = new Date(year, month, 1);
  const day = date.getDay();
  const daysToAdd = day === 0 ? 4 : (4 - day + 7) % 7;
  const firstThursday = new Date(year, month, 1 + daysToAdd);
  return new Date(firstThursday.getTime() + (n - 1) * 7 * 24 * 60 * 60 * 1000);
}

function getLastMondayOfMonth(year, month) {
  const lastDay = new Date(year, month + 1, 0);
  const day = lastDay.getDay();
  const daysToSubtract = day === 1 ? 0 : (day === 0 ? 6 : day - 1);
  return new Date(lastDay.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);
}

async function createNetworkDefaultHolidays(schoolYear) {
  // Get system holiday rules (templates)
  const systemHolidaysResult = await pool.query(`
    SELECT * FROM calendar_closures 
    WHERE network_default = true 
      AND active = true
      AND school_year_id IS NULL 
      AND school_id IS NULL
  `);
  
  const systemHolidays = systemHolidaysResult.rows;
  const startDate = new Date(schoolYear.start_date);
  const year = startDate.getFullYear();
  
  console.log(`Creating holidays for ${schoolYear.name} (${year})`);
  
  // Create network default holidays for this specific year
  const holidayPromises = systemHolidays.map(async (holiday) => {
    let holidayDate = null;
    
    // Convert rules to specific dates for this school year
    if (holiday.rule || holiday.name) {
      if (holiday.name.includes('Labor Day')) {
        // First Monday in September
        holidayDate = getFirstMondayOfMonth(year, 8);
      } else if (holiday.name.includes('Indigenous Peoples')) {
        // Second Monday in October 
        holidayDate = getNthMondayOfMonth(year, 9, 2);
      } else if (holiday.name.includes('Veterans Day')) {
        holidayDate = new Date(year, 10, 11); // November 11
      } else if (holiday.name.includes('Thanksgiving')) {
        // Fourth Thursday in November
        holidayDate = getNthThursdayOfMonth(year, 10, 4);
      } else if (holiday.name.includes('Winter Break')) {
        holidayDate = new Date(year, 11, 23); // December 23
      } else if (holiday.name.includes('MLK')) {
        // Third Monday in January (next year)
        holidayDate = getNthMondayOfMonth(year + 1, 0, 3);
      } else if (holiday.name.includes('Presidents')) {
        // Third Monday in February (next year)
        holidayDate = getNthMondayOfMonth(year + 1, 1, 3);
      } else if (holiday.name.includes('Good Friday')) {
        // Easter calculation - simplified to approximate
        holidayDate = new Date(year + 1, 3, 15); // Approximate April 15
      } else if (holiday.name.includes('Memorial Day')) {
        // Last Monday in May (next year)
        holidayDate = getLastMondayOfMonth(year + 1, 4);
      } else if (holiday.name.includes('Juneteenth')) {
        holidayDate = new Date(year + 1, 5, 19); // June 19 (next year)
      } else if (holiday.name.includes('Rosh Hashanah')) {
        // Approximate date for Rosh Hashanah (usually September/October)
        holidayDate = new Date(year, 8, 15); // September 15 (approximate)
      } else if (holiday.name.includes('Yom Kippur')) {
        // Approximate date for Yom Kippur (10 days after Rosh Hashanah)
        holidayDate = new Date(year, 8, 25); // September 25 (approximate)
      } else if (holiday.name.includes('Eid')) {
        // Eid can occur twice a year, using approximate spring date
        holidayDate = new Date(year + 1, 3, 10); // April 10 (approximate)
      }
    } else {
      // For holidays without rules, create approximate dates based on name
      if (holiday.name.includes('Rosh Hashanah')) {
        holidayDate = new Date(year, 8, 15); // September 15
      } else if (holiday.name.includes('Yom Kippur')) {
        holidayDate = new Date(year, 8, 25); // September 25
      } else if (holiday.name.includes('Eid')) {
        holidayDate = new Date(year + 1, 3, 10); // April 10
      }
    }
    
    if (holidayDate) {
      console.log(`  Creating ${holiday.name} on ${holidayDate.toISOString().split('T')[0]}`);
      return pool.query(`
        INSERT INTO calendar_closures (name, description, rule, date, network_default, school_id, school_year_id, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        holiday.name,
        holiday.description,
        holiday.rule,
        holidayDate,
        true,
        null, // Network defaults
        schoolYear.id, // Link to the network school year
        true
      ]);
    }
  });
  
  await Promise.all(holidayPromises.filter(p => p));
}

async function main() {
  try {
    // Get all network school years
    const schoolYearsResult = await pool.query(`
      SELECT id, name, start_date, end_date 
      FROM school_years 
      WHERE network_default = true 
      ORDER BY start_date
    `);
    
    for (const schoolYear of schoolYearsResult.rows) {
      await createNetworkDefaultHolidays(schoolYear);
    }
    
    console.log('Holiday repopulation complete!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

main();
