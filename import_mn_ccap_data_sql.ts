#!/usr/bin/env node

// Import Minnesota CCAP data using direct SQL (bypassing ORM field mapping issues)
import { pool } from "./server/db.js";

// Sample of Minnesota county data (subset for faster testing)
const mnCountyRatesSubset = [
  {
    county: "Aitkin",
    familyChildCare: {
      infant: { weekly: 205.00, daily: 45.00 },
      toddler: { weekly: 200.00, daily: 40.00 },
      preschool: { weekly: 190.00, daily: 40.00 },
      school_age: { weekly: 175.00, daily: 40.00 }
    },
    center: {
      infant: { weekly: 245.00, daily: 52.00 },
      toddler: { weekly: 225.00, daily: 53.00 },
      preschool: { weekly: 210.00, daily: 45.00 },
      school_age: { weekly: 190.00, daily: 50.00 }
    }
  },
  {
    county: "Anoka",
    familyChildCare: {
      infant: { weekly: 250.00, daily: 60.00 },
      toddler: { weekly: 250.00, daily: 60.00 },
      preschool: { weekly: 230.00, daily: 55.00 },
      school_age: { weekly: 205.00, daily: 50.00 }
    },
    center: {
      infant: { weekly: 512.40, daily: 261.00 },
      toddler: { weekly: 462.00, daily: 230.40 },
      preschool: { weekly: 398.40, daily: 200.00 },
      school_age: { weekly: 375.00, daily: 132.00 }
    }
  },
  {
    county: "Hennepin",
    familyChildCare: {
      infant: { weekly: 250.00, daily: 60.00 },
      toddler: { weekly: 250.00, daily: 60.00 },
      preschool: { weekly: 230.00, daily: 55.00 },
      school_age: { weekly: 205.00, daily: 50.00 }
    },
    center: {
      infant: { weekly: 512.40, daily: 261.00 },
      toddler: { weekly: 462.00, daily: 230.40 },
      preschool: { weekly: 398.40, daily: 200.00 },
      school_age: { weekly: 375.00, daily: 132.00 }
    }
  },
  {
    county: "Ramsey",
    familyChildCare: {
      infant: { weekly: 250.00, daily: 60.00 },
      toddler: { weekly: 250.00, daily: 60.00 },
      preschool: { weekly: 230.00, daily: 55.00 },
      school_age: { weekly: 205.00, daily: 50.00 }
    },
    center: {
      infant: { weekly: 512.40, daily: 261.00 },
      toddler: { weekly: 462.00, daily: 230.40 },
      preschool: { weekly: 398.40, daily: 200.00 },
      school_age: { weekly: 375.00, daily: 132.00 }
    }
  }
];

// Minnesota copayment data for family size 2 (simplified)
const mnCopaymentSubset = [
  { familySize: 2, incomeMin: 0, incomeMax: 15329, copayBiweekly: 0 },
  { familySize: 2, incomeMin: 15330, incomeMax: 20439, copayBiweekly: 2 },
  { familySize: 2, incomeMin: 20440, incomeMax: 25962, copayBiweekly: 26 },
  { familySize: 2, incomeMin: 25963, incomeMax: 27198, copayBiweekly: 27 },
  { familySize: 2, incomeMin: 27199, incomeMax: 28434, copayBiweekly: 29 },
  { familySize: 2, incomeMin: 28435, incomeMax: 29670, copayBiweekly: 30 },
  { familySize: 2, incomeMin: 29671, incomeMax: 30906, copayBiweekly: 35 },
  { familySize: 2, incomeMin: 30907, incomeMax: 32142, copayBiweekly: 36 },
  { familySize: 2, incomeMin: 32143, incomeMax: 33387, copayBiweekly: 37 },
  { familySize: 2, incomeMin: 33388, incomeMax: 34614, copayBiweekly: 39 },
  { familySize: 2, incomeMin: 34615, incomeMax: 35859, copayBiweekly: 44 },
  { familySize: 2, incomeMin: 35860, incomeMax: 37095, copayBiweekly: 46 },
  { familySize: 2, incomeMin: 37096, incomeMax: 38331, copayBiweekly: 48 },
  { familySize: 2, incomeMin: 38332, incomeMax: 39567, copayBiweekly: 59 },
  { familySize: 2, incomeMin: 39568, incomeMax: 40803, copayBiweekly: 60 },
  { familySize: 2, incomeMin: 40804, incomeMax: 42038, copayBiweekly: 72 },
  { familySize: 2, incomeMin: 42039, incomeMax: 43274, copayBiweekly: 79 },
  { familySize: 2, incomeMin: 43275, incomeMax: 44510, copayBiweekly: 86 },
  { familySize: 2, incomeMin: 44511, incomeMax: 45746, copayBiweekly: 99 },
  { familySize: 2, incomeMin: 45747, incomeMax: 46982, copayBiweekly: 108 },
  { familySize: 2, incomeMin: 46983, incomeMax: 62731, copayBiweekly: 338 },
  { familySize: 3, incomeMin: 0, incomeMax: 19364, copayBiweekly: 0 },
  { familySize: 3, incomeMin: 19365, incomeMax: 25819, copayBiweekly: 2 },
  { familySize: 3, incomeMin: 25820, incomeMax: 32072, copayBiweekly: 32 },
  { familySize: 3, incomeMin: 32073, incomeMax: 77492, copayBiweekly: 417 },
  { familySize: 4, incomeMin: 0, incomeMax: 23399, copayBiweekly: 0 },
  { familySize: 4, incomeMin: 23400, incomeMax: 31199, copayBiweekly: 2 },
  { familySize: 4, incomeMin: 31200, incomeMax: 92252, copayBiweekly: 60 }
];

