import { getDB } from './indexedDB';

const STORE_NAME = 'dnrTracking';

// Generate months array for timeline (June 2022 - January 2027)
export const generateTimelineMonths = () => {
  const months = [];
  const startYear = 2022;
  const startMonth = 6; // June
  const endYear = 2027;
  const endMonth = 1; // January

  for (let year = startYear; year <= endYear; year++) {
    const firstMonth = year === startYear ? startMonth : 1;
    const lastMonth = year === endYear ? endMonth : 12;

    for (let month = firstMonth; month <= lastMonth; month++) {
      const quarter = Math.ceil(month / 3);
      months.push({
        year,
        month,
        quarter,
        key: `${year}-${String(month).padStart(2, '0')}`,
        label: new Date(year, month - 1).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        quarterLabel: `Q${quarter}`,
      });
    }
  }

  return months;
};

// Group months by year and quarter
export const groupMonthsByYearAndQuarter = () => {
  const months = generateTimelineMonths();
  const grouped = {};

  months.forEach((month) => {
    if (!grouped[month.year]) {
      grouped[month.year] = {
        Q1: [],
        Q2: [],
        Q3: [],
        Q4: [],
      };
    }
    grouped[month.year][`Q${month.quarter}`].push(month);
  });

  return grouped;
};

// Create a new DNR tracking entry
export const createDNRTracking = async (data) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const dnrEntry = {
      ...data,
      projectStatus: data.projectStatus || 'active',
      timelineData: data.timelineData || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const id = await store.add(dnrEntry);
    await tx.done;

    return { ...dnrEntry, id };
  } catch (error) {
    console.error('Error creating DNR tracking:', error);
    throw error;
  }
};

// Get all DNR tracking entries
export const getAllDNRTracking = async () => {
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
    console.error('Error getting DNR tracking entries:', error);
    throw error;
  }
};

// Get a single DNR tracking entry by ID
export const getDNRTrackingById = async (id) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const entry = await store.get(id);
    await tx.done;

    return entry;
  } catch (error) {
    console.error('Error getting DNR tracking entry:', error);
    throw error;
  }
};

// Update a DNR tracking entry
export const updateDNRTracking = async (id, data) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const existingEntry = await store.get(id);
    if (!existingEntry) {
      throw new Error('DNR tracking entry not found');
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
    console.error('Error updating DNR tracking:', error);
    throw error;
  }
};

// Delete a DNR tracking entry
export const deleteDNRTracking = async (id) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    await store.delete(id);
    await tx.done;

    return true;
  } catch (error) {
    console.error('Error deleting DNR tracking:', error);
    throw error;
  }
};

// Search DNR tracking entries
export const searchDNRTracking = async (searchTerm) => {
  try {
    const allEntries = await getAllDNRTracking();

    if (!searchTerm) return allEntries;

    const term = searchTerm.toLowerCase();
    return allEntries.filter(
      (entry) =>
        entry.donor?.toLowerCase().includes(term) ||
        entry.projectName?.toLowerCase().includes(term) ||
        entry.location?.toLowerCase().includes(term) ||
        entry.reportType?.toLowerCase().includes(term) ||
        entry.reportingDescription?.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error searching DNR tracking:', error);
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

// Filter by project status
export const filterByProjectStatus = async (status) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('projectStatus');
    const entries = await index.getAll(status);
    await tx.done;

    return entries;
  } catch (error) {
    console.error('Error filtering by project status:', error);
    throw error;
  }
};

// Filter by report type
export const filterByReportType = async (reportType) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('reportType');
    const entries = await index.getAll(reportType);
    await tx.done;

    return entries;
  } catch (error) {
    console.error('Error filtering by report type:', error);
    throw error;
  }
};

// Get unique donors
export const getUniqueDonors = async () => {
  try {
    const allEntries = await getAllDNRTracking();
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
    const allEntries = await getAllDNRTracking();
    const projects = [
      ...new Set(allEntries.map((entry) => entry.projectName).filter(Boolean)),
    ];
    return projects.sort();
  } catch (error) {
    console.error('Error getting unique projects:', error);
    throw error;
  }
};

// Get unique report types
export const getUniqueReportTypes = async () => {
  try {
    const allEntries = await getAllDNRTracking();
    const reportTypes = [
      ...new Set(allEntries.map((entry) => entry.reportType).filter(Boolean)),
    ];
    return reportTypes.sort();
  } catch (error) {
    console.error('Error getting unique report types:', error);
    throw error;
  }
};

// Bulk import DNR tracking entries
export const bulkImportDNRTracking = async (entries) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const promises = entries.map((entry) => {
      const dnrEntry = {
        ...entry,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return store.add(dnrEntry);
    });

    await Promise.all(promises);
    await tx.done;

    return true;
  } catch (error) {
    console.error('Error bulk importing DNR tracking:', error);
    throw error;
  }
};

// Export all DNR tracking entries
export const exportDNRTracking = async () => {
  try {
    const allEntries = await getAllDNRTracking();
    return allEntries;
  } catch (error) {
    console.error('Error exporting DNR tracking:', error);
    throw error;
  }
};

// Get entries by date range
export const getEntriesByDateRange = async (startDate, endDate) => {
  try {
    const allEntries = await getAllDNRTracking();
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
