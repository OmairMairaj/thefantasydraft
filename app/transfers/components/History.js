'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowsRightLeft } from 'react-icons/hi2';
import { TbCurrencyDollar } from 'react-icons/tb';
import { useAlert } from '@/components/AlertContext/AlertContext';

const STATUS_STYLES = {
    Approved: {
        chip: 'bg-emerald-500/10',
        text: 'text-emerald-300',
        ring: 'ring-emerald-500/30',
        dot: 'bg-emerald-400',
        label: 'Approved',
    },
    Rejected: {
        chip: 'bg-rose-500/10',
        text: 'text-rose-300',
        ring: 'ring-rose-500/30',
        dot: 'bg-rose-400',
        label: 'Rejected',
    },
    Pending: {
        chip: 'bg-amber-500/10',
        text: 'text-amber-300',
        ring: 'ring-amber-500/30',
        dot: 'bg-amber-400',
        label: 'Pending',
    },
    'Expired - Void': {
        chip: 'bg-slate-500/10',
        text: 'text-slate-300',
        ring: 'ring-slate-500/30',
        dot: 'bg-slate-400',
        label: 'Expired · Void',
    },
};

const History = () => {
    const { addAlert } = useAlert();
    const [leagueId, setLeagueId] = useState(null);
    const [history, setHistory] = useState(null);
    const [statusFilter, setStatusFilter] = useState('All');
    const [q, setQ] = useState('');

    const dateFmt = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = sessionStorage.getItem('selectedLeagueID');
            setLeagueId(stored);
        }
    }, []);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!leagueId) return;
            try {
                const URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}transfer?leagueID=${leagueId}`;
                const { data } = await axios.get(URL);
                if (data?.error) {
                    addAlert('Could not load transfer history.', 'error');
                    setHistory([]);
                    return;
                }
                const items = (data?.data || []).sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setHistory(items);
                console.log('Fetched history:', items);
            } catch {
                addAlert('An unexpected error occurred while loading history.', 'error');
                setHistory([]);
            }
        };
        fetchHistory();
    }, [leagueId, addAlert]);

    const filtered = useMemo(() => {
        if (!history) return [];
        const needle = q.trim().toLowerCase();
        return history.filter((item) => {
            const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
            if (!needle) return matchesStatus;
            const pool = [
                item?.playerInID?.common_name,
                item?.playerOutID?.common_name,
                item?.teamInID?.team_name,
                item?.teamOutID?.team_name,
                item?.leagueID?.name,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return matchesStatus && pool.includes(needle);
        });
    }, [history, q, statusFilter]);

    return (
        <div className="space-y-4 mt-0">
            {/* Header + Filters */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                {/* <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#FF8A00]">Transfer History</h2>
                    <p className="text-xs sm:text-sm text-slate-300/80">
                        Review approved, pending, rejected, and expired activity.
                    </p>
                </div> */}

                <div className="flex flex-col md:flex-row w-full gap-2 md:items-center md:justify-between">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search player, team, league…"
                        className="w-full md:w-64 lg:w-1/2 px-3 py-1.5 xl:py-2 rounded-lg text-xs sm:text-sm bg-[#1D374A] text-white placeholder-slate-400 border border-[#2a4960] focus:outline-none focus:border-[#FF8A00]"
                    />
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-[#1D374A] border border-[#2a4960]">
                        <button
                            onClick={() => setStatusFilter('All')}
                            className={`px-3 py-1 rounded-md text-[10px] sm:text-sm ${statusFilter === 'All' ? 'bg-[#FF8A00] text-black' : 'text-white'
                                }`}
                        >
                            All
                        </button>
                        {['Approved', 'Pending', 'Rejected', 'Expired - Void'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-2.5 sm:px-3 py-1 rounded-md text-[10px] sm:text-sm ${statusFilter === s ? 'bg-[#FF8A00] text-black' : 'text-white'
                                    }`}
                            >
                                {STATUS_STYLES[s].label}
                            </button>
                        ))}
                    </div>


                </div>
            </div>

            {/* Content */}
            {!history ? (
                <div className="w-full min-h-[70vh] flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 rounded-xl border border-[#1D374A] bg-gradient-to-br from-[#0C1922] to-[#0C192250] text-slate-300">
                    <div className="text-3xl mb-2">😶‍🌫️</div>
                    <div className="font-semibold">No transfers match your filters</div>
                    <div className="text-sm opacity-80 mt-1">Try a different status or search term.</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-3 sm:gap-4">
                    <AnimatePresence initial={false}>
                        {filtered.map((item, i) => {
                            const S = STATUS_STYLES[item.status];
                            const created = new Date(item.createdAt).toLocaleString('en-US', dateFmt);
                            const updated = new Date(item.updatedAt).toLocaleString('en-US', dateFmt);

                            const leagueName = item.leagueID?.league_name ?? 'League';
                            const teamInName = item.teamInID?.team_name ?? 'Team In';
                            const teamOutName = item.teamOutID?.team_name ?? 'Team Out';

                            const playerIn = item.playerInID;
                            const playerOut = item.playerOutID;

                            return (
                                <motion.div
                                    key={item._id}
                                    layout
                                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 12, scale: 0.98 }}
                                    transition={{ duration: 0.25, delay: i * 0.03 }}
                                    className={`relative rounded-xl p-2 sm:p-4 border ${S.ring} border-[#1D374A] bg-gradient-to-br from-[#0C1922] to-[#0C192250] backdrop-blur min-w-0`}
                                >
                                    {/* Status Badge */}
                                    <div className="absolute -top-2 -right-2">
                                        <div className={`flex items-center gap-2 ${S.chip} ${S.text} px-3 py-1 rounded-full border border-white/5 shadow-lg`}>
                                            <span className={`w-2 h-2 rounded-full ${S.dot} ${item.status === 'Pending' ? 'animate-pulse' : ''}`} />
                                            <span className="text-[10px] sm:text-xs xl:text-sm font-semibold tracking-wide">
                                                {S.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Header */}
                                    {/* <div className="flex items-center justify-between gap-3 mb-4">
                                        <div className="min-w-0">
                                            <div className="text-xs text-slate-300/70">League</div>
                                            <div className="font-semibold truncate text-white">{leagueName}</div>
                                        </div>
                                        {item.is_offer && (
                                            <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-[#1D374A] border border-[#2a4960] text-white">
                                                <TbCurrencyDollar className="text-[#FF8A00]" />
                                                Offer
                                            </div>
                                        )}
                                    </div> */}

                                    {/* Transfer Row */}
                                    <div className="flex items-stretch gap-3">
                                        {/* Left (Out) */}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[10px] sm:text-xs uppercase tracking-wide text-slate-400 mb-1">From</div>

                                            {/* Team Out Chip */}
                                            {item.teamOutID ? (
                                                <div className={`flex justify-start items-center gap-2 mb-2 min-w-0`}>
                                                    <img src={item.teamOutID?.team_image_path || '/images/default_team_logo.png'} alt={teamOutName || 'Team'} className="w-6 h-6 sm:w-8 sm:h-8 rounded-md object-cover" />
                                                    <div className="truncate text-slate-200 text-xs sm:text-sm">{teamOutName || '—'}</div>
                                                </div>
                                            ) : (
                                                <div className="flex justify-start items-center gap-2 mb-2 min-w-0">
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 grid place-content-center rounded-md border border-dashed border-[#2a4960] text-[10px] sm:text-xs text-slate-300">
                                                        FA
                                                    </div>
                                                    <div className="truncate text-slate-200 text-xs sm:text-sm">Free Agent</div>
                                                </div>
                                            )}

                                            {/* Player Out Card */}
                                            <div className={`w-full p-2 sm:p-3 rounded-xl border border-[#1D374A] bg-[#0C1922]`}>
                                                <div className='flex justify-between'>
                                                    <div className="text-[10px] sm:text-xs uppercase tracking-wide text-slate-400">Player Out</div>
                                                    <div className="text-[8px] sm:text-xs bg-[#1D374A] flex items-center justify-center px-1 sm:px-2 sm:py-1 rounded-full text-slate-400 italic">{playerOut?.position_name.charAt(0) || '—'}</div>
                                                </div>
                                                <div className={`mt-1 flex items-center justify-start gap-2 min-w-0`}>
                                                    {playerOut?.image_path ? (
                                                        <img src={playerOut?.image_path} alt={playerOut?.common_name || 'Player'} className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-[#1D374A]" />
                                                    )}
                                                    <div className={`min-w-0`}>
                                                        <div className="text-xs sm:text-base font-semibold text-white truncate">{playerOut?.common_name || '—'}</div>
                                                        <div className="text-[10px] sm:text-xs text-slate-300/80 truncate">
                                                            {playerOut?.team_name || '—'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <div className="flex flex-col justify-center items-center self-center mt-10 sm:mt-14">
                                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#1D374A] border border-[#2a4960] grid place-content-center text-white shadow-inner">
                                                <HiArrowsRightLeft className="text-sm sm:text-lg" />
                                            </div>

                                            {(item.amount ?? 0) > 0 && (
                                                <div className="mt-2 text-[10px] sm:text-xs px-2 py-1 rounded-full bg-[#1D374A] border border-[#2a4960] text-slate-200 flex items-center gap-1 justify-center">
                                                    <TbCurrencyDollar className="text-[#FF8A00]" />
                                                    <span className="font-medium">{item.amount}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right (In) */}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[10px] sm:text-xs uppercase tracking-wide text-slate-400 mb-1">To</div>
                                            {/* Team In Chip */}
                                            <div className={`flex justify-start items-center gap-2 mb-2 min-w-0`}>
                                                <img src={item.teamInID?.team_image_path || '/images/default_team_logo.png'} alt={teamInName || 'Team'} className="w-6 h-6 sm:w-8 sm:h-8 rounded-md object-cover" />
                                                <div className="truncate text-slate-200 text-xs sm:text-sm">{teamInName || '—'}</div>
                                            </div>
                                            {/* Player In Card */}
                                            <div className={`w-full p-2 sm:p-3 rounded-xl border border-[#1D374A] bg-[#0C1922] `}>
                                                <div className='flex justify-between'>
                                                    <div className="text-[10px] sm:text-xs uppercase tracking-wide text-slate-400">Player In</div>
                                                    <div className="text-[8px] sm:text-xs bg-[#1D374A] flex items-center justify-center px-1 sm:px-2 sm:py-1 rounded-full text-slate-400 italic">{playerIn?.position_name.charAt(0) || '—'}</div>
                                                </div>
                                                <div className={`mt-1 flex items-center justify-start gap-2 min-w-0`}>
                                                    {playerIn?.image_path ? (
                                                        <img src={playerIn?.image_path} alt={playerIn?.common_name || 'Player'} className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-[#1D374A]" />
                                                    )}
                                                    <div className={`min-w-0`}>
                                                        <div className="text-xs sm:text-base font-semibold text-white truncate">{playerIn?.common_name || '—'}</div>
                                                        <div className="text-[10px] sm:text-xs text-slate-300/80 truncate">
                                                            {playerIn?.team_name || '—'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] sm:text-xs text-slate-300/80">
                                        <div className="bg-[#0C1922] border border-[#1D374A] rounded-lg px-3 py-2">
                                            <div className="text-[8px] sm:text-[10px] uppercase tracking-wide text-slate-400">Created</div>
                                            <div className="truncate">{created}</div>
                                        </div>
                                        <div className="bg-[#0C1922] border border-[#1D374A] rounded-lg px-3 py-2">
                                            <div className="text-[8px] sm:text-[10px] uppercase tracking-wide text-slate-400">Updated</div>
                                            <div className="truncate">{updated}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default History;

/* —————— Small presentational helpers —————— */

function TeamChip({ name, logo, align = 'left' }) {
    return (
        <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'} items-center gap-2 mb-2 min-w-0`}>
            {logo ? (
                <img src={logo} alt={name || 'Team'} className="w-5 h-5 rounded-md object-cover" />
            ) : (
                <div className="w-5 h-5 rounded-md bg-[#1D374A]" />
            )}
            <div className="truncate text-slate-200 text-xs">{name || '—'}</div>
        </div>
    );
}

function PlayerCard({ title, name, team, role, img, align = 'left' }) {
    return (
        <div className={`w-full p-3 rounded-xl border border-[#1D374A] bg-[#0C1922] ${align === 'right' ? 'text-right' : ''}`}>
            <div className="text-[10px] uppercase tracking-wide text-slate-400">{title}</div>
            <div className={`mt-1 flex items-center ${align === 'right' ? 'justify-end' : 'justify-start'} gap-2 min-w-0`}>
                {img ? (
                    <img src={img} alt={name || 'Player'} className="w-9 h-9 rounded-lg object-cover" />
                ) : (
                    <div className="w-9 h-9 rounded-lg bg-[#1D374A]" />
                )}
                <div className={`min-w-0 ${align === 'right' ? 'text-right' : ''}`}>
                    <div className="font-semibold text-white truncate">{name || '—'}</div>
                    <div className="text-[11px] text-slate-300/80 truncate">
                        {team || '—'} {role ? <span className="text-slate-500">· {role}</span> : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
