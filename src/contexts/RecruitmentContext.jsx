import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  recruitmentDB,
  torDB,
  srfDB,
  vacancyDB,
  candidateDB,
  applicationDB,
  committeeDB,
  longlistingDB,
  shortlistingDB,
  writtenTestDB,
  interviewDB,
  reportDB,
  offerDB,
  sanctionDB,
  backgroundCheckDB,
  contractDB,
  provincesDB,
  RECRUITMENT_STATUS,
  RECRUITMENT_STEPS,
} from '../services/db/recruitmentService';

const RecruitmentContext = createContext(null);

export const RecruitmentProvider = ({ children }) => {
  const [recruitments, setRecruitments] = useState([]);
  const [currentRecruitment, setCurrentRecruitment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Fetch all recruitments
  const fetchRecruitments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recruitmentDB.getAll();
      setRecruitments(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch recruitment statistics
  const fetchStats = useCallback(async () => {
    try {
      const data = await recruitmentDB.getStats();
      setStats(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Create new recruitment
  const createRecruitment = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const recruitment = await recruitmentDB.create(data);
      setRecruitments(prev => [recruitment, ...prev]);
      setCurrentRecruitment(recruitment);
      return recruitment;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get recruitment by ID with full details
  const getRecruitmentById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const recruitment = await recruitmentDB.getById(id);
      if (!recruitment) throw new Error('Recruitment not found');

      // Fetch related data based on current step
      const [tor, srf, vacancies, applications, committee] = await Promise.all([
        torDB.getByRecruitmentId(id),
        srfDB.getByRecruitmentId(id),
        vacancyDB.getByRecruitmentId(id),
        applicationDB.getByRecruitmentId(id),
        committeeDB.getByRecruitmentId(id),
      ]);

      const fullRecruitment = {
        ...recruitment,
        tor,
        srf,
        vacancies,
        applications,
        committee,
      };

      setCurrentRecruitment(fullRecruitment);
      return fullRecruitment;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update recruitment
  const updateRecruitment = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await recruitmentDB.update(id, data);
      setRecruitments(prev => prev.map(r => r.id === id ? updated : r));
      if (currentRecruitment?.id === id) {
        setCurrentRecruitment(prev => ({ ...prev, ...updated }));
      }
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentRecruitment]);

  // Delete recruitment
  const deleteRecruitment = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await recruitmentDB.delete(id);
      setRecruitments(prev => prev.filter(r => r.id !== id));
      if (currentRecruitment?.id === id) {
        setCurrentRecruitment(null);
      }
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentRecruitment]);

  // Advance to next step
  const advanceStep = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await recruitmentDB.advanceStep(id);
      setRecruitments(prev => prev.map(r => r.id === id ? updated : r));
      if (currentRecruitment?.id === id) {
        setCurrentRecruitment(prev => ({ ...prev, ...updated }));
      }
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentRecruitment]);

  // Search recruitments
  const searchRecruitments = useCallback(async (term) => {
    try {
      return await recruitmentDB.search(term);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Filter by status
  const filterByStatus = useCallback(async (status) => {
    try {
      if (status === 'all') {
        return await recruitmentDB.getAll();
      }
      return await recruitmentDB.filterByStatus(status);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Get step info
  const getStepInfo = useCallback((stepNumber) => {
    return RECRUITMENT_STEPS.find(s => s.step === stepNumber);
  }, []);

  // Check if step is complete
  const isStepComplete = useCallback((recruitment, stepNumber) => {
    return recruitment.currentStep > stepNumber;
  }, []);

  // Check if step is current
  const isCurrentStep = useCallback((recruitment, stepNumber) => {
    return recruitment.currentStep === stepNumber;
  }, []);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Seed provinces data
        await provincesDB.seed();
        // Fetch initial data
        await fetchRecruitments();
        await fetchStats();
      } catch (err) {
        console.error('Failed to initialize recruitment context:', err);
      }
    };
    init();
  }, [fetchRecruitments, fetchStats]);

  const value = {
    // State
    recruitments,
    currentRecruitment,
    loading,
    error,
    stats,

    // Actions
    fetchRecruitments,
    fetchStats,
    createRecruitment,
    getRecruitmentById,
    updateRecruitment,
    deleteRecruitment,
    advanceStep,
    searchRecruitments,
    filterByStatus,

    // Helpers
    getStepInfo,
    isStepComplete,
    isCurrentStep,

    // Clear current
    clearCurrentRecruitment: () => setCurrentRecruitment(null),
    clearError: () => setError(null),

    // Constants
    RECRUITMENT_STATUS,
    RECRUITMENT_STEPS,
  };

  return (
    <RecruitmentContext.Provider value={value}>
      {children}
    </RecruitmentContext.Provider>
  );
};

// Custom hook to use recruitment context
export const useRecruitment = () => {
  const context = useContext(RecruitmentContext);
  if (!context) {
    throw new Error('useRecruitment must be used within a RecruitmentProvider');
  }
  return context;
};

export default RecruitmentContext;
