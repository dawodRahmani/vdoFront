import { getDB } from './indexedDB';

const STORE_NAME = 'programWorkPlans';

// Generate months array for timeline (July 2024 - December 2026)
export const generateTimelineMonths = () => {
  const months = [];
  const startYear = 2024;
  const startMonth = 7; // July
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
        label: `${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short' })} ${year}`,
      });
    }
  }

  return months;
};

// Create a new program work plan
export const createProgramWorkPlan = async (data) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const workPlan = {
      ...data,
      status: data.status || 'draft',
      timelineData: data.timelineData || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const id = await store.add(workPlan);
    await tx.done;

    return { ...workPlan, id };
  } catch (error) {
    console.error('Error creating program work plan:', error);
    throw error;
  }
};

// Get all program work plans
export const getAllProgramWorkPlans = async () => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const workPlans = await store.getAll();
    await tx.done;

    // Sort by created date (newest first)
    return workPlans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error getting program work plans:', error);
    throw error;
  }
};

// Get a single program work plan by ID
export const getProgramWorkPlanById = async (id) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const workPlan = await store.get(id);
    await tx.done;

    return workPlan;
  } catch (error) {
    console.error('Error getting program work plan:', error);
    throw error;
  }
};

// Update a program work plan
export const updateProgramWorkPlan = async (id, data) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const existingPlan = await store.get(id);
    if (!existingPlan) {
      throw new Error('Program work plan not found');
    }

    const updatedPlan = {
      ...existingPlan,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    await store.put(updatedPlan);
    await tx.done;

    return updatedPlan;
  } catch (error) {
    console.error('Error updating program work plan:', error);
    throw error;
  }
};

// Delete a program work plan
export const deleteProgramWorkPlan = async (id) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    await store.delete(id);
    await tx.done;

    return true;
  } catch (error) {
    console.error('Error deleting program work plan:', error);
    throw error;
  }
};

// Search program work plans
export const searchProgramWorkPlans = async (searchTerm) => {
  try {
    const allPlans = await getAllProgramWorkPlans();

    if (!searchTerm) return allPlans;

    const term = searchTerm.toLowerCase();
    return allPlans.filter(
      (plan) =>
        plan.donor?.toLowerCase().includes(term) ||
        plan.project?.toLowerCase().includes(term) ||
        plan.activity?.toLowerCase().includes(term) ||
        plan.location?.toLowerCase().includes(term) ||
        plan.output?.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error searching program work plans:', error);
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
    const plans = await index.getAll(donor);
    await tx.done;

    return plans;
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
    const plans = await index.getAll(project);
    await tx.done;

    return plans;
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
    const plans = await index.getAll(status);
    await tx.done;

    return plans;
  } catch (error) {
    console.error('Error filtering by status:', error);
    throw error;
  }
};

// Get unique donors
export const getUniqueDonors = async () => {
  try {
    const allPlans = await getAllProgramWorkPlans();
    const donors = [...new Set(allPlans.map((plan) => plan.donor).filter(Boolean))];
    return donors.sort();
  } catch (error) {
    console.error('Error getting unique donors:', error);
    throw error;
  }
};

// Get unique projects
export const getUniqueProjects = async () => {
  try {
    const allPlans = await getAllProgramWorkPlans();
    const projects = [...new Set(allPlans.map((plan) => plan.project).filter(Boolean))];
    return projects.sort();
  } catch (error) {
    console.error('Error getting unique projects:', error);
    throw error;
  }
};

// Bulk import program work plans
export const bulkImportProgramWorkPlans = async (plans) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const promises = plans.map((plan) => {
      const workPlan = {
        ...plan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return store.add(workPlan);
    });

    await Promise.all(promises);
    await tx.done;

    return true;
  } catch (error) {
    console.error('Error bulk importing program work plans:', error);
    throw error;
  }
};

// Export all program work plans
export const exportProgramWorkPlans = async () => {
  try {
    const allPlans = await getAllProgramWorkPlans();
    return allPlans;
  } catch (error) {
    console.error('Error exporting program work plans:', error);
    throw error;
  }
};