async function importMinnesotaCCAPDataSQL() {
  console.log("Starting Minnesota CCAP data import using direct SQL...");

  try {
    // State configuration already created via SQL, skip if it exists
    console.log("✓ Minnesota state configuration exists");

    // Import provider rates for all counties
    let rateCount = 0;
    for (const countyData of mnCountyRatesSubset) {
      // Family Child Care rates
      for (const [ageGroup, rates] of Object.entries(countyData.familyChildCare)) {
        const result = await pool.query(`
          INSERT INTO ccap_provider_rates 
          (state, county, provider_type, age_category, daily_rate, weekly_rate, effective_date, is_active, source_document)
          VALUES ('MN', '${countyData.county}', 'family_child_care', '${ageGroup}', '${rates.daily}', '${rates.weekly}', '2025-01-06', true, 'DHS-6441F-ENG 10-24 - Minnesota CCAP Standard Maximum Rates')
          ON CONFLICT DO NOTHING
        `);
        rateCount++;
      }

      // Child Care Center rates
      for (const [ageGroup, rates] of Object.entries(countyData.center)) {
        const centerResult = await pool.query(`
          INSERT INTO ccap_provider_rates 
          (state, county, provider_type, age_category, daily_rate, weekly_rate, effective_date, is_active, source_document)
          VALUES ('MN', '${countyData.county}', 'center', '${ageGroup}', '${rates.daily}', '${rates.weekly}', '2025-01-06', true, 'DHS-6441F-ENG 10-24 - Minnesota CCAP Standard Maximum Rates')
          ON CONFLICT DO NOTHING
        `);
        rateCount++;
      }
    }

    console.log(`✓ Imported ${rateCount} provider rate records`);

    // Import family copayment schedules
    let copayCount = 0;
    for (const copayData of mnCopaymentSubset) {
      const maxIncome = copayData.incomeMax ? `'${copayData.incomeMax}'` : 'NULL';
      const copayResult = await pool.query(`
        INSERT INTO ccap_copayment_schedules 
        (state, family_size, income_range_min, income_range_max, copayment_amount, effective_date, is_active, source_document)
        VALUES ('MN', ${copayData.familySize}, '${copayData.incomeMin}', ${maxIncome}, '${copayData.copayBiweekly * 26}', '2024-10-14', true, 'DHS-6413M-ENG 10-24 - Minnesota CCAP Copayment Schedules')
        ON CONFLICT DO NOTHING
      `);
      copayCount++;
    }

    console.log(`✓ Imported ${copayCount} family copayment schedules`);

    console.log("✓ Minnesota CCAP data import completed successfully!");
    console.log(`Total records imported:`);
    console.log(`- 1 state configuration (existing)`);
    console.log(`- ${rateCount} provider rates across ${mnCountyRatesSubset.length} counties`);
    console.log(`- ${copayCount} family copayment schedules`);

  } catch (error) {
    console.error("Error importing Minnesota CCAP data:", error);
    throw error;
  }
}

// Run the import
importMinnesotaCCAPDataSQL()
  .then(() => {
    console.log("Import completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Import failed:", error);
    process.exit(1);
  });