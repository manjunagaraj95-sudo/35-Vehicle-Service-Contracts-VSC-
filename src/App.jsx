
import React, { useState, useEffect } from 'react';

// --- ROLES Configuration ---
const ROLES = {
    ADMIN: 'ADMIN', // F&I Product Manager, System Architect
    DEALER: 'DEALER', // Dealership Portal User
    CUSTOMER_SERVICE: 'CUSTOMER_SERVICE', // Customer Service Representative
    VEHICLE_OWNER: 'VEHICLE_OWNER', // Vehicle Owner
};

// --- STATUS Mappings (Colorful System) ---
const STATUS_LABELS = {
    // Contract Statuses
    PENDING: 'Pending',
    UNDERWRITING: 'Underwriting',
    ACTIVE: 'Active',
    EXPIRED: 'Expired',
    CANCELLED: 'Cancelled',
    REJECTED: 'Rejected',
    APPROVED: 'Approved', // Used for workflow step completion too

    // Claim Statuses
    FILED: 'Filed',
    IN_REVIEW: 'In Review',
    ADJUDICATED: 'Adjudicated',
    DENIED: 'Denied',
    PAID: 'Paid',

    // Renewal Statuses
    REQUESTED: 'Requested',
    OFFERED: 'Offered',
    COMPLETED: 'Completed',
};

const STATUS_COLORS = {
    PENDING: 'var(--status-pending)',
    UNDERWRITING: 'var(--status-underwriting)',
    ACTIVE: 'var(--status-active)',
    EXPIRED: 'var(--status-expired)',
    CANCELLED: 'var(--status-cancelled)',
    REJECTED: 'var(--status-rejected)',
    APPROVED: 'var(--status-approved)',

    FILED: 'var(--status-pending)', // Similar to pending, but for claims
    IN_REVIEW: 'var(--status-in-review)',
    ADJUDICATED: 'var(--status-adjudicated)',
    DENIED: 'var(--status-rejected)',
    PAID: 'var(--status-approved)',

    REQUESTED: 'var(--status-pending)',
    OFFERED: 'var(--status-in-review)',
    COMPLETED: 'var(--status-approved)',
};

