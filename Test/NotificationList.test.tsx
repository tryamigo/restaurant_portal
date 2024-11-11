import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationList from '@/components/NotificationList';
import { format } from 'date-fns';

// Mock the useNotifications hook
jest.mock('@/contexts/NotificationContext', () => ({
  useNotifications: jest.fn(),
}));

describe('NotificationList', () => {
  const mockDismissNotification = jest.fn();
  const mockNotifications = [
    {
      id: '1',
      message: 'Order #1234 received',
      order: { total: 29.99 },
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      message: 'Order #5678 received',
      order: { total: 59.99 },
      timestamp: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    // Set up the mock implementation for useNotifications
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: mockNotifications,
      dismissNotification: mockDismissNotification,
    });
  });

  it('renders notification list with correct data', () => {
    render(<NotificationList />);

    expect(screen.getByText(`New Orders (${mockNotifications.length})`)).toBeInTheDocument();

    mockNotifications.forEach((notification) => {
      expect(screen.getByText(notification.message)).toBeInTheDocument();
    });
  });

  it('calls dismissNotification when the dismiss button is clicked', () => {
    render(<NotificationList />);

    const dismissButtons = screen.getAllByText('Dismiss');
    expect(dismissButtons).toHaveLength(mockNotifications.length);

    fireEvent.click(dismissButtons[0]);
    expect(mockDismissNotification).toHaveBeenCalledWith(mockNotifications[0].id);
  });

  it('does not render anything if there are no notifications', () => {
    // Set up the mock implementation to return an empty array
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      dismissNotification: mockDismissNotification,
    });

    const { container } = render(<NotificationList />);
    expect(container).toBeEmptyDOMElement();
  });
});
