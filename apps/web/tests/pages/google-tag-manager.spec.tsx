import { render, screen } from '@testing-library/react';

import { GoogleTagManagerComponent } from '@/components/google-tag-manager';
import { useSessionUser } from '@/components/user/user-context';

jest.mock('@/components/user/user-context', () => ({
  useSessionUser: jest.fn(() => ({
    user: { name: 'Test User', email: 'test.user@example.com' },
    isLoading: false,
    selectedUniversity: {
      id: 'university-id',
      name: 'Test University',
      role: 'alumni',
    },
  })),
  useFetchMetrics: jest.fn(() => ({
    data: [
      { date: '2024-10-01', count: 10 },
      { date: '2024-10-02', count: 15 },
      { date: '2024-10-03', count: 20 },
    ],
    isLoading: false,
    isError: false,
  })),
}));

jest.mock('@next/third-parties/google', () => ({
  GoogleTagManager: jest.fn(() => (
    <div data-testid="google-tag-manager-testing" />
  )),
}));

describe('GoogleTagManagerTest', () => {
  it('should return the component', () => {
    const mockUser = {
      name: 'Test User',
      email: 'test.user@example.com',
      gtmId: 'testId',
    };
    (useSessionUser as jest.Mock).mockReturnValueOnce({
      user: mockUser,
      isLoading: false,
      selectedUniversity: {
        id: 'university-id',
        name: 'Test University',
        role: 'alumni',
      },
    });

    render(<GoogleTagManagerComponent />);
    const element = screen.getByTestId('google-tag-manager-testing');
    expect(element).toBeInTheDocument();
  });

  it('should return null', () => {
    const mockUser = {
      name: 'Test User',
      email: 'test.user@example.com',
    };
    (useSessionUser as jest.Mock).mockReturnValueOnce({
      user: mockUser,
      isLoading: false,
      selectedUniversity: {
        id: 'university-id',
        name: 'Test University',
        role: 'alumni',
      },
    });

    render(<GoogleTagManagerComponent />);
    const element = screen.queryByTestId('google-tag-manager-testing');
    expect(element).toBeNull();
  });
});
