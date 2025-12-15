import { getDB } from './indexedDB';

const STORE_NAME = 'mouTracking';

// Create a new MOU tracking entry
export const createMOUTracking = async (data) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const mouEntry = {
      ...data,
      status: data.status || 'project',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const id = await store.add(mouEntry);
    await tx.done;

    return { ...mouEntry, id };
  } catch (error) {
    console.error('Error creating MOU tracking:', error);
    throw error;
  }
};

// Get all MOU tracking entries
export const getAllMOUTracking = async () => {
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
    console.error('Error getting MOU tracking entries:', error);
    throw error;
  }
};

// Get a single MOU tracking entry by ID
export const getMOUTrackingById = async (id) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const entry = await store.get(id);
    await tx.done;

    return entry;
  } catch (error) {
    console.error('Error getting MOU tracking entry:', error);
    throw error;
  }
};

// Update a MOU tracking entry
export const updateMOUTracking = async (id, data) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const existingEntry = await store.get(id);
    if (!existingEntry) {
      throw new Error('MOU tracking entry not found');
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
    console.error('Error updating MOU tracking:', error);
    throw error;
  }
};

// Delete a MOU tracking entry
export const deleteMOUTracking = async (id) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    await store.delete(id);
    await tx.done;

    return true;
  } catch (error) {
    console.error('Error deleting MOU tracking:', error);
    throw error;
  }
};

// Search MOU tracking entries
export const searchMOUTracking = async (searchTerm) => {
  try {
    const allEntries = await getAllMOUTracking();

    if (!searchTerm) return allEntries;

    const term = searchTerm.toLowerCase();
    return allEntries.filter(
      (entry) =>
        entry.sectoralAuthority?.toLowerCase().includes(term) ||
        entry.project?.toLowerCase().includes(term) ||
        entry.donor?.toLowerCase().includes(term) ||
        entry.location?.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error searching MOU tracking:', error);
    throw error;
  }
};

// Filter by sectoral authority
export const filterBySectoralAuthority = async (authority) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('sectoralAuthority');
    const entries = await index.getAll(authority);
    await tx.done;

    return entries;
  } catch (error) {
    console.error('Error filtering by sectoral authority:', error);
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

// Filter by project
export const filterByProject = async (project) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('project');
    const entries = await index.getAll(project);
    await tx.done;

    return entries;
  } catch (error) {
    console.error('Error filtering by project:', error);
    throw error;
  }
};

// Filter by status
export const filterByStatus = async (status) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('status');
    const entries = await index.getAll(status);
    await tx.done;

    return entries;
  } catch (error) {
    console.error('Error filtering by status:', error);
    throw error;
  }
};

// Get unique sectoral authorities
export const getUniqueSectoralAuthorities = async () => {
  try {
    const allEntries = await getAllMOUTracking();
    const authorities = [
      ...new Set(allEntries.map((entry) => entry.sectoralAuthority).filter(Boolean)),
    ];
    return authorities.sort();
  } catch (error) {
    console.error('Error getting unique sectoral authorities:', error);
    throw error;
  }
};

// Get unique donors
export const getUniqueDonors = async () => {
  try {
    const allEntries = await getAllMOUTracking();
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
    const allEntries = await getAllMOUTracking();
    const projects = [...new Set(allEntries.map((entry) => entry.project).filter(Boolean))];
    return projects.sort();
  } catch (error) {
    console.error('Error getting unique projects:', error);
    throw error;
  }
};

// Bulk import MOU tracking entries
export const bulkImportMOUTracking = async (entries) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const promises = entries.map((entry) => {
      const mouEntry = {
        ...entry,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return store.add(mouEntry);
    });

    await Promise.all(promises);
    await tx.done;

    return true;
  } catch (error) {
    console.error('Error bulk importing MOU tracking:', error);
    throw error;
  }
};

// Export all MOU tracking entries
export const exportMOUTracking = async () => {
  try {
    const allEntries = await getAllMOUTracking();
    return allEntries;
  } catch (error) {
    console.error('Error exporting MOU tracking:', error);
    throw error;
  }
};
