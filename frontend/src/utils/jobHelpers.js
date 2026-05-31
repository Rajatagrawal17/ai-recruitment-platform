export function normalize(str) {
  if (!str) return '';
  return str.toLowerCase().trim();
}

export function getUserId() {
  try {
    const user = JSON.parse(
      localStorage.getItem('user') || '{}'
    );
    return user._id || user.id || null;
  } catch { return null; }
}

export function getExperienceBucket(exp) {
  let val = exp;
  if (exp && typeof exp === 'object') {
    val = exp.yearsOfExperience || exp.experience;
  }
  if (!val) return 'junior';
  const years = parseInt(val);
  if (isNaN(years)) return 'junior';
  if (years <= 2) return 'junior';
  if (years <= 5) return 'mid';
  return 'senior';
}

export function formatSalary(salary) {
  if (!salary) return 'Salary not specified';
  if (typeof salary === 'string') return salary;
  if (typeof salary === 'number' && salary > 0) {
    const lpa = Math.max(1, Math.round(salary / 100000));
    return `₹${Math.max(1, Math.round(lpa * 0.85))} - ₹${Math.max(1, Math.round(lpa * 1.15))} LPA`;
  }
  if (Array.isArray(salary)) return `₹${salary[0]} - ₹${salary[1]}`;
  if (salary.min && salary.max) {
    return `₹${Number(salary.min).toLocaleString()} - ₹${Number(salary.max).toLocaleString()}`;
  }
  if (salary.min) {
    return `From ₹${Number(salary.min).toLocaleString()}`;
  }
  if (salary.max) {
    return `Up to ₹${Number(salary.max).toLocaleString()}`;
  }
  return 'Competitive salary';
}

export function formatDisplaySalary(salary) {
  return formatSalary(salary);
}

export function displayCountText(count) {
  if (!count || count < 0) return '0';
  return String(count);
}
