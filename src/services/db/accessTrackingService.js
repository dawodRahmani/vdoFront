import { getDB } from './indexedDB';

const STORE_NAME = 'accessTracking';

// Generate months array for timeline (January 2024 - December 2026)
export const generateTimelineMonths = () => {
  const months = [];
  const startYear = 2024;
  const startMonth = 1; // January
  const endYear = 2026;
  const endMonth = 12;

  for (let year = startYear; year <= endYear; year++) {
    const firstMonth = year === startYear ? startMonth : 1;
    const lastMonth = year === endYear ? endMonth : 12;

    for (let month = firstMonth; month <= lastMonth; month++) {
      months.push({
        year,
        month,
        key: `${year}-${String(month).padStart(2, '0')}`,
        label: new Date(year, month - 1).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
      });
    }
  }

  return months;
};

// Group months by year
export const groupMonthsByYear = () => {
  const months = generateTimelineMonths();
  const grouped = {};

  months.forEach((month) => {
    if (!grouped[month.year]) {
      grouped[month.year] = [];
    }
    grouped[month.year].push(month);
  });

  return grouped;
};

// Create a new access tracking entry
export const createAccessTracking = async (data) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const accessEntry = {
      ...data,
      timelineData: data.timelineData || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const id = await store.add(accessEntry);
    await tx.done;

    return { ...accessEntry, id };
  } catch (error) {
    console.error('Error creating access tracking:', error);
    throw error;
  }
};

// Get all access tracking entries
export const getAllAccessTracking = async () => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const entries = await store.getAll();
    await tx.done;

    // Sort by serial number or created date
    return entries.sort((a, b) => {
      if (a.serialNumber && b.serialNumber) {
        return a.serialNumber - b.serialNumber;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  } catch (error) {
    console.error('Error getting access tracking entries:', error);
    throw error;
  }
};

// Get a single access tracking entry by ID
export const getAccessTrackingById = async (id) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const entry = await store.get(id);
    await tx.done;

    return entry;
  } catch (error) {
    console.error('Error getting access tracking entry:', error);
    throw error;
  }
};

// Update an access tracking entry
export const updateAccessTracking = async (id, data) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const existingEntry = await store.get(id);
    if (!existingEntry) {
      throw new Error('Access tracking entry not found');
    }

    const updatedEntry = {
      ...existingEntry,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    await store.put(updatedEntry);
    await tx.done;

    return updatedEntry;
  } catch (error) {
    console.error('Error updating access tracking:', error);
    throw error;
  }
};

// Delete an access tracking entry
export const deleteAccessTracking = async (id) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    await store.delete(id);
    await tx.done;

    return true;
  } catch (error) {
    console.error('Error deleting access tracking:', error);
    throw error;
  }
};

// Search access tracking entries
export const searchAccessTracking = async (searchTerm) => {
  try {
    const allEntries = await getAllAccessTracking();

    if (!searchTerm) return allEntries;

    const term = searchTerm.toLowerCase();
    return allEntries.filter(
      (entry) =>
        entry.donor?.toLowerCase().includes(term) ||
        entry.projectName?.toLowerCase().includes(term) ||
        entry.location?.toLowerCase().includes(term) ||
        entry.lineMinistry?.toLowerCase().includes(term) ||
        entry.activities?.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error searching access tracking:', error);
    throw error;
  }
};

// Filter by donor
export const filterByDonor = async (donor) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('donor');
    const entries = await index.getAll(donor);
    await tx.done;

    return entries;
  } catch (error) {
    console.error('Error filtering by donor:', error);
    throw error;
  }
};

// Filter by line ministry
export const filterByLineMinistry = async (ministry) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('lineMinistry');
    const entries = await index.getAll(ministry);
    await tx.done;

    return entries;
  } catch (error) {
    console.error('Error filtering by line ministry:', error);
    throw error;
  }
};

// Get unique donors
export const getUniqueDonors = async () => {
  try {
    const allEntries = await getAllAccessTracking();
    const donors = [...new Set(allEntries.map((entry) => entry.donor).filter(Boolean))];
    return donors.sort();
  } catch (error) {
    console.error('Error getting unique donors:', error);
    throw error;
  }
};

// Get unique projects
export const getUniqueProjects = async () => {
  try {
    const allEntries = await getAllAccessTracking();
    const projects = [...new Set(allEntries.map((entry) => entry.projectName).filter(Boolean))];
    return projects.sort();
  } catch (error) {
    console.error('Error getting unique projects:', error);
    throw error;
  }
};

// Get unique line ministries
export const getUniqueLineMinistries = async () => {
  try {
    const allEntries = await getAllAccessTracking();
    const ministries = [
      ...new Set(allEntries.map((entry) => entry.lineMinistry).filter(Boolean)),
    ];
    return ministries.sort();
  } catch (error) {
    console.error('Error getting unique line ministries:', error);
    throw error;
  }
};

// Bulk import access tracking entries
export const bulkImportAccessTracking = async (entries) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const promises = entries.map((entry) => {
      const accessEntry = {
        ...entry,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return store.add(accessEntry);
    });

    await Promise.all(promises);
    await tx.done;

    return true;
  } catch (error) {
    console.error('Error bulk importing access tracking:', error);
    throw error;
  }
};

// Export all access tracking entries
export const exportAccessTracking = async () => {
  try {
    const allEntries = await getAllAccessTracking();
    return allEntries;
  } catch (error) {
    console.error('Error exporting access tracking:', error);
    throw error;
  }
};

// Get entries by date range
export const getEntriesByDateRange = async (startDate, endDate) => {
  try {
    const allEntries = await getAllAccessTracking();
    return allEntries.filter((entry) => {
      const entryStart = new Date(entry.startDate);
      const entryEnd = new Date(entry.endDate);
      const filterStart = new Date(startDate);
      const filterEnd = new Date(endDate);

      return (
        (entryStart >= filterStart && entryStart <= filterEnd) ||
        (entryEnd >= filterStart && entryEnd <= filterEnd) ||
        (entryStart <= filterStart && entryEnd >= filterEnd)
      );
    });
  } catch (error) {
    console.error('Error getting entries by date range:', error);
    throw error;
  }
};
