
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from './Profile';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as api from '../api/api';

// Mock the API module
vi.mock('../api/api', () => ({
    getUser: vi.fn(),
    updateUser: vi.fn(),
    uploadAvatar: vi.fn(),
    getConnectionCount: vi.fn(),
    getConnectionsList: vi.fn(),
    deletePost: vi.fn(),
    initiateConnection: vi.fn(),
    removeConnection: vi.fn(),
    getInstanceName: vi.fn(),
    getInstanceColor: vi.fn(),
}));

// Mock window.location
const originalLocation = window.location;
const mockLocation = {
    ...originalLocation,
    href: '',
};

describe('Profile Component', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset window.location mock
        mockLocation.href = '';
        Object.defineProperty(window, 'location', {
            writable: true,
            value: mockLocation,
        });
    });

    const mockUser = {
        id: 1,
        username: 'testuser',
        display_name: 'Test User',
        bio: 'This is a test bio',
        email: 'test@example.com',
        avatar_url: 'http://example.com/avatar.jpg',
        posts: [],
        post_count: 0
    };

    const renderProfile = (username = 'testuser') => {
        return render(
            <MemoryRouter initialEntries={[`/profile/${username}`]}>
                <Routes>
                    <Route path="/profile/:identifier" element={<Profile />} />
                </Routes>
            </MemoryRouter>
        );
    };

    it('renders profile information correctly', async () => {
        (api.getUser as any).mockResolvedValue({ data: mockUser });
        (api.getConnectionCount as any).mockResolvedValue({ data: { connection_count: 5 } });
        // Mock local storage for isOwnProfile check
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
            if (key === 'username') return 'testuser';
            return null;
        });

        renderProfile('testuser');

        expect(await screen.findByText('@testuser')).toBeInTheDocument();
        // expect(screen.getByText('Test User')).toBeInTheDocument(); // Display name is not shown in header
        expect(screen.getByText('This is a test bio')).toBeInTheDocument();
        // Check for Edit Profile button since it's own profile
        expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument();
    });

    it('updates username and redirects', async () => {
        (api.getUser as any).mockResolvedValue({ data: mockUser });
        (api.getConnectionCount as any).mockResolvedValue({ data: { connection_count: 5 } });
        (api.updateUser as any).mockResolvedValue({ data: { ...mockUser, username: 'newname' } });
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
            if (key === 'username') return 'testuser';
            return null;
        });

        renderProfile('testuser');

        // Wait for load
        await screen.findByText('@testuser');

        // Click Edit Profile
        fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));

        // Change Username
        const usernameInput = screen.getByLabelText('Username');
        fireEvent.change(usernameInput, { target: { value: 'newname' } });

        // Click Save
        fireEvent.click(screen.getByRole('button', { name: /Save/i }));

        await waitFor(() => {
            expect(api.updateUser).toHaveBeenCalledWith(expect.objectContaining({
                username: 'newname'
            }));
        });

        // Verify redirection
        await waitFor(() => {
            expect(window.location.href).toContain('/profile/newname');
        });
    });

    it('updates email and persists change in edit form', async () => {
        (api.getUser as any).mockResolvedValue({ data: mockUser });
        (api.getConnectionCount as any).mockResolvedValue({ data: { connection_count: 5 } });
        // Mock update response returning the same user but we simulate the fetch returning the new email next
        (api.updateUser as any).mockResolvedValue({ data: { ...mockUser, email: 'newemail@example.com' } });

        // After update, getUser will be called again. We mock it to return updated data.
        (api.getUser as any)
            .mockResolvedValueOnce({ data: mockUser }) // Initial load
            .mockResolvedValueOnce({ data: { ...mockUser, email: 'newemail@example.com' } }); // After save

        vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
            if (key === 'username') return 'testuser';
            return null;
        });

        renderProfile('testuser');

        // Wait for load
        await screen.findByText('@testuser');

        // Click Edit Profile
        fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));

        // Change Email
        const emailInput = screen.getByLabelText('Email');
        fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } });

        // Click Save
        fireEvent.click(screen.getByRole('button', { name: /Save/i }));

        await waitFor(() => {
            expect(api.updateUser).toHaveBeenCalledWith(expect.objectContaining({
                email: 'newemail@example.com'
            }));
        });

        // Expect edit mode to close (Edit Profile button reappears)
        await screen.findByRole('button', { name: /Edit Profile/i });

        // Click Edit Profile again to verify persistence
        fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));

        // Check if email input has the new value
        expect(screen.getByLabelText('Email')).toHaveValue('newemail@example.com');
    });

});
