import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from '../context/ToastContext';

const TestConsumer: React.FC = () => {
  const { toasts, showToast, removeToast, confirm, confirmDialog, closeConfirm } = useToast();

  return (
    <div>
      <button onClick={() => showToast('Success msg', 'success', 'Success Title', 3000)}>
        Show Success Toast
      </button>
      <button onClick={() => showToast('Persistent msg', 'error', 'Error Title', 0)}>
        Show Persistent Toast
      </button>
      <button
        onClick={() =>
          confirm({
            title: 'Delete Item?',
            message: 'Are you sure?',
            onConfirm: () => {},
          })
        }
      >
        Open Confirm
      </button>
      {confirmDialog && (
        <div data-testid="confirm-dialog">
          <span>{confirmDialog.title}</span>
          <button onClick={closeConfirm}>Close Dialog</button>
        </div>
      )}
      <div data-testid="toast-list">
        {toasts.map((t) => (
          <div key={t.id} data-testid={`toast-${t.id}`}>
            <span>{t.message}</span>
            <button onClick={() => removeToast(t.id)}>Dismiss</button>
          </div>
        ))}
      </div>
    </div>
  );
};

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('throws error when useToast is called outside of ToastProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      'useToast must be used within a ToastProvider',
    );

    spy.mockRestore();
  });

  it('shows toast and removes it on click', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );

    const showBtn = screen.getByText('Show Persistent Toast');
    fireEvent.click(showBtn);

    expect(screen.getByText('Persistent msg')).toBeInTheDocument();

    const dismissBtn = screen.getByText('Dismiss');
    fireEvent.click(dismissBtn);

    expect(screen.queryByText('Persistent msg')).not.toBeInTheDocument();
  });

  it('automatically removes toast after specified duration', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );

    const showBtn = screen.getByText('Show Success Toast');
    fireEvent.click(showBtn);

    expect(screen.getByText('Success msg')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(screen.queryByText('Success msg')).not.toBeInTheDocument();
  });

  it('opens and closes confirm dialog', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );

    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();

    const openBtn = screen.getByText('Open Confirm');
    fireEvent.click(openBtn);

    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Item?')).toBeInTheDocument();

    const closeBtn = screen.getByText('Close Dialog');
    fireEvent.click(closeBtn);

    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
  });
});
