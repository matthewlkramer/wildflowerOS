// Age calculation utilities for children and adults

export function calculateAge(birthDate: Date | string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

export function calculateAgeInMonths(birthDate: Date | string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  
  const years = today.getFullYear() - birth.getFullYear();
  const months = today.getMonth() - birth.getMonth();
  const totalMonths = years * 12 + months;
  
  // Adjust if the day hasn't occurred yet this month
  if (today.getDate() < birth.getDate()) {
    return totalMonths - 1;
  }
  
  return totalMonths;
}

export function formatAgeDisplay(birthDate: Date | string): string {
  const ageInMonths = calculateAgeInMonths(birthDate);
  const years = Math.floor(ageInMonths / 12);
  const months = ageInMonths % 12;
  
  if (years === 0) {
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  } else if (months === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  } else {
    return `${years}y ${months}m`;
  }
}

export function getAgeGroupForChild(birthDate: Date | string): string {
  const ageInMonths = calculateAgeInMonths(birthDate);
  
  if (ageInMonths < 18) {
    return 'infant';
  } else if (ageInMonths < 36) {
    return 'toddler';
  } else if (ageInMonths < 72) {
    return 'primary';
  } else if (ageInMonths < 108) {
    return 'lower_elem';
  } else if (ageInMonths < 144) {
    return 'upper_elem';
  } else if (ageInMonths < 180) {
    return 'junior_high';
  } else {
    return 'high_school';
  }
}