// --- Dummy Data Generation ---
const generateDummyData = () => {
    const today = new Date();
    const futureDate = (days) => {
        const d = new Date(today);
        d.setDate(today.getDate() + days);
        return d.toISOString().split('T')[0];
    };
    const pastDate = (days) => {
        const d = new Date(today);
        d.setDate(today.getDate() - days);
        return d.toISOString().split('T')[0];
    };

    const contracts = [
        {
            id: 'VSC001',
            contractNumber: 'VSC-2023-001',
            status: 'ACTIVE',
            vehicleInfo: { make: 'Toyota', model: 'Camry', year: 2020, vin: 'JTMHKFVC3N0123456', mileage: 45000 },
            planDetails: { name: 'Platinum Shield', coverage: 'Bumper-to-Bumper', deductible: 100, term: '5 years / 100k miles' },
            customerInfo: { name: 'Alice Smith', email: 'alice.smith@example.com', phone: '555-1234' },
            startDate: pastDate(365),
            endDate: futureDate(1095),
            premium: 2500,
            claims: [],
            renewals: [],
            auditLogs: [
                { timestamp: pastDate(370), user: 'Admin', action: 'Contract Initiated', details: 'Contract created' },
                { timestamp: pastDate(365), user: 'Dealer XYZ', action: 'Contract Activated', details: 'Contract VSC-2023-001 became active' },
            ],
            workflowStage: 'ACTIVE_COVERAGE',
            slaStatus: 'MET',
        },
        {
            id: 'VSC002',
            contractNumber: 'VSC-2023-002',
            status: 'PENDING',
            vehicleInfo: { make: 'Honda', model: 'CR-V', year: 2022, vin: '5J6RW1H5XN0987654', mileage: 12000 },
            planDetails: { name: 'Gold Care', coverage: 'Powertrain Plus', deductible: 250, term: '3 years / 60k miles' },
            customerInfo: { name: 'Bob Johnson', email: 'bob.j@example.com', phone: '555-5678' },
            startDate: futureDate(5),
            endDate: futureDate(1095 + 5),
            premium: 1800,
            claims: [],
            renewals: [],
            auditLogs: [
                { timestamp: pastDate(10), user: 'Dealer ABC', action: 'Contract Initiated', details: 'Contract application submitted' },
                { timestamp: pastDate(8), user: 'System', action: 'Underwriting Review', details: 'Submitted to underwriting' },
            ],
            workflowStage: 'UNDERWRITING',
            slaStatus: 'PENDING',
        },
        {
            id: 'VSC003',
            contractNumber: 'VSC-2022-003',
            status: 'EXPIRED',
            vehicleInfo: { make: 'Ford', model: 'F-150', year: 2018, vin: '1FTFW1E8XKE010101', mileage: 90000 },
            planDetails: { name: 'Silver Protect', coverage: 'Powertrain', deductible: 300, term: '4 years / 75k miles' },
            customerInfo: { name: 'Charlie Brown', email: 'charlie.b@example.com', phone: '555-9012' },
            startDate: pastDate(1460 + 30), // 4 years + 30 days ago
            endDate: pastDate(30),
            premium: 1500,
            claims: [],
            renewals: [],
            auditLogs: [
                { timestamp: pastDate(1460 + 35), user: 'Admin', action: 'Contract Initiated', details: 'Contract created' },
                { timestamp: pastDate(1460 + 30), user: 'Dealer ZZZ', action: 'Contract Activated', details: 'Contract VSC-2022-003 became active' },
                { timestamp: pastDate(30), user: 'System', action: 'Contract Expired', details: 'Contract reached end date' },
            ],
            workflowStage: 'EXPIRED_COVERAGE',
            slaStatus: 'MET',
        },
        {
            id: 'VSC004',
            contractNumber: 'VSC-2023-004',
            status: 'CANCELLED',
            vehicleInfo: { make: 'BMW', model: 'X5', year: 2021, vin: 'WBAXXC50XMX001234', mileage: 20000 },
            planDetails: { name: 'Ultimate Care', coverage: 'Comprehensive', deductible: 50, term: '6 years / 120k miles' },
            customerInfo: { name: 'Diana Prince', email: 'diana.p@example.com', phone: '555-3456' },
            startDate: pastDate(180),
            endDate: futureDate(1800),
            premium: 4000,
            claims: [],
            renewals: [],
            auditLogs: [
                { timestamp: pastDate(185), user: 'Admin', action: 'Contract Initiated', details: 'Contract created' },
                { timestamp: pastDate(180), user: 'Dealer AAA', action: 'Contract Activated', details: 'Contract VSC-2023-004 became active' },
                { timestamp: pastDate(60), user: 'Customer Svc', action: 'Cancellation Processed', details: 'Customer requested cancellation' },
            ],
            workflowStage: 'CANCELLATION_FINALIZED',
            slaStatus: 'MET',
        },
        {
            id: 'VSC005',
            contractNumber: 'VSC-2024-005',
            status: 'APPROVED',
            vehicleInfo: { make: 'Tesla', model: 'Model 3', year: 2023, vin: '5YJSA1E2XNFC11223', mileage: 5000 },
            planDetails: { name: 'EV Max', coverage: 'Electric Drivetrain', deductible: 0, term: '8 years / 100k miles' },
            customerInfo: { name: 'Eve Adams', email: 'eve.a@example.com', phone: '555-7890' },
            startDate: futureDate(10),
            endDate: futureDate(8 * 365 + 10),
            premium: 3500,
            claims: [],
            renewals: [],
            auditLogs: [
                { timestamp: pastDate(5), user: 'Dealer XYZ', action: 'Contract Initiated', details: 'Contract application submitted' },
                { timestamp: pastDate(3), user: 'Underwriter', action: 'Contract Approved', details: 'Contract VSC-2024-005 approved' },
            ],
            workflowStage: 'ACTIVATION_READY',
            slaStatus: 'MET',
        },
        {
            id: 'VSC006',
            contractNumber: 'VSC-2024-006',
            status: 'REJECTED',
            vehicleInfo: { make: 'Nissan', model: 'Rogue', year: 2015, vin: 'JN8AT2MV6FC005566', mileage: 120000 },
            planDetails: { name: 'Bronze Standard', coverage: 'Engine Only', deductible: 500, term: '2 years / 30k miles' },
            customerInfo: { name: 'Frank White', email: 'frank.w@example.com', phone: '555-2345' },
            startDate: futureDate(1),
            endDate: futureDate(730 + 1),
            premium: 1000,
            claims: [],
            renewals: [],
            auditLogs: [
                { timestamp: pastDate(7), user: 'Dealer QWE', action: 'Contract Initiated', details: 'Contract application submitted' },
                { timestamp: pastDate(5), user: 'Underwriter', action: 'Contract Rejected', details: 'Vehicle mileage exceeded limits' },
            ],
            workflowStage: 'REJECTED_FINAL',
            slaStatus: 'BREACHED', // Example of SLA breach
        },
    ];

    const claims = [
        {
            id: 'CLM001',
            claimNumber: 'CLM-2024-001',
            contractId: 'VSC001',
            status: 'IN_REVIEW',
            claimType: 'Engine Repair',
            description: 'Engine knocking noise at idle. Requires full inspection and repair.',
            claimAmount: 1500, // Estimated
            deductible: 100,
            submittedDate: pastDate(10),
            adjudicationDate: null,
            repairShop: 'Speedy Auto Service',
            documents: [{ name: 'Repair Estimate.pdf', url: '#document-preview' }],
            auditLogs: [
                { timestamp: pastDate(10), user: 'Alice Smith', action: 'Claim Filed', details: 'Claim CLM-2024-001 filed online' },
                { timestamp: pastDate(8), user: 'Customer Svc', action: 'Initial Review', details: 'Claim moved to In Review' },
            ],
            workflowStage: 'ADJUDICATION',
            slaStatus: 'PENDING',
        },
        {
            id: 'CLM002',
            claimNumber: 'CLM-2024-002',
            contractId: 'VSC001',
            status: 'ADJUDICATED',
            claimType: 'Transmission Issue',
            description: 'Transmission slipping in 3rd gear. Repair approved after inspection.',
            claimAmount: 3200,
            deductible: 100,
            submittedDate: pastDate(40),
            adjudicationDate: pastDate(30),
            repairShop: 'Reliable Transmissions',
            documents: [{ name: 'Inspection Report.pdf', url: '#document-preview' }],
            auditLogs: [
                { timestamp: pastDate(40), user: 'Alice Smith', action: 'Claim Filed', details: 'Claim CLM-2024-002 filed' },
                { timestamp: pastDate(35), user: 'Adjuster 1', action: 'Adjudicated', details: 'Approved for repair' },
            ],
            workflowStage: 'PAYMENT_PROCESSING',
            slaStatus: 'MET',
        },
        {
            id: 'CLM003',
            claimNumber: 'CLM-2024-003',
            contractId: 'VSC003', // Expired contract, will be denied
            status: 'DENIED',
            claimType: 'Brake Failure',
            description: 'Brakes failed. Claim submitted after expiration.',
            claimAmount: 800,
            deductible: 300,
            submittedDate: pastDate(20),
            adjudicationDate: pastDate(15),
            repairShop: 'Local Mechanic',
            documents: [],
            auditLogs: [
                { timestamp: pastDate(20), user: 'Charlie Brown', action: 'Claim Filed', details: 'Claim CLM-2024-003 filed' },
                { timestamp: pastDate(15), user: 'Adjuster 2', action: 'Denied', details: 'Contract VSC-2022-003 was expired' },
            ],
            workflowStage: 'DENIED_FINAL',
            slaStatus: 'MET',
        },
        {
            id: 'CLM004',
            claimNumber: 'CLM-2024-004',
            contractId: 'VSC005',
            status: 'FILED',
            claimType: 'AC Repair',
            description: 'AC blowing warm air. Needs diagnosis.',
            claimAmount: 0, // TBD
            deductible: 0,
            submittedDate: pastDate(2),
            adjudicationDate: null,
            repairShop: 'Tesla Service',
            documents: [],
            auditLogs: [
                { timestamp: pastDate(2), user: 'Eve Adams', action: 'Claim Filed', details: 'Claim CLM-2024-004 filed' },
            ],
            workflowStage: 'INITIAL_REVIEW',
            slaStatus: 'PENDING',
        },
    ];

    const renewals = [
        {
            id: 'RNL001',
            renewalNumber: 'RNL-2024-001',
            contractId: 'VSC003',
            status: 'REQUESTED',
            requestDate: pastDate(15),
            newEndDate: futureDate(1095),
            newPremium: 1650,
            notes: 'Customer interested in renewing expired contract, new terms offered.',
            auditLogs: [
                { timestamp: pastDate(15), user: 'Charlie Brown', action: 'Renewal Requested', details: 'Customer requested renewal for VSC003' },
                { timestamp: pastDate(10), user: 'Sales Rep', action: 'Offer Made', details: 'New renewal offer sent to customer' },
            ],
            workflowStage: 'OFFER_SENT',
            slaStatus: 'PENDING',
        },
        {
            id: 'RNL002',
            renewalNumber: 'RNL-2024-002',
            contractId: 'VSC001',
            status: 'COMPLETED',
            requestDate: pastDate(30),
            newEndDate: futureDate(1095 + 365 * 3), // Extended by 3 years
            newPremium: 2600,
            notes: 'Contract VSC001 successfully renewed.',
            auditLogs: [
                { timestamp: pastDate(30), user: 'Alice Smith', action: 'Renewal Requested', details: 'Customer accepted renewal offer' },
                { timestamp: pastDate(20), user: 'Admin', action: 'Renewal Processed', details: 'Contract VSC001 renewal completed' },
            ],
            workflowStage: 'RENEWAL_FINALIZED',
            slaStatus: 'MET',
        },
    ];

    // Link claims and renewals to contracts
    contracts[0].claims = ['CLM001', 'CLM002'];
    contracts[0].renewals = ['RNL002'];
    contracts[2].claims = ['CLM003'];
    contracts[2].renewals = ['RNL001'];
    contracts[4].claims = ['CLM004'];

    return { contracts, claims, renewals };
};

const DUMMY_DATA = generateDummyData();

