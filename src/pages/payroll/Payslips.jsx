import { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Eye,
  Download,
  Printer,
  Calendar,
  User,
  DollarSign,
  FileText,
  XCircle,
  Building,
  CreditCard,
  Banknote
} from 'lucide-react';
import payrollService from '../../services/db/payrollService';

const Payslips = () => {
  const [payslips, setPayslips] = useState([]);
  const [filteredPayslips, setFilteredPayslips] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPayslips();
  }, [payslips, searchTerm, periodFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [payslipsData, periodsData, entriesData] = await Promise.all([
        payrollService.payslips.getAll(),
        payrollService.payrollPeriods.getAll(),
        payrollService.payrollEntries.getAll()
      ]);

      // If no payslips exist, generate from entries
      let allPayslips = payslipsData;
      if (payslipsData.length === 0 && entriesData.length > 0) {
        allPayslips = entriesData.map(entry => ({
          id: `PS-${entry.id}`,
          payrollPeriodId: entry.payrollPeriodId,
          employeeId: entry.employeeId,
          employeeName: entry.employeeName,
          department: entry.department,
          basicSalary: entry.basicSalary,
          allowances: entry.allowances,
          overtimePay: entry.overtimePay,
          otherEarnings: entry.otherEarnings,
          grossSalary: entry.grossSalary,
          taxDeduction: entry.taxDeduction,
          advanceDeduction: entry.advanceDeduction,
          loanDeduction: entry.loanDeduction,
          absenceDeduction: entry.absenceDeduction,
          otherDeductions: entry.otherDeductions,
          totalDeductions: entry.totalDeductions,
          netSalary: entry.netSalary,
          paymentMethod: entry.paymentMethod,
          bankName: entry.bankName,
          accountNumber: entry.accountNumber,
          status: 'generated',
          generatedAt: new Date().toISOString()
        }));
      }

      setPayslips(allPayslips.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt)));
      setPeriods(periodsData.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPayslips = () => {
    let filtered = [...payslips];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.employeeName?.toLowerCase().includes(search) ||
        p.employeeId?.toLowerCase().includes(search) ||
        p.department?.toLowerCase().includes(search)
      );
    }

    if (periodFilter !== 'all') {
      filtered = filtered.filter(p => p.payrollPeriodId === periodFilter);
    }

    setFilteredPayslips(filtered);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AF', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0) + ' AFN';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPeriodName = (periodId) => {
    const period = periods.find(p => p.id === periodId);
    return period ? period.name : 'Unknown Period';
  };

  const getPeriodDates = (periodId) => {
    const period = periods.find(p => p.id === periodId);
    if (!period) return '';
    return `${formatDate(period.startDate)} - ${formatDate(period.endDate)}`;
  };

  const handleViewDetail = (payslip) => {
    setSelectedPayslip(payslip);
    setShowDetailModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const summaryStats = {
    total: filteredPayslips.length,
    totalGross: filteredPayslips.reduce((sum, p) => sum + (p.grossSalary || 0), 0),
    totalDeductions: filteredPayslips.reduce((sum, p) => sum + (p.totalDeductions || 0), 0),
    totalNet: filteredPayslips.reduce((sum, p) => sum + (p.netSalary || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payslips</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage employee payslips</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Payslips</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{summaryStats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Gross</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(summaryStats.totalGross)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <DollarSign className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Deductions</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(summaryStats.totalDeductions)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Net Pay</p>
              <p className="text-lg font-bold text-purple-600">{formatCurrency(summaryStats.totalNet)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name, ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Periods</option>
            {periods.map(period => (
              <option key={period.id} value={period.id}>{period.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Payslips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPayslips.map((payslip) => (
          <div key={payslip.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{payslip.employeeName}</h3>
                  <p className="text-sm text-gray-500">{payslip.employeeId}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                payslip.paymentMethod === 'bank'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              }`}>
                {payslip.paymentMethod === 'bank' ? 'Bank' : 'Cash'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Building className="h-4 w-4" />
                {payslip.department}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                {getPeriodName(payslip.payrollPeriodId)}
              </div>
            </div>

            <div className="border-t dark:border-gray-700 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Gross Salary</span>
                <span className="font-medium text-green-600">{formatCurrency(payslip.grossSalary)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Deductions</span>
                <span className="font-medium text-red-600">-{formatCurrency(payslip.totalDeductions)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t dark:border-gray-700">
                <span className="text-gray-900 dark:text-white">Net Pay</span>
                <span className="text-blue-600">{formatCurrency(payslip.netSalary)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => handleViewDetail(payslip)}
                className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm"
              >
                <Eye className="h-4 w-4" />
                View
              </button>
            </div>
          </div>
        ))}

        {filteredPayslips.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No payslips found</p>
            <p className="text-sm text-gray-400 mt-1">Payslips will appear here after payroll processing</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPayslip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto print:bg-white">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full mx-4 my-8 print:m-0 print:rounded-none print:shadow-none">
            {/* Header */}
            <div className="p-6 border-b dark:border-gray-700 print:border-black">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">PAYSLIP</h2>
                  <p className="text-gray-500">{getPeriodName(selectedPayslip.payrollPeriodId)}</p>
                  <p className="text-sm text-gray-400">{getPeriodDates(selectedPayslip.payrollPeriodId)}</p>
                </div>
                <div className="flex gap-2 print:hidden">
                  <button
                    onClick={handlePrint}
                    className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    title="Print"
                  >
                    <Printer className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Employee Info */}
            <div className="p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 print:bg-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Employee Name</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedPayslip.employeeName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Employee ID</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedPayslip.employeeId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedPayslip.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                  <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {selectedPayslip.paymentMethod === 'bank' ? (
                      <><CreditCard className="h-4 w-4" /> Bank Transfer</>
                    ) : (
                      <><Banknote className="h-4 w-4" /> Cash</>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Earnings & Deductions */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Earnings */}
                <div>
                  <h3 className="font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Earnings
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Basic Salary</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(selectedPayslip.basicSalary)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Allowances</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(selectedPayslip.allowances)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Overtime Pay</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(selectedPayslip.overtimePay)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Other Earnings</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(selectedPayslip.otherEarnings)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                      <span className="text-green-700 dark:text-green-400">Total Earnings</span>
                      <span className="text-green-600">{formatCurrency(selectedPayslip.grossSalary)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h3 className="font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Deductions
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Tax</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(selectedPayslip.taxDeduction)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Advance Deduction</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(selectedPayslip.advanceDeduction)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Loan Deduction</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(selectedPayslip.loanDeduction)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Absence Deduction</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(selectedPayslip.absenceDeduction)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Other Deductions</span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(selectedPayslip.otherDeductions)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                      <span className="text-red-700 dark:text-red-400">Total Deductions</span>
                      <span className="text-red-600">{formatCurrency(selectedPayslip.totalDeductions)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Pay */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg print:bg-blue-100">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-blue-800 dark:text-blue-300">Net Pay</span>
                  <span className="text-3xl font-bold text-blue-600">{formatCurrency(selectedPayslip.netSalary)}</span>
                </div>
              </div>

              {/* Bank Details */}
              {selectedPayslip.paymentMethod === 'bank' && (selectedPayslip.bankName || selectedPayslip.accountNumber) && (
                <div className="mt-4 p-4 border rounded-lg dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Bank Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedPayslip.bankName && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Bank: </span>
                        <span className="text-gray-900 dark:text-white">{selectedPayslip.bankName}</span>
                      </div>
                    )}
                    {selectedPayslip.accountNumber && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Account: </span>
                        <span className="text-gray-900 dark:text-white">{selectedPayslip.accountNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t dark:border-gray-700 text-center text-sm text-gray-500 print:border-black">
              <p>This is a computer-generated payslip and does not require a signature.</p>
              <p className="mt-1">Generated on {formatDate(selectedPayslip.generatedAt || new Date().toISOString())}</p>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:bg-white,
          .print\\:bg-white * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Payslips;
