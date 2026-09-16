import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HybridTagInput } from '../components/ui/HybridTagInput';

const mockShowToast = vi.fn();
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      if (key === 'modals.addProject.hybridRecognized' && opts?.count) {
        return `Распознано: ${opts.count}`;
      }
      return key;
    },
  }),
}));

const Wrapper: React.FC<{ initialValue?: string }> = ({ initialValue = '' }) => {
  const [val, setVal] = useState(initialValue);
  return <HybridTagInput value={val} onChange={setVal} placeholder="Enter tags" />;
};

describe('HybridTagInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders textarea and format help button when empty', () => {
    render(<Wrapper initialValue="" />);

    expect(screen.getByPlaceholderText('Enter tags')).toBeInTheDocument();
    expect(screen.getByText('modals.addProject.formatsHelpBtn')).toBeInTheDocument();
  });

  it('toggles formats help dropdown', () => {
    render(<Wrapper initialValue="" />);

    const helpBtn = screen.getByText('modals.addProject.formatsHelpBtn');
    fireEvent.click(helpBtn);

    expect(screen.getByText('modals.addProject.formatsHelpTitle')).toBeInTheDocument();
    expect(screen.getByText('modals.addProject.formatExcel')).toBeInTheDocument();

    const closeBtn = screen.getByText('✕');
    fireEvent.click(closeBtn);

    expect(screen.queryByText('modals.addProject.formatsHelpTitle')).not.toBeInTheDocument();
  });

  it('parses input and displays chip tags and recognized counter', () => {
    render(<Wrapper initialValue="branding, 3d-art, web-design" />);

    expect(screen.getByText('Распознано: 3')).toBeInTheDocument();
    expect(screen.getByText('#branding')).toBeInTheDocument();
    expect(screen.getByText('#3d-art')).toBeInTheDocument();
    expect(screen.getByText('#web-design')).toBeInTheDocument();
  });

  it('removes tag when clicking tag chip close button', () => {
    render(<Wrapper initialValue="art, motion, illustration" />);

    const chips = screen.getAllByText('✕');
    // First chip close button corresponds to 'art'
    fireEvent.click(chips[0]);

    expect(screen.queryByText('#art')).not.toBeInTheDocument();
    expect(screen.getByText('#motion')).toBeInTheDocument();
    expect(screen.getByText('#illustration')).toBeInTheDocument();
    expect(screen.getByText('Распознано: 2')).toBeInTheDocument();
  });

  it('clears all tags when clicking clear button', () => {
    render(<Wrapper initialValue="one, two, three" />);

    const clearBtn = screen.getByText('modals.addProject.hybridClearAll');
    fireEvent.click(clearBtn);

    expect(screen.queryByText('#one')).not.toBeInTheDocument();
    expect(screen.queryByText('modals.addProject.hybridClearAll')).not.toBeInTheDocument();
  });

  it('pastes from clipboard and updates value', async () => {
    const mockClipboard = {
      readText: vi.fn().mockResolvedValue('tag1, tag2'),
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      configurable: true,
      writable: true,
    });

    render(<Wrapper initialValue="" />);

    const pasteBtn = screen.getByText('modals.addProject.hybridPasteBtn');
    fireEvent.click(pasteBtn);

    await waitFor(() => {
      expect(mockClipboard.readText).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith('Распознано: 2', 'success', undefined, 1500);
    });
  });
});
