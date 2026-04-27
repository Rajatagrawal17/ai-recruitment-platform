import React from 'react';
import { render, screen } from '@testing-library/react';
import SimpleRecruiterDashboard from '../SimpleRecruiterDashboard';

// Mock API calls used by the component
jest.mock('../../services/api', () => ({
  getJobs: jest.fn(() => Promise.resolve({ data: { jobs: [] } })),
  getAnalytics: jest.fn(() => Promise.resolve({ data: { analytics: null } })),
  getJobCandidates: jest.fn(() => Promise.resolve({ data: { matchedCandidates: [] } })),
}));

describe('SimpleRecruiterDashboard', () => {
  it('renders header and post job button', async () => {
    render(<SimpleRecruiterDashboard />);
    expect(screen.getByText(/Recruiter Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Post Job/i)).toBeInTheDocument();
  });
});
