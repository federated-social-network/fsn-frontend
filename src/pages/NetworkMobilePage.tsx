import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUserPlus, FiCheck } from "react-icons/fi";
import { getPendingConnections, getRandomUsers, initiateConnection, acceptConnection } from "../api/api";
import SketchCard from "../components/SketchCard";

export default function NetworkMobilePage() {
    const navigate = useNavigate();
    const [pendingInvites, setPendingInvites] = useState<any[]>([]);
    const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNetworkData = async () => {
            setLoading(true);
            try {
                const [invitesRes, usersRes] = await Promise.all([
                    getPendingConnections(),
                    getRandomUsers()
                ]);

                setPendingInvites(Array.isArray(invitesRes.data) ? invitesRes.data : []);

                const usersData = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.users || []);
                const mappedUsers = usersData.map((u: any) => ({
                    username: u.username || u,
                    instance: u.instance || 'local',
                    avatar_url: u.avatar_url || null
                }));
                setSuggestedUsers(mappedUsers);
            } catch (err) {
                console.error("Failed to load network data", err);
            } finally {
                setLoading(false);
            }
        };

        loadNetworkData();
    }, []);

    const handleAccept = async (connectionId: string) => {
        try {
            await acceptConnection(connectionId);
            setPendingInvites(prev => prev.filter(i => i.connection_id !== connectionId));
        } catch (err) {
            console.error("Failed to accept", err);
        }
    };

    const handleConnect = async (e: React.MouseEvent, targetUsername: string) => {
        e.preventDefault();
        e.stopPropagation();

        setSentRequests(prev => {
            const next = new Set(prev);
            next.add(targetUsername);
            return next;
        });

        try {
            await initiateConnection(targetUsername);
        } catch (err) {
            console.error("Failed to connect", err);
            setSentRequests(prev => {
                const next = new Set(prev);
                next.delete(targetUsername);
                return next;
            });
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="shrink-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="font-hand text-lg hover:text-[var(--primary)] flex items-center gap-2">
                    <FiArrowLeft className="text-xl" /> Network
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide pb-24">
                {/* Pending Invites */}
                <SketchCard variant="paper" className="p-4 bg-[var(--pastel-pink)] mb-6">
                    <h3 className="font-sketch text-2xl mb-4 border-b-2 border-black/10 pb-2">Pending Invites</h3>
                    {loading ? (
                        <div className="text-center font-hand opacity-50">Checking...</div>
                    ) : pendingInvites.length > 0 ? (
                        <div className="space-y-3">
                            {pendingInvites.map((invite: any) => (
                                <div key={invite.connection_id} className="bg-white/80 p-3 rounded-lg border border-black/10 flex items-center justify-between shadow-sm">
                                    <div className="font-hand text-lg break-all pr-2 flex-1">
                                        {invite.from_username || "Unknown"}
                                    </div>
                                    <button
                                        onClick={() => handleAccept(invite.connection_id)}
                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-md font-bold text-sm shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-px active:shadow-none transition-all flex items-center gap-1"
                                    >
                                        <FiCheck /> Accept
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 font-hand opacity-60 italic text-lg">
                            No pending invites.
                        </div>
                    )}
                </SketchCard>

                {/* Suggested Users */}
                <SketchCard variant="paper" className="p-4 bg-[var(--pastel-blue)]">
                    <h3 className="font-sketch text-2xl mb-4 border-b-2 border-black/10 pb-2">Discover People</h3>
                    {loading ? (
                        <div className="text-center font-hand opacity-50">Searching for signs...</div>
                    ) : suggestedUsers.length > 0 ? (
                        <div className="space-y-3">
                            {suggestedUsers.map((u: any) => (
                                <Link key={u.username} to={`/profile/${u.username}`} className="block">
                                    <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl hover:bg-white transition-colors border border-black/5 shadow-sm">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-[var(--pastel-yellow)] border border-black flex items-center justify-center font-sketch text-xl shrink-0 shadow-sm overflow-hidden">
                                            {u.avatar_url ? (
                                                <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                                            ) : (
                                                u.username[0].toUpperCase()
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="overflow-hidden flex-1 flex flex-col justify-center">
                                            <div className="font-bold font-hand truncate text-lg leading-tight text-gray-800">
                                                {u.username}
                                            </div>
                                            <div className="text-xs bg-black/5 px-2 py-0.5 rounded-full inline-block truncate w-fit max-w-full text-gray-600 mt-1 border border-black/5">
                                                {u.instance || 'local'}
                                            </div>
                                        </div>

                                        {/* Connect Button */}
                                        <div className="shrink-0 ml-2">
                                            {sentRequests.has(u.username) ? (
                                                <span className="text-sm font-hand text-green-700 bg-green-100 px-3 py-1.5 rounded-lg border border-green-300 flex items-center gap-1 shadow-sm">
                                                    <FiCheck /> Sent
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={(e) => handleConnect(e, u.username)}
                                                    className="bg-[var(--ink-blue)] text-white text-sm px-3 py-1.5 rounded-lg font-hand shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-px active:shadow-none transition-all flex items-center gap-1"
                                                >
                                                    <FiUserPlus /> Connect
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 font-hand opacity-60 italic text-lg">
                            No users found right now.
                        </div>
                    )}
                </SketchCard>
            </div>
        </div>
    );
}