function App() {
    const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
    const [currentUserRole, setCurrentUserRole] = useState(ROLES.ADMIN); // Default user role
    const [contracts, setContracts] = useState(DUMMY_DATA.contracts);
    const [claims, setClaims] = useState(DUMMY_DATA.claims);
    const [renewals, setRenewals] = useState(DUMMY_DATA.renewals);

    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [showGlobalSearch, setShowGlobalSearch] = useState(false);
    const [showFiltersPanel, setShowFiltersPanel] = useState(false);

    // Simulated real-time KPI for dashboard (pulsing effect)
    const [totalActiveContracts, setTotalActiveContracts] = useState(
        contracts.filter(c => c.status === 'ACTIVE').length
    );

    useEffect(() => {
        const interval = setInterval(() => {
            // Simulate a subtle change for the pulsing animation
            setTotalActiveContracts(prev => prev + (Math.random() > 0.5 ? 0 : 0)); // Keep it same for now, just trigger re-render for pulse
        }, 5000); // Every 5 seconds

        return () => clearInterval(interval);
    }, []);

    // --- Handlers & Navigation ---
    const navigate = (screen, params = {}) => {
        setView({ screen, params });
        setShowGlobalSearch(false); // Close search when navigating
        setShowFiltersPanel(false); // Close filters when navigating
    };

    const handleLogout = () => {
        setCurrentUserRole(null); // Or to a login screen
        navigate('DASHBOARD');
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        // In a real app, this would trigger a search results view or filter lists.
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const applyFilters = () => {
        console.log("Applying filters:", filters);
        // In a real app, this would filter the displayed list data
        setShowFiltersPanel(false);
    };

    const clearFilters = () => {
        setFilters({});
        setShowFiltersPanel(false);
    };

    const handleStatusUpdate = (entityType, id, newStatus, currentWorkflowStage) => {
        const timestamp = new Date().toISOString().split('T')[0];
        const user = currentUserRole;
        const action = `Status changed to ${STATUS_LABELS[newStatus]}`;
        const details = `Workflow stage moved from ${currentWorkflowStage} to ${newStatus}`; // Simplified

        if (entityType === 'contract') {
            setContracts(prev => prev.map(c =>
                c.id === id ? {
                    ...c,
                    status: newStatus,
                    workflowStage: newStatus, // Simplified: status == workflow stage
                    auditLogs: [...(c.auditLogs || []), { timestamp, user, action, details }],
                } : c
            ));
        } else if (entityType === 'claim') {
            setClaims(prev => prev.map(c =>
                c.id === id ? {
                    ...c,
                    status: newStatus,
                    workflowStage: newStatus,
                    auditLogs: [...(c.auditLogs || []), { timestamp, user, action, details }],
                } : c
            ));
        } else if (entityType === 'renewal') {
            setRenewals(prev => prev.map(r =>
                r.id === id ? {
                    ...r,
                    status: newStatus,
                    workflowStage: newStatus,
                    auditLogs: [...(r.auditLogs || []), { timestamp, user, action, details }],
                } : r
            ));
        }
    };

    // --- RBAC Helper ---
    const canAccess = (requiredRoles) => {
        return requiredRoles.includes(currentUserRole);
    };

    // --- Breadcrumbs Helper ---
    const renderBreadcrumbs = () => {
        const { screen, params } = view;
        const breadcrumbMap = {
            DASHBOARD: [{ label: 'Dashboard', screen: 'DASHBOARD' }],
            CONTRACT_LIST: [{ label: 'Dashboard', screen: 'DASHBOARD' }, { label: 'VSC Contracts', screen: 'CONTRACT_LIST' }],
            CONTRACT_DETAIL: [
                { label: 'Dashboard', screen: 'DASHBOARD' },
                { label: 'VSC Contracts', screen: 'CONTRACT_LIST' },
                { label: `Contract ${params.id}`, screen: 'CONTRACT_DETAIL', params: { id: params.id } }
            ],
            CONTRACT_FORM: [
                { label: 'Dashboard', screen: 'DASHBOARD' },
                { label: 'VSC Contracts', screen: 'CONTRACT_LIST' },
                { label: params.id ? `Edit Contract ${params.id}` : 'New Contract', screen: 'CONTRACT_FORM', params: { id: params.id } }
            ],
            CLAIM_LIST: [{ label: 'Dashboard', screen: 'DASHBOARD' }, { label: 'Claims', screen: 'CLAIM_LIST' }],
            CLAIM_DETAIL: [
                { label: 'Dashboard', screen: 'DASHBOARD' },
                { label: 'Claims', screen: 'CLAIM_LIST' },
                { label: `Claim ${params.id}`, screen: 'CLAIM_DETAIL', params: { id: params.id } }
            ],
            RENEWAL_LIST: [{ label: 'Dashboard', screen: 'DASHBOARD' }, { label: 'Renewals', screen: 'RENEWAL_LIST' }],
            RENEWAL_DETAIL: [
                { label: 'Dashboard', screen: 'DASHBOARD' },
                { label: 'Renewals', screen: 'RENEWAL_LIST' },
                { label: `Renewal ${params.id}`, screen: 'RENEWAL_DETAIL', params: { id: params.id } }
            ],
            PROFILE: [{ label: 'Dashboard', screen: 'DASHBOARD' }, { label: 'Profile', screen: 'PROFILE' }],
        };

        const breadcrumbs = breadcrumbMap[screen] || [{ label: 'Dashboard', screen: 'DASHBOARD' }];

        return (
            <div className="breadcrumbs">
                {breadcrumbs.map((item, index) => (
                    <React.Fragment key={item.label}>
                        <a href="#" onClick={() => navigate(item.screen, item.params)}>
                            {item.label}
                        </a>
                        {(index < breadcrumbs.length - 1) && <span>{' / '}</span>}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    // --- Components for different screens ---

    const DashboardScreen = () => {
        const activeContracts = contracts.filter(c => c.status === 'ACTIVE').length;
        const pendingClaims = claims.filter(c => (c.status === 'FILED' || c.status === 'IN_REVIEW')).length;
        const pendingRenewals = renewals.filter(r => (r.status === 'REQUESTED' || r.status === 'OFFERED')).length;

        const recentActivities = [
            ...contracts.flatMap(c => (c.auditLogs || []).map(log => ({ ...log, type: 'Contract', ref: c.contractNumber, refId: c.id, screen: 'CONTRACT_DETAIL' }))),
            ...claims.flatMap(c => (c.auditLogs || []).map(log => ({ ...log, type: 'Claim', ref: c.claimNumber, refId: c.id, screen: 'CLAIM_DETAIL' }))),
            ...renewals.flatMap(r => (r.auditLogs || []).map(log => ({ ...log, type: 'Renewal', ref: r.renewalNumber, refId: r.id, screen: 'RENEWAL_DETAIL' }))),
        ]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5); // Latest 5 activities

        return (
            <div className="main-content">
                <div className="list-header">
                    <h2>VSC Dashboard</h2>
                    <div className="list-header-actions">
                        <button className="btn btn-outline" onClick={() => setShowGlobalSearch(true)}>Global Search</button>
                        <button className="btn btn-outline" onClick={() => setShowFiltersPanel(true)}>Filters</button>
                        {canAccess([ROLES.ADMIN, ROLES.DEALER]) && (
                            <button className="btn btn-primary" onClick={() => navigate('CONTRACT_FORM')}>+ New Contract</button>
                        )}
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div
                        className="card dashboard-card clickable pulsing"
                        onClick={() => navigate('CONTRACT_LIST', { status: 'ACTIVE' })}
                    >
                        <span className="label">Active Contracts</span>
                        <span className="value">{totalActiveContracts}</span>
                    </div>
                    <div
                        className="card dashboard-card clickable"
                        onClick={() => navigate('CLAIM_LIST', { status: 'PENDING' })}
                    >
                        <span className="label">Pending Claims</span>
                        <span className="value">{pendingClaims}</span>
                    </div>
                    <div
                        className="card dashboard-card clickable"
                        onClick={() => navigate('RENEWAL_LIST', { status: 'REQUESTED' })}
                    >
                        <span className="label">Pending Renewals</span>
                        <span className="value">{pendingRenewals}</span>
                    </div>
                    <div className="card dashboard-card">
                        <span className="label">Total Contracts</span>
                        <span className="value">{contracts.length}</span>
                    </div>
                </div>

                <h3>Key Performance Metrics</h3>
                <div className="dashboard-grid">
                    <div className="card chart-container">
                        <p>Bar Chart: Contracts by Status (placeholder)</p>
                    </div>
                    <div className="card chart-container">
                        <p>Line Chart: Claims Over Time (placeholder)</p>
                    </div>
                    <div className="card chart-container">
                        <p>Donut Chart: Claim Types (placeholder)</p>
                    </div>
                    <div className="card chart-container">
                        <p>Gauge: Average Claim Resolution Time (placeholder)</p>
                    </div>
                </div>

                <div className="recent-activities-panel">
                    <h3>Recent Activities</h3>
                    {recentActivities.length > 0 ? (
                        recentActivities.map((activity, index) => (
                            <div key={index} className="activity-item">
                                <div>
                                    <strong>{activity.type} {activity.ref}</strong>: {activity.action} by {activity.user}
                                    <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--text-light-color)' }}>{activity.details}</p>
                                </div>
                                <span className="timestamp">{activity.timestamp}</span>
                            </div>
                        ))
                    ) : (
                        <p>No recent activities.</p>
                    )}
                </div>
            </div>
        );
    };

    const ContractListScreen = () => {
        const filteredContracts = contracts.filter(c =>
            (view.params.status ? c.status === view.params.status : true) &&
            (searchTerm ? (
                c.contractNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.vehicleInfo?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.vehicleInfo?.model?.toLowerCase().includes(searchTerm.toLowerCase())
            ) : true)
        );

        return (
            <div className="main-content">
                <div className="list-header">
                    <h2>VSC Contracts</h2>
                    <div className="list-header-actions">
                        <input
                            type="text"
                            placeholder="Search contracts..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}
                        />
                        <button className="btn btn-outline" onClick={() => setShowFiltersPanel(true)}>Filters</button>
                        {canAccess([ROLES.ADMIN, ROLES.DEALER]) && (
                            <button className="btn btn-primary" onClick={() => navigate('CONTRACT_FORM')}>+ New Contract</button>
                        )}
                        <button className="btn btn-outline">Export</button>
                    </div>
                </div>

                <div className="list-container">
                    {filteredContracts.length > 0 ? (
                        filteredContracts.map(contract => (
                            <div
                                key={contract.id}
                                className="card list-item-card clickable"
                                data-status={contract.status}
                                onClick={() => navigate('CONTRACT_DETAIL', { id: contract.id })}
                            >
                                <div className="details">
                                    <div className="flex-row flex-between">
                                        <h4 className="title">{contract.contractNumber} - {contract.customerInfo?.name}</h4>
                                        <div className="status-badge" style={{ backgroundColor: STATUS_COLORS[contract.status] }}>
                                            <span className="status-indicator" style={{ backgroundColor: STATUS_COLORS[contract.status] }}></span>
                                            {STATUS_LABELS[contract.status]}
                                        </div>
                                    </div>
                                    <p className="description">
                                        {contract.vehicleInfo?.year} {contract.vehicleInfo?.make} {contract.vehicleInfo?.model} (VIN: {contract.vehicleInfo?.vin})
                                    </p>
                                    <div className="meta">
                                        <span>Plan: {contract.planDetails?.name}</span>
                                        <span>Start: {contract.startDate}</span>
                                        <span>End: {contract.endDate}</span>
                                    </div>
                                </div>
                                {canAccess([ROLES.ADMIN, ROLES.DEALER]) && (
                                    <div className="actions">
                                        <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); navigate('CONTRACT_FORM', { id: contract.id }); }}>Edit</button>
                                        <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); console.log('View claims for', contract.id); navigate('CLAIM_LIST', { contractId: contract.id }); }}>View Claims</button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="card text-center">
                            <h3>No Contracts Found</h3>
                            <p>There are no contracts matching your criteria. Try adjusting your search or filters.</p>
                            {canAccess([ROLES.ADMIN, ROLES.DEALER]) && (
                                <button className="btn btn-primary" onClick={() => navigate('CONTRACT_FORM')} style={{ marginTop: 'var(--spacing-md)' }}>Create New Contract</button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const ContractDetailScreen = () => {
        const contract = contracts.find(c => c.id === view.params.id);
        if (!contract) return <div className="main-content">Contract not found.</div>;

        const relatedClaims = claims.filter(c => contract.claims?.includes(c.id));
        const relatedRenewals = renewals.filter(r => contract.renewals?.includes(r.id));

        // Simplified workflow stages, mapped from contract.status for demonstration
        const workflowStages = ['CONTRACT_INITIATION', 'UNDERWRITING', 'ACTIVATION_READY', 'ACTIVE_COVERAGE', 'EXPIRED_COVERAGE', 'CANCELLATION_FINALIZED', 'REJECTED_FINAL'];
        const currentStageIndex = workflowStages.indexOf(contract.workflowStage);

        const handleContractAction = (actionType) => {
            let newStatus = contract.status;
            switch (actionType) {
                case 'approve_underwriting':
                    newStatus = 'ACTIVE';
                    break;
                case 'reject_underwriting':
                    newStatus = 'REJECTED';
                    break;
                case 'cancel_contract':
                    newStatus = 'CANCELLED';
                    break;
                // Add more actions as needed
                default:
                    break;
            }
            if (newStatus !== contract.status) {
                handleStatusUpdate('contract', contract.id, newStatus, contract.workflowStage);
            }
        };

        const documentLink = '#document-preview'; // Placeholder for document preview

        return (
            <div className="main-content">
                <div className="list-header">
                    <h2>Contract {contract.contractNumber}</h2>
                    <div className="list-header-actions">
                        <div className="status-badge" style={{ backgroundColor: STATUS_COLORS[contract.status] }}>
                            <span className="status-indicator" style={{ backgroundColor: STATUS_COLORS[contract.status] }}></span>
                            {STATUS_LABELS[contract.status]}
                        </div>
                        {canAccess([ROLES.ADMIN, ROLES.DEALER]) && (
                            <>
                                {((contract.status === 'PENDING' || contract.status === 'UNDERWRITING') && canAccess([ROLES.ADMIN])) && (
                                    <button className="btn btn-primary" onClick={() => handleContractAction('approve_underwriting')}>Approve Contract</button>
                                )}
                                {((contract.status === 'PENDING' || contract.status === 'UNDERWRITING') && canAccess([ROLES.ADMIN])) && (
                                    <button className="btn btn-secondary" onClick={() => handleContractAction('reject_underwriting')}>Reject Contract</button>
                                )}
                                {contract.status === 'ACTIVE' && canAccess([ROLES.ADMIN, ROLES.DEALER, ROLES.CUSTOMER_SERVICE]) && (
                                    <button className="btn btn-secondary" onClick={() => handleContractAction('cancel_contract')}>Cancel Contract</button>
                                )}
                                <button className="btn btn-outline" onClick={() => navigate('CONTRACT_FORM', { id: contract.id })}>Edit</button>
                            </>
                        )}
                    </div>
                </div>

                <div className="detail-grid">
                    <div className="detail-main">
                        <div className="detail-section">
                            <h4>Contract Details</h4>
                            <div className="workflow-tracker">
                                {workflowStages.map((stage, index) => (
                                    <div key={stage} className={`workflow-stage ${index <= currentStageIndex ? (index === currentStageIndex ? 'active' : 'completed') : ''}`}>
                                        <span>{STATUS_LABELS[stage.replace('_COVERAGE', '').replace('_FINAL', '').replace('_READY', '').replace('CONTRACT_', '')] || stage.replace(/_/g, ' ')}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="detail-item mt-md"><strong>SLA Status</strong>
                                <span style={{ color: contract.slaStatus === 'BREACHED' ? 'var(--status-rejected)' : 'var(--accent-color)' }}>
                                    {contract.slaStatus || 'N/A'} {contract.slaStatus === 'BREACHED' ? '(Breached)' : ''}
                                </span>
                            </div>
                            <div className="detail-item"><strong>Contract Number</strong><span>{contract.contractNumber}</span></div>
                            <div className="detail-item"><strong>Status</strong><span>{STATUS_LABELS[contract.status]}</span></div>
                            <div className="detail-item"><strong>Start Date</strong><span>{contract.startDate}</span></div>
                            <div className="detail-item"><strong>End Date</strong><span>{contract.endDate}</span></div>
                            <div className="detail-item"><strong>Premium</strong><span>${contract.premium?.toFixed(2)}</span></div>
                        </div>

                        <div className="detail-section">
                            <h4>Vehicle Information</h4>
                            <div className="detail-item"><strong>Make</strong><span>{contract.vehicleInfo?.make}</span></div>
                            <div className="detail-item"><strong>Model</strong><span>{contract.vehicleInfo?.model}</span></div>
                            <div className="detail-item"><strong>Year</strong><span>{contract.vehicleInfo?.year}</span></div>
                            <div className="detail-item"><strong>VIN</strong><span>{contract.vehicleInfo?.vin}</span></div>
                            <div className="detail-item"><strong>Mileage</strong><span>{contract.vehicleInfo?.mileage?.toLocaleString()}</span></div>
                        </div>

                        <div className="detail-section">
                            <h4>Plan Details</h4>
                            <div className="detail-item"><strong>Plan Name</strong><span>{contract.planDetails?.name}</span></div>
                            <div className="detail-item"><strong>Coverage</strong><span>{contract.planDetails?.coverage}</span></div>
                            <div className="detail-item"><strong>Deductible</strong><span>${contract.planDetails?.deductible?.toFixed(2)}</span></div>
                            <div className="detail-item"><strong>Term</strong><span>{contract.planDetails?.term}</span></div>
                        </div>

                        <div className="detail-section">
                            <h4>Customer Information</h4>
                            <div className="detail-item"><strong>Name</strong><span>{contract.customerInfo?.name}</span></div>
                            <div className="detail-item"><strong>Email</strong><span>{contract.customerInfo?.email}</span></div>
                            <div className="detail-item"><strong>Phone</strong><span>{contract.customerInfo?.phone}</span></div>
                        </div>

                        {relatedClaims.length > 0 && (
                            <div className="detail-section">
                                <h4>Related Claims</h4>
                                <div className="list-container">
                                    {relatedClaims.map(claim => (
                                        <div
                                            key={claim.id}
                                            className="card list-item-card clickable"
                                            data-status={claim.status}
                                            onClick={() => navigate('CLAIM_DETAIL', { id: claim.id })}
                                        >
                                            <div className="flex-row flex-between">
                                                <h5 className="title">{claim.claimNumber} - {claim.claimType}</h5>
                                                <div className="status-badge" style={{ backgroundColor: STATUS_COLORS[claim.status] }}>
                                                    <span className="status-indicator" style={{ backgroundColor: STATUS_COLORS[claim.status] }}></span>
                                                    {STATUS_LABELS[claim.status]}
                                                </div>
                                            </div>
                                            <p>{claim.description?.substring(0, 70)}...</p>
                                            <div className="meta">
                                                <span>Submitted: {claim.submittedDate}</span>
                                                {claim.claimAmount > 0 && <span>Amount: ${claim.claimAmount?.toFixed(2)}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {relatedRenewals.length > 0 && (
                            <div className="detail-section">
                                <h4>Related Renewals</h4>
                                <div className="list-container">
                                    {relatedRenewals.map(renewal => (
                                        <div
                                            key={renewal.id}
                                            className="card list-item-card clickable"
                                            data-status={renewal.status}
                                            onClick={() => navigate('RENEWAL_DETAIL', { id: renewal.id })}
                                        >
                                            <div className="flex-row flex-between">
                                                <h5 className="title">{renewal.renewalNumber}</h5>
                                                <div className="status-badge" style={{ backgroundColor: STATUS_COLORS[renewal.status] }}>
                                                    <span className="status-indicator" style={{ backgroundColor: STATUS_COLORS[renewal.status] }}></span>
                                                    {STATUS_LABELS[renewal.status]}
                                                </div>
                                            </div>
                                            <p>Requested: {renewal.requestDate} | New End: {renewal.newEndDate}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="detail-sidebar">
                        <div className="detail-section">
                            <h4>Audit Log</h4>
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {(contract.auditLogs || []).length > 0 ? (
                                    (contract.auditLogs || []).map((log, index) => (
                                        <div key={index} className="activity-item">
                                            <div>
                                                <strong>{log.action}</strong> by {log.user}
                                                <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--text-light-color)' }}>{log.details}</p>
                                            </div>
                                            <span className="timestamp">{log.timestamp}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p>No audit logs available.</p>
                                )}
                            </div>
                        </div>
                        {/* Placeholder for Document Preview, if any documents were associated with the contract itself */}
                        <div className="detail-section">
                            <h4>Documents</h4>
                            <p>No contract-level documents uploaded directly.</p>
                            {/* Example for a link to a generic document preview */}
                            <a href={documentLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ marginTop: 'var(--spacing-md)' }}>View Sample Document</a>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ContractFormScreen = () => {
        const contractId = view.params.id;
        const existingContract = contractId ? contracts.find(c => c.id === contractId) : null;

        const [formData, setFormData] = useState({
            contractNumber: existingContract?.contractNumber || '',
            vehicleMake: existingContract?.vehicleInfo?.make || '',
            vehicleModel: existingContract?.vehicleInfo?.model || '',
            vehicleYear: existingContract?.vehicleInfo?.year || '',
            vin: existingContract?.vehicleInfo?.vin || '',
            mileage: existingContract?.vehicleInfo?.mileage || '',
            planName: existingContract?.planDetails?.name || '',
            coverage: existingContract?.planDetails?.coverage || '',
            deductible: existingContract?.planDetails?.deductible || '',
            term: existingContract?.planDetails?.term || '',
            customerName: existingContract?.customerInfo?.name || '',
            customerEmail: existingContract?.customerInfo?.email || '',
            customerPhone: existingContract?.customerInfo?.phone || '',
            startDate: existingContract?.startDate || '',
            endDate: existingContract?.endDate || '',
            premium: existingContract?.premium || '',
            // No file upload implemented for brevity but form elements would go here.
        });
        const [errors, setErrors] = useState({});

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
            if (errors[name]) { // Clear error on change
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                });
            }
        };

        const validateForm = () => {
            const newErrors = {};
            if (!formData.contractNumber) newErrors.contractNumber = 'Contract Number is required.';
            if (!formData.vin) newErrors.vin = 'VIN is required.';
            if (!formData.customerName) newErrors.customerName = 'Customer Name is required.';
            if (!formData.startDate) newErrors.startDate = 'Start Date is required.';
            if (!formData.endDate) newErrors.endDate = 'End Date is required.';
            if (new Date(formData.startDate) > new Date(formData.endDate)) {
                newErrors.endDate = 'End Date must be after Start Date.';
            }
            // Add more validations as per requirements

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!validateForm()) {
                console.error("Form validation failed", errors);
                return;
            }

            const newContractData = {
                id: contractId || `VSC${String(contracts.length + 1).padStart(3, '0')}`,
                contractNumber: formData.contractNumber,
                status: existingContract?.status || 'PENDING',
                vehicleInfo: {
                    make: formData.vehicleMake,
                    model: formData.vehicleModel,
                    year: Number(formData.vehicleYear),
                    vin: formData.vin,
                    mileage: Number(formData.mileage),
                },
                planDetails: {
                    name: formData.planName,
                    coverage: formData.coverage,
                    deductible: Number(formData.deductible),
                    term: formData.term,
                },
                customerInfo: {
                    name: formData.customerName,
                    email: formData.customerEmail,
                    phone: formData.customerPhone,
                },
                startDate: formData.startDate,
                endDate: formData.endDate,
                premium: Number(formData.premium),
                claims: existingContract?.claims || [],
                renewals: existingContract?.renewals || [],
                auditLogs: [
                    ...(existingContract?.auditLogs || []),
                    {
                        timestamp: new Date().toISOString().split('T')[0],
                        user: currentUserRole,
                        action: contractId ? 'Contract Updated' : 'Contract Created',
                        details: contractId ? `Contract ${formData.contractNumber} details updated` : `New contract ${formData.contractNumber} created`,
                    },
                ],
                workflowStage: existingContract?.workflowStage || 'CONTRACT_INITIATION',
                slaStatus: existingContract?.slaStatus || 'PENDING',
            };

            if (contractId) {
                // Update existing contract
                setContracts(prev => prev.map(c => (c.id === contractId ? newContractData : c)));
            } else {
                // Add new contract
                setContracts(prev => [...prev, newContractData]);
            }

            navigate('CONTRACT_LIST');
        };

        if (!canAccess([ROLES.ADMIN, ROLES.DEALER])) {
            return <div className="main-content">You do not have permission to access this page.</div>;
        }

        return (
            <div className="main-content">
                <div className="form-container">
                    <h2>{contractId ? `Edit Contract ${formData.contractNumber}` : 'Create New VSC Contract'}</h2>
                    <form onSubmit={handleSubmit}>
                        <h3>General Information</h3>
                        <div className="form-group">
                            <label htmlFor="contractNumber">Contract Number *</label>
                            <input
                                type="text"
                                id="contractNumber"
                                name="contractNumber"
                                value={formData.contractNumber}
                                onChange={handleChange}
                                required
                                readOnly={!!contractId} // Contract number usually not editable
                            />
                            {errors.contractNumber && <p className="error-message">{errors.contractNumber}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="startDate">Start Date *</label>
                            <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required />
                            {errors.startDate && <p className="error-message">{errors.startDate}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="endDate">End Date *</label>
                            <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} required />
                            {errors.endDate && <p className="error-message">{errors.endDate}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="premium">Premium ($) *</label>
                            <input type="number" id="premium" name="premium" value={formData.premium} onChange={handleChange} required min="0" />
                            {errors.premium && <p className="error-message">{errors.premium}</p>}
                        </div>

                        <h3>Vehicle Details</h3>
                        <div className="form-group">
                            <label htmlFor="vin">VIN *</label>
                            <input type="text" id="vin" name="vin" value={formData.vin} onChange={handleChange} required />
                            {errors.vin && <p className="error-message">{errors.vin}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="vehicleMake">Make</label>
                            <input type="text" id="vehicleMake" name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="vehicleModel">Model</label>
                            <input type="text" id="vehicleModel" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="vehicleYear">Year</label>
                            <input type="number" id="vehicleYear" name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="mileage">Mileage (Auto-populated: {formData.vin ? '50,000' : 'N/A'})</label>
                            <input
                                type="number"
                                id="mileage"
                                name="mileage"
                                value={formData.mileage}
                                onChange={handleChange}
                                // Simulate auto-population
                                onBlur={() => {
                                    if (!formData.mileage && formData.vin) {
                                        setFormData(prev => ({ ...prev, mileage: 50000 }));
                                    }
                                }}
                            />
                        </div>

                        <h3>Plan Configuration</h3>
                        <div className="form-group">
                            <label htmlFor="planName">Plan Name</label>
                            <select id="planName" name="planName" value={formData.planName} onChange={handleChange}>
                                <option value="">Select a plan</option>
                                <option value="Platinum Shield">Platinum Shield</option>
                                <option value="Gold Care">Gold Care</option>
                                <option value="Silver Protect">Silver Protect</option>
                                <option value="EV Max">EV Max</option>
                                <option value="Ultimate Care">Ultimate Care</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="coverage">Coverage</label>
                            <input type="text" id="coverage" name="coverage" value={formData.coverage} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="deductible">Deductible ($)</label>
                            <input type="number" id="deductible" name="deductible" value={formData.deductible} onChange={handleChange} min="0" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="term">Term</label>
                            <input type="text" id="term" name="term" value={formData.term} onChange={handleChange} />
                        </div>

                        <h3>Customer Information</h3>
                        <div className="form-group">
                            <label htmlFor="customerName">Customer Name *</label>
                            <input type="text" id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} required />
                            {errors.customerName && <p className="error-message">{errors.customerName}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="customerEmail">Email</label>
                            <input type="email" id="customerEmail" name="customerEmail" value={formData.customerEmail} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="customerPhone">Phone</label>
                            <input type="tel" id="customerPhone" name="customerPhone" value={formData.customerPhone} onChange={handleChange} />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => navigate('CONTRACT_LIST')}>Cancel</button>
                            <button type="submit" className="btn btn-primary">{contractId ? 'Save Changes' : 'Create Contract'}</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const ClaimListScreen = () => {
        const filteredClaims = claims.filter(c =>
            (view.params.contractId ? c.contractId === view.params.contractId : true) &&
            (view.params.status ? (view.params.status === 'PENDING' ? (c.status === 'FILED' || c.status === 'IN_REVIEW') : c.status === view.params.status) : true) &&
            (searchTerm ? (
                c.claimNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contracts.find(contract => contract.id === c.contractId)?.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            ) : true)
        );

        return (
            <div className="main-content">
                <div className="list-header">
                    <h2>Claims</h2>
                    <div className="list-header-actions">
                        <input
                            type="text"
                            placeholder="Search claims..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}
                        />
                        <button className="btn btn-outline" onClick={() => setShowFiltersPanel(true)}>Filters</button>
                        {/* A separate form/workflow for filing new claims would be implemented */}
                        {/* <button className="btn btn-primary" onClick={() => navigate('CLAIM_FORM')}>+ File New Claim</button> */}
                        <button className="btn btn-outline">Export</button>
                    </div>
                </div>

                <div className="list-container">
                    {filteredClaims.length > 0 ? (
                        filteredClaims.map(claim => {
                            const contract = contracts.find(c => c.id === claim.contractId);
                            return (
                                <div
                                    key={claim.id}
                                    className="card list-item-card clickable"
                                    data-status={claim.status}
                                    onClick={() => navigate('CLAIM_DETAIL', { id: claim.id })}
                                >
                                    <div className="details">
                                        <div className="flex-row flex-between">
                                            <h4 className="title">{claim.claimNumber} - {claim.claimType}</h4>
                                            <div className="status-badge" style={{ backgroundColor: STATUS_COLORS[claim.status] }}>
                                                <span className="status-indicator" style={{ backgroundColor: STATUS_COLORS[claim.status] }}></span>
                                                {STATUS_LABELS[claim.status]}
                                            </div>
                                        </div>
                                        <p className="description">
                                            Contract: {contract?.contractNumber} | Customer: {contract?.customerInfo?.name}
                                        </p>
                                        <div className="meta">
                                            <span>Submitted: {claim.submittedDate}</span>
                                            <span>Amount: ${claim.claimAmount > 0 ? claim.claimAmount.toFixed(2) : 'TBD'}</span>
                                        </div>
                                    </div>
                                    {canAccess([ROLES.ADMIN, ROLES.CUSTOMER_SERVICE]) && (
                                        <div className="actions">
                                            <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); console.log('Process claim', claim.id); /* navigate('CLAIM_FORM', { id: claim.id }); */ }}>Process</button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="card text-center">
                            <h3>No Claims Found</h3>
                            <p>There are no claims matching your criteria. Try adjusting your search or filters.</p>
                            {/* <button className="btn btn-primary" onClick={() => navigate('CLAIM_FORM')} style={{ marginTop: 'var(--spacing-md)' }}>File New Claim</button> */}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const ClaimDetailScreen = () => {
        const claim = claims.find(c => c.id === view.params.id);
        if (!claim) return <div className="main-content">Claim not found.</div>;

        const contract = contracts.find(c => c.id === claim.contractId);

        const workflowStages = ['INITIAL_REVIEW', 'ADJUDICATION', 'PAYMENT_PROCESSING', 'DENIED_FINAL', 'PAID'];
        const currentStageIndex = workflowStages.indexOf(claim.workflowStage);

        const handleClaimAction = (actionType) => {
            let newStatus = claim.status;
            switch (actionType) {
                case 'approve_claim':
                    newStatus = 'ADJUDICATED';
                    break;
                case 'deny_claim':
                    newStatus = 'DENIED';
                    break;
                case 'pay_claim':
                    newStatus = 'PAID';
                    break;
                case 'send_to_review':
                    newStatus = 'IN_REVIEW';
                    break;
                default:
                    break;
            }
            if (newStatus !== claim.status) {
                handleStatusUpdate('claim', claim.id, newStatus, claim.workflowStage);
            }
        };

        const documentLink = claim.documents?.[0]?.url || '#'; // Placeholder

        return (
            <div className="main-content">
                <div className="list-header">
                    <h2>Claim {claim.claimNumber}</h2>
                    <div className="list-header-actions">
                        <div className="status-badge" style={{ backgroundColor: STATUS_COLORS[claim.status] }}>
                            <span className="status-indicator" style={{ backgroundColor: STATUS_COLORS[claim.status] }}></span>
                            {STATUS_LABELS[claim.status]}
                        </div>
                        {canAccess([ROLES.ADMIN, ROLES.CUSTOMER_SERVICE]) && (
                            <>
                                {((claim.status === 'FILED' || claim.status === 'IN_REVIEW') && canAccess([ROLES.CUSTOMER_SERVICE, ROLES.ADMIN])) && (
                                    <button className="btn btn-primary" onClick={() => handleClaimAction('approve_claim')}>Adjudicate</button>
                                )}
                                {(claim.status === 'ADJUDICATED' && canAccess([ROLES.ADMIN])) && (
                                    <button className="btn btn-primary" onClick={() => handleClaimAction('pay_claim')}>Mark as Paid</button>
                                )}
                                {(claim.status !== 'DENIED' && claim.status !== 'PAID') && canAccess([ROLES.CUSTOMER_SERVICE, ROLES.ADMIN]) && (
                                    <button className="btn btn-secondary" onClick={() => handleClaimAction('deny_claim')}>Deny Claim</button>
                                )}
                                {claim.status === 'FILED' && canAccess([ROLES.CUSTOMER_SERVICE, ROLES.ADMIN]) && (
                                    <button className="btn btn-outline" onClick={() => handleClaimAction('send_to_review')}>Send to Review</button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="detail-grid">
                    <div className="detail-main">
                        <div className="detail-section">
                            <h4>Claim Details</h4>
                            <div className="workflow-tracker">
                                {workflowStages.map((stage, index) => (
                                    <div key={stage} className={`workflow-stage ${index <= currentStageIndex ? (index === currentStageIndex ? 'active' : 'completed') : ''}`}>
                                        <span>{STATUS_LABELS[stage.replace('_FINAL', '')] || stage.replace(/_/g, ' ')}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="detail-item mt-md"><strong>SLA Status</strong>
                                <span style={{ color: claim.slaStatus === 'BREACHED' ? 'var(--status-rejected)' : 'var(--accent-color)' }}>
                                    {claim.slaStatus || 'N/A'} {claim.slaStatus === 'BREACHED' ? '(Breached)' : ''}
                                </span>
                            </div>
                            <div className="detail-item"><strong>Claim Number</strong><span>{claim.claimNumber}</span></div>
                            <div className="detail-item"><strong>Contract</strong>
                                <a href="#" onClick={() => navigate('CONTRACT_DETAIL', { id: contract?.id })}>{contract?.contractNumber}</a>
                            </div>
                            <div className="detail-item"><strong>Claim Type</strong><span>{claim.claimType}</span></div>
                            <div className="detail-item"><strong>Description</strong><p>{claim.description}</p></div>
                            <div className="detail-item"><strong>Submitted Date</strong><span>{claim.submittedDate}</span></div>
                            <div className="detail-item"><strong>Adjudication Date</strong><span>{claim.adjudicationDate || 'N/A'}</span></div>
                            <div className="detail-item"><strong>Claim Amount</strong><span>${claim.claimAmount?.toFixed(2)}</span></div>
                            <div className="detail-item"><strong>Deductible</strong><span>${claim.deductible?.toFixed(2)}</span></div>
                            <div className="detail-item"><strong>Repair Shop</strong><span>{claim.repairShop}</span></div>
                        </div>

                        {/* Placeholder for AI Fraud Detection (visual indicator) */}
                        <div className="detail-section">
                            <h4>AI Fraud Detection Score</h4>
                            <div className="detail-item">
                                <strong>Score</strong> <span>7.2 (Low Risk)</span>
                            </div>
                            <p style={{ fontStyle: 'italic', fontSize: 'var(--font-size-sm)', color: 'var(--text-light-color)' }}>
                                (This is a simulated score. AI system integrates for real-time analysis.)
                            </p>
                        </div>
                    </div>

                    <div className="detail-sidebar">
                        <div className="detail-section">
                            <h4>Audit Log</h4>
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {(claim.auditLogs || []).length > 0 ? (
                                    (claim.auditLogs || []).map((log, index) => (
                                        <div key={index} className="activity-item">
                                            <div>
                                                <strong>{log.action}</strong> by {log.user}
                                                <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--text-light-color)' }}>{log.details}</p>
                                            </div>
                                            <span className="timestamp">{log.timestamp}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p>No audit logs available.</p>
                                )}
                            </div>
                        </div>
                        <div className="detail-section">
                            <h4>Documents</h4>
                            {(claim.documents || []).length > 0 ? (
                                <ul>
                                    {(claim.documents || []).map((doc, index) => (
                                        <li key={index} style={{ marginBottom: 'var(--spacing-xs)' }}>
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'var(--primary-color)' }}>
                                                {doc.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No documents uploaded for this claim.</p>
                            )}
                            {(claim.documents || []).length > 0 && (
                                <a href={documentLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ marginTop: 'var(--spacing-md)' }}>Preview First Document</a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const RenewalListScreen = () => {
        const filteredRenewals = renewals.filter(r =>
            (view.params.contractId ? r.contractId === view.params.contractId : true) &&
            (view.params.status ? r.status === view.params.status : true) &&
            (searchTerm ? (
                r.renewalNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contracts.find(contract => contract.id === r.contractId)?.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            ) : true)
        );

        return (
            <div className="main-content">
                <div className="list-header">
                    <h2>Renewals</h2>
                    <div className="list-header-actions">
                        <input
                            type="text"
                            placeholder="Search renewals..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}
                        />
                        <button className="btn btn-outline" onClick={() => setShowFiltersPanel(true)}>Filters</button>
                        {/* Option to initiate a new renewal for an expired contract */}
                        {canAccess([ROLES.ADMIN, ROLES.DEALER]) && (
                            <button className="btn btn-primary" onClick={() => console.log("Initiate new renewal")}>+ New Renewal</button>
                        )}
                        <button className="btn btn-outline">Export</button>
                    </div>
                </div>

                <div className="list-container">
                    {filteredRenewals.length > 0 ? (
                        filteredRenewals.map(renewal => {
                            const contract = contracts.find(c => c.id === renewal.contractId);
                            return (
                                <div
                                    key={renewal.id}
                                    className="card list-item-card clickable"
                                    data-status={renewal.status}
                                    onClick={() => navigate('RENEWAL_DETAIL', { id: renewal.id })}
                                >
                                    <div className="details">
                                        <div className="flex-row flex-between">
                                            <h4 className="title">{renewal.renewalNumber}</h4>
                                            <div className="status-badge" style={{ backgroundColor: STATUS_COLORS[renewal.status] }}>
                                                <span className="status-indicator" style={{ backgroundColor: STATUS_COLORS[renewal.status] }}></span>
                                                {STATUS_LABELS[renewal.status]}
                                            </div>
                                        </div>
                                        <p className="description">
                                            Contract: {contract?.contractNumber} | Customer: {contract?.customerInfo?.name}
                                        </p>
                                        <div className="meta">
                                            <span>Requested: {renewal.requestDate}</span>
                                            <span>New End Date: {renewal.newEndDate}</span>
                                            <span>New Premium: ${renewal.newPremium?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    {canAccess([ROLES.ADMIN, ROLES.DEALER]) && (
                                        <div className="actions">
                                            <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); console.log('Process renewal', renewal.id); }}>Process</button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="card text-center">
                            <h3>No Renewals Found</h3>
                            <p>There are no renewals matching your criteria. Try adjusting your search or filters.</p>
                            {canAccess([ROLES.ADMIN, ROLES.DEALER]) && (
                                <button className="btn btn-primary" onClick={() => console.log("Initiate new renewal")} style={{ marginTop: 'var(--spacing-md)' }}>Initiate New Renewal</button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const RenewalDetailScreen = () => {
        const renewal = renewals.find(r => r.id === view.params.id);
        if (!renewal) return <div className="main-content">Renewal not found.</div>;

        const contract = contracts.find(c => c.id === renewal.contractId);

        const workflowStages = ['REQUESTED', 'OFFERED', 'APPROVAL', 'COMPLETED'];
        const currentStageIndex = workflowStages.indexOf(renewal.workflowStage);

        const handleRenewalAction = (actionType) => {
            let newStatus = renewal.status;
            switch (actionType) {
                case 'approve_renewal':
                    newStatus = 'COMPLETED';
                    break;
                case 'offer_renewal':
                    newStatus = 'OFFERED';
                    break;
                // Add more actions as needed
                default:
                    break;
            }
            if (newStatus !== renewal.status) {
                handleStatusUpdate('renewal', renewal.id, newStatus, renewal.workflowStage);
                // Also update the associated contract's end date and status if completed
                if (newStatus === 'COMPLETED' && contract) {
                    setContracts(prev => prev.map(c =>
                        c.id === contract.id ? { ...c, endDate: renewal.newEndDate, status: 'ACTIVE' } : c
                    ));
                }
            }
        };

        return (
            <div className="main-content">
                <div className="list-header">
                    <h2>Renewal {renewal.renewalNumber}</h2>
                    <div className="list-header-actions">
                        <div className="status-badge" style={{ backgroundColor: STATUS_COLORS[renewal.status] }}>
                            <span className="status-indicator" style={{ backgroundColor: STATUS_COLORS[renewal.status] }}></span>
                            {STATUS_LABELS[renewal.status]}
                        </div>
                        {canAccess([ROLES.ADMIN, ROLES.DEALER]) && (
                            <>
                                {(renewal.status === 'REQUESTED' && canAccess([ROLES.ADMIN, ROLES.DEALER])) && (
                                    <button className="btn btn-primary" onClick={() => handleRenewalAction('offer_renewal')}>Generate Offer</button>
                                )}
                                {((renewal.status === 'REQUESTED' || renewal.status === 'OFFERED') && canAccess([ROLES.ADMIN])) && (
                                    <button className="btn btn-primary" onClick={() => handleRenewalAction('approve_renewal')}>Approve Renewal</button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="detail-grid">
                    <div className="detail-main">
                        <div className="detail-section">
                            <h4>Renewal Details</h4>
                            <div className="workflow-tracker">
                                {workflowStages.map((stage, index) => (
                                    <div key={stage} className={`workflow-stage ${index <= currentStageIndex ? (index === currentStageIndex ? 'active' : 'completed') : ''}`}>
                                        <span>{STATUS_LABELS[stage] || stage}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="detail-item mt-md"><strong>SLA Status</strong>
                                <span style={{ color: renewal.slaStatus === 'BREACHED' ? 'var(--status-rejected)' : 'var(--accent-color)' }}>
                                    {renewal.slaStatus || 'N/A'} {renewal.slaStatus === 'BREACHED' ? '(Breached)' : ''}
                                </span>
                            </div>
                            <div className="detail-item"><strong>Renewal Number</strong><span>{renewal.renewalNumber}</span></div>
                            <div className="detail-item"><strong>Contract</strong>
                                <a href="#" onClick={() => navigate('CONTRACT_DETAIL', { id: contract?.id })}>{contract?.contractNumber}</a>
                            </div>
                            <div className="detail-item"><strong>Status</strong><span>{STATUS_LABELS[renewal.status]}</span></div>
                            <div className="detail-item"><strong>Request Date</strong><span>{renewal.requestDate}</span></div>
                            <div className="detail-item"><strong>New End Date</strong><span>{renewal.newEndDate}</span></div>
                            <div className="detail-item"><strong>New Premium</strong><span>${renewal.newPremium?.toFixed(2)}</span></div>
                            <div className="detail-item"><strong>Notes</strong><p>{renewal.notes}</p></div>
                        </div>
                    </div>

                    <div className="detail-sidebar">
                        <div className="detail-section">
                            <h4>Audit Log</h4>
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {(renewal.auditLogs || []).length > 0 ? (
                                    (renewal.auditLogs || []).map((log, index) => (
                                        <div key={index} className="activity-item">
                                            <div>
                                                <strong>{log.action}</strong> by {log.user}
                                                <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--text-light-color)' }}>{log.details}</p>
                                            </div>
                                            <span className="timestamp">{log.timestamp}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p>No audit logs available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ProfileScreen = () => {
        return (
            <div className="main-content">
                <div className="card">
                    <h2>User Profile</h2>
                    <p><strong>Name:</strong> John Doe</p>
                    <p><strong>Role:</strong> {currentUserRole}</p>
                    <p><strong>Email:</strong> john.doe@example.com</p>
                    <button className="btn btn-secondary" onClick={() => alert('Profile settings saved!')}>Save Profile</button>
                </div>
            </div>
        );
    };

    // --- Main App Render Logic ---
    let screenContent;
    switch (view.screen) {
        case 'DASHBOARD':
            screenContent = <DashboardScreen />;
            break;
        case 'CONTRACT_LIST':
            screenContent = <ContractListScreen />;
            break;
        case 'CONTRACT_DETAIL':
            screenContent = <ContractDetailScreen />;
            break;
        case 'CONTRACT_FORM':
            screenContent = <ContractFormScreen />;
            break;
        case 'CLAIM_LIST':
            screenContent = <ClaimListScreen />;
            break;
        case 'CLAIM_DETAIL':
            screenContent = <ClaimDetailScreen />;
            break;
        case 'RENEWAL_LIST':
            screenContent = <RenewalListScreen />;
            break;
        case 'RENEWAL_DETAIL':
            screenContent = <RenewalDetailScreen />;
            break;
        case 'PROFILE':
            screenContent = <ProfileScreen />;
            break;
        default:
            screenContent = <DashboardScreen />;
    }

    return (
        <div className="app-container">
            <header className="header">
                <h1>Vehicle Service Contracts</h1>
                <div className="header-controls">
                    <span className="user-info">Logged in as: {currentUserRole}</span>
                    <select
                        style={{ padding: 'var(--spacing-xs)', borderRadius: 'var(--border-radius-sm)' }}
                        value={currentUserRole}
                        onChange={(e) => setCurrentUserRole(e.target.value)}
                    >
                        {Object.values(ROLES).map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                    <button className="btn btn-outline" onClick={() => navigate('PROFILE')}>Profile</button>
                    <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
                </div>
            </header>

            {renderBreadcrumbs()}

            {screenContent}

            <footer className="footer">
                &copy; 2024 Vehicle Service Contracts. All rights reserved.
            </footer>

            {showGlobalSearch && (
                <div className="overlay" onClick={() => setShowGlobalSearch(false)}>
                    <div className="global-search-container" onClick={e => e.stopPropagation()}>
                        <input
                            type="text"
                            placeholder="Search contracts, claims, customers, VINs..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    console.log("Global search submitted:", searchTerm);
                                    setShowGlobalSearch(false);
                                    // In a real app, this would navigate to a search results page
                                    navigate('CONTRACT_LIST', { globalSearch: searchTerm }); // Example
                                }
                            }}
                        />
                        <button className="btn btn-secondary" style={{ marginTop: 'var(--spacing-md)', width: '100%' }} onClick={() => setShowGlobalSearch(false)}>Close</button>
                    </div>
                </div>
            )}

            {showFiltersPanel && (
                <div className="filter-panel-overlay" onClick={() => setShowFiltersPanel(false)}>
                    <div className="filter-panel open" onClick={e => e.stopPropagation()}>
                        <h3>Filters</h3>
                        <div className="form-group">
                            <label htmlFor="statusFilter">Status</label>
                            <select id="statusFilter" name="statusFilter" value={filters.status || ''} onChange={(e) => handleFilterChange('status', e.target.value)}>
                                <option value="">All</option>
                                {Object.keys(STATUS_LABELS).map(statusKey => (
                                    <option key={statusKey} value={statusKey}>{STATUS_LABELS[statusKey]}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="customerNameFilter">Customer Name</label>
                            <input type="text" id="customerNameFilter" name="customerNameFilter" value={filters.customerName || ''} onChange={(e) => handleFilterChange('customerName', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="vehicleMakeFilter">Vehicle Make</label>
                            <input type="text" id="vehicleMakeFilter" name="vehicleMakeFilter" value={filters.vehicleMake || ''} onChange={(e) => handleFilterChange('vehicleMake', e.target.value)} />
                        </div>
                        <div className="filter-actions">
                            <button className="btn btn-secondary" onClick={clearFilters}>Clear</button>
                            <button className="btn btn-primary" onClick={applyFilters}>Apply Filters</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
