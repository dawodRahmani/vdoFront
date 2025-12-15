import { getDB } from './indexedDB';

const STORE_NAME = 'inOutTracking';

// Create a new In-Out document tracking entry
export const createInOutTracking = async (data) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const inOutEntry = {
      ...data,
      status: data.status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const id = await store.add(inOutEntry);
    await tx.done;

    return { ...inOutEntry, id };
  } catch (error) {
    console.error('Error creating In-Out tracking:', error);
    throw error;
  }
};

// Get all In-Out tracking entries
export const getAllInOutTracking = async () => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const entries = await store.getAll();
    await tx.done;

    // Sort by date (newest first) or serial number
    return entries.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date) - new Date(a.date);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  } catch (error) {
    console.error('Error getting In-Out tracking entries:', error);
    throw error;
  }
};

// Get a single In-Out tracking entry by ID
export const getInOutTrackingById = async (id) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const entry = await store.get(id);
    await tx.done;

    return entry;
  } catch (error) {
    console.error('Error getting In-Out tracking entry:', error);
    throw error;
  }
};

// Update an In-Out tracking entry
export const updateInOutTracking = async (id, data) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const existingEntry = await store.get(id);
    if (!existingEntry) {
      throw new Error('In-Out tracking entry not found');
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
    console.error('Error updating In-Out tracking:', error);
    throw error;
  }
};

// Delete an In-Out tracking entry
export const deleteInOutTracking = async (id) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    await store.delete(id);
    await tx.done;

    return true;
  } catch (error) {
    console.error('Error deleting In-Out tracking:', error);
    throw error;
  }
};

// Search In-Out tracking entries
export const searchInOutTracking = async (searchTerm) => {
  try {
    const allEntries = await getAllInOutTracking();

    if (!searchTerm) return allEntries;

    const term = searchTerm.toLowerCase();
    return allEntries.filter(
      (entry) =>
        entry.documentTitle?.toLowerCase().includes(term) ||
        entry.referenceNumber?.toLowerCase().includes(term) ||
        entry.from?.toLowerCase().includes(term) ||
        entry.to?.toLowerCase().includes(term) ||
        entry.subject?.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error searching In-Out tracking:', error);
    throw error;
  }
};

// Filter by document type
export const filterByDocumentType = async (documentType) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('documentType');
    const entries = await index.getAll(documentType);
    await tx.done;

    return entries;
  } catch (error) {
    console.error('Error filtering by document type:', error);
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

// Get entries by date range
export const getEntriesByDateRange = async (startDate, endDate) => {
  try {
    const allEntries = await getAllInOutTracking();
    return allEntries.filter((entry) => {
      if (!entry.date) return false;
      const entryDate = new Date(entry.date);
      const filterStart = new Date(startDate);
      const filterEnd = new Date(endDate);

      return entryDate >= filterStart && entryDate <= filterEnd;
    });
  } catch (error) {
    console.error('Error getting entries by date range:', error);
    throw error;
  }
};

// Get unique senders (from)
export const getUniqueSenders = async () => {
  try {
    const allEntries = await getAllInOutTracking();
    const senders = [...new Set(allEntries.map((entry) => entry.from).filter(Boolean))];
    return senders.sort();
  } catch (error) {
    console.error('Error getting unique senders:', error);
    throw error;
  }
};

// Get unique recipients (to)
export const getUniqueRecipients = async () => {
  try {
    const allEntries = await getAllInOutTracking();
    const recipients = [...new Set(allEntries.map((entry) => entry.to).filter(Boolean))];
    return recipients.sort();
  } catch (error) {
    console.error('Error getting unique recipients:', error);
    throw error;
  }
};

// Bulk import In-Out tracking entries
export const bulkImportInOutTracking = async (entries) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const promises = entries.map((entry) => {
      const inOutEntry = {
        ...entry,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return store.add(inOutEntry);
    });

    await Promise.all(promises);
    await tx.done;

    return true;
  } catch (error) {
    console.error('Error bulk importing In-Out tracking:', error);
    throw error;
  }
};

// Export all In-Out tracking entries
export const exportInOutTracking = async () => {
  try {
    const allEntries = await getAllInOutTracking();
    return allEntries;
  } catch (error) {
    console.error('Error exporting In-Out tracking:', error);
    throw error;
  }
};

// Get statistics
export const getInOutStatistics = async () => {
  try {
    const allEntries = await getAllInOutTracking();

    const stats = {
      total: allEntries.length,
      incoming: allEntries.filter((e) => e.documentType === 'incoming').length,
      outgoing: allEntries.filter((e) => e.documentType === 'outgoing').length,
      pending: allEntries.filter((e) => e.status === 'pending').length,
      processed: allEntries.filter((e) => e.status === 'processed').length,
      completed: allEntries.filter((e) => e.status === 'completed').length,
    };

    return stats;
  } catch (error) {
    console.error('Error getting In-Out statistics:', error);
    throw error;
  }
};
