'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowsRightLeft } from 'react-icons/hi2';
import { TbCurrencyDollar } from 'react-icons/tb';
import { Exo_2 } from 'next/font/google';
import { useAlert } from '@/components/AlertContext/AlertContext';

const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const STATUS_PENDING = {
    chip: 'bg-amber-500/10',
    text: 'text-amber-300',
    ring: 'ring-amber-500/30',
    dot: 'bg-amber-400',
    label: 'Pending',
};

export default function Offers() {
    const { addAlert } = useAlert();

    const [leagueId, setLeagueId] = useState(null);
    const [user, setUser] = useState(null);
    const [userTeam, setUserTeam] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [pending, setPending] = useState([]); // all pending offers for this team (either direction)
    const [processingId, setProcessingId] = useState(null); // disable buttons while processing

    // Partitioned views
    const { received, sent } = useMemo(() => {
        if (!pending || !userTeam) return { received: [], sent: [] };
        const r = pending.filter((t) => t?.teamInID?._id === userTeam?._id);
        const s = pending.filter((t) => t?.teamInID?._id !== userTeam?._id);
        return { received: r, sent: s };
    }, [pending, userTeam]);

    const dateFmt = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setLeagueId(sessionStorage.getItem('selectedLeagueID') || null);
            const u = sessionStorage.getItem('user') || localStorage.getItem('user');
            setUser(u ? JSON.parse(u) : null);
        }
    }, []);

    // Find the user's team within the league
    useEffect(() => {
        const fetchLeague = async () => {
            if (!leagueId || !user?.user?.email) return;
            try {
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}fantasyleague?leagueId=${leagueId}`
                );
                if (data?.error) throw new Error(data?.message || 'Failed to fetch league');

                const league = data?.data;
                const mine = league?.teams?.find((t) => t?.user_email === user?.user?.email)?.team;
                if (!mine) {
                    addAlert('No team found for the selected league.', 'error');
                    return;
                }
                setUserTeam(mine);
            } catch (err) {
                addAlert('Error fetching league details. Please reload and try again.', 'error');
            }
        };
        fetchLeague();
    }, [leagueId, user, addAlert]);

    // Load pending offers for this team (as teamIn or teamOut), then filter to Pending
    useEffect(() => {
        const fetchOffers = async () => {
            if (!userTeam?._id) return;
            setIsLoading(true);
            try {
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}transfer?teamID=${userTeam._id}`
                );
                if (data?.error) throw new Error('Failed to fetch offers');

                const items = (data?.data || [])
                    .filter((t) => t?.status === 'Pending')
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setPending(items);
            } catch (err) {
                addAlert('An unexpected error occurred trying to retrieve offers.', 'error');
                setPending([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOffers();
    }, [userTeam, addAlert]);

    // Actions
    const handleAction = async (action, transferId) => {
        if (!transferId || !['accept', 'reject', 'withdraw'].includes(action)) return;
        const confirmText =
            action === 'accept'
                ? 'Accept this offer?'
                : action === 'reject'
                    ? 'Reject this offer?'
                    : 'Withdraw this offer?';

        if (!window.confirm(confirmText)) return;

        try {
            setProcessingId(transferId);
            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}transfer/${action}`;
            await axios.post(url, { transferID: transferId });

            // Optimistic removal from the UI
            setPending((prev) => prev.filter((t) => t._id !== transferId));

            const pastTense = action === 'withdraw' ? 'withdrawn' : `${action}ed`;
            addAlert(`Offer ${pastTense} successfully`, 'success');
        } catch (err) {
            addAlert('Action failed. Please try again.', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            {/* <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <h2 className={`text-xl sm:text-2xl font-bold text-[#FF8A00] ${exo2.className}`}>
                    Offers
                </h2>
                {userTeam && (
                    <div className="text-xs sm:text-sm text-slate-300/80">
                        Your team: <span className="font-semibold text-white">{userTeam?.team_name}</span>
                    </div>
                )}
            </div> */}

            {/* Loading */}
            {isLoading ? (
                <div className="w-full min-h-[70vh] flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Offers Received */}
                    <Section
                        title="Offers Received"
                        emptyText="No active offers received"
                        items={received}
                        dateFmt={dateFmt}
                        onAction={handleAction}
                        processingId={processingId}
                        kind="received"
                    />

                    {/* Offers Sent */}
                    <Section
                        title="Offers Sent"
                        emptyText="No active offers sent"
                        items={sent}
                        dateFmt={dateFmt}
                        onAction={handleAction}
                        processingId={processingId}
                        kind="sent"
                    />
                </>
            )}
        </div>
    );
}

/* ======================= Subcomponents ======================= */

function Section({ title, emptyText, items, dateFmt, onAction, processingId, kind }) {
    return (
        <div className="rounded-xl border border-[#1D374A] bg-gradient-to-br from-[#0C1922] to-[#0C192250] p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="text-lg sm:text-xl font-semibold text-[#FF8A00]">{title}</div>
                <div className="text-xs text-slate-300/70">{items?.length || 0} pending</div>
            </div>

            {!items || items.length === 0 ? (
                <div className="text-center py-12 rounded-lg border border-dashed border-[#1D374A] text-slate-300">
                    {emptyText}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    <AnimatePresence initial={false}>
                        {items.map((item, i) => (
                            <OfferCard
                                key={item._id}
                                item={item}
                                index={i}
                                dateFmt={dateFmt}
                                onAction={onAction}
                                processing={processingId === item._id}
                                kind={kind}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

function OfferCard({ item, index, dateFmt, onAction, processing, kind }) {
    const S = STATUS_PENDING;
    const created = new Date(item.createdAt).toLocaleString('en-US', dateFmt);

    const teamInName = item.teamInID?.team_name ?? 'Team In';
    const teamOutName = item.teamOutID?.team_name ?? 'Team Out';

    const playerIn = item.playerInID;
    const playerOut = item.playerOutID;

    const isFreeIn = !item.teamInID; // usually won't happen on offers, but guarded
    const isFreeOut = !item.teamOutID; // Free Agent source

    const showAmount = (item.amount ?? 0) > 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, delay: index * 0.03 }}
            className={`relative rounded-xl p-2 sm:p-4 border ${S.ring} border-[#1D374A] bg-gradient-to-br from-[#0C1922] to-[#0C192250] backdrop-blur min-w-0`}
        >
            {/* Status Badge */}
            <div className="absolute -top-2 -right-2">
                <div className={`flex items-center gap-2 ${S.chip} ${S.text} px-3 py-1 rounded-full border border-white/5 shadow-lg`}>
                    <span className={`w-2 h-2 rounded-full ${S.dot} animate-pulse`} />
                    <span className="text-[10px] sm:text-xs xl:text-sm font-semibold tracking-wide">
                        {S.label}
                    </span>
                </div>
            </div>

            {/* Header Row (League + Offer tag) */}
            <div className="flex items-center justify-between gap-3 mb-3">
                <div className="min-w-0">
                    <div className="text-[10px] sm:text-xs text-slate-300/70">League</div>
                    <div className="font-semibold truncate text-white">
                        {item.leagueID?.league_name || item.leagueID?.name || '—'}
                    </div>
                </div>
                {item.is_offer && (
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs px-2 py-1 rounded-md bg-[#1D374A] border border-[#2a4960] text-white">
                        <TbCurrencyDollar className="text-[#FF8A00]" />
                        Offer
                    </div>
                )}
            </div>

            {/* Transfer Row */}
            <div className="flex items-stretch gap-3">
                {/* Left (Out) */}
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] sm:text-xs uppercase tracking-wide text-slate-400 mb-1">
                        {isFreeOut ? 'From · Free Agent' : 'From'}
                    </div>

                    {/* Team Out Chip */}
                    {isFreeOut ? (
                        <FreeAgentChip />
                    ) : (
                        <TeamChip
                            name={teamOutName}
                            logo={item.teamOutID?.team_image_path || '/images/default_team_logo.png'}
                        />
                    )}

                    {/* Player Out Card */}
                    <div className="w-full p-2 sm:p-3 rounded-xl border border-[#1D374A] bg-[#0C1922]">
                        <div className="flex justify-between">
                            <div className="text-[10px] sm:text-xs uppercase tracking-wide text-slate-400">
                                Player Out
                            </div>
                            <div className="text-[8px] sm:text-xs bg-[#1D374A] flex items-center justify-center px-1 sm:px-2 sm:py-1 rounded-full text-slate-400 italic">
                                {playerOut?.position_name?.charAt(0) || '—'}
                            </div>
                        </div>
                        <PlayerRow
                            img={playerOut?.image_path}
                            name={playerOut?.common_name}
                            team={playerOut?.team_name}
                        />
                    </div>
                </div>

                {/* Arrow + Amount */}
                <div className="flex flex-col justify-center items-center self-center mt-10 sm:mt-14">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#1D374A] border border-[#2a4960] grid place-content-center text-white shadow-inner">
                        <HiArrowsRightLeft className="text-sm sm:text-lg" />
                    </div>

                    {showAmount && (
                        <div className="mt-2 text-[10px] sm:text-xs px-2 py-1 rounded-full bg-[#1D374A] border border-[#2a4960] text-slate-200 flex items-center gap-1 justify-center">
                            <TbCurrencyDollar className="text-[#FF8A00]" />
                            <span className="font-medium">{item.amount}</span>
                        </div>
                    )}
                </div>

                {/* Right (In) */}
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] sm:text-xs uppercase tracking-wide text-slate-400 mb-1">
                        {isFreeIn ? 'To · Free Agent' : 'To'}
                    </div>

                    {isFreeIn ? (
                        <FreeAgentChip />
                    ) : (
                        <TeamChip
                            name={teamInName}
                            logo={item.teamInID?.team_image_path || '/images/default_team_logo.png'}
                        />
                    )}

                    {/* Player In Card */}
                    <div className="w-full p-2 sm:p-3 rounded-xl border border-[#1D374A] bg-[#0C1922]">
                        <div className="flex justify-between">
                            <div className="text-[10px] sm:text-xs uppercase tracking-wide text-slate-400">
                                Player In
                            </div>
                            <div className="text-[8px] sm:text-xs bg-[#1D374A] flex items-center justify-center px-1 sm:px-2 sm:py-1 rounded-full text-slate-400 italic">
                                {playerIn?.position_name?.charAt(0) || '—'}
                            </div>
                        </div>
                        <PlayerRow
                            img={playerIn?.image_path}
                            name={playerIn?.common_name}
                            team={playerIn?.team_name}
                        />
                    </div>
                </div>
            </div>

            {/* Footer: created + actions */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] sm:text-xs text-slate-300/80">
                <div className="bg-[#0C1922] border border-[#1D374A] rounded-lg px-3 py-2">
                    <div className="text-[8px] sm:text-[10px] uppercase tracking-wide text-slate-400">
                        Submitted
                    </div>
                    <div className="truncate">{created}</div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                    {kind === 'received' ? (
                        <>
                            <ActionButton
                                label="Reject"
                                onClick={() => onAction('reject', item._id)}
                                disabled={processing}
                                variant="secondary"
                            />
                            <ActionButton
                                label="Accept"
                                onClick={() => onAction('accept', item._id)}
                                disabled={processing}
                                variant="primary"
                            />
                        </>
                    ) : (
                        <ActionButton
                            label="Withdraw"
                            onClick={() => onAction('withdraw', item._id)}
                            disabled={processing}
                            variant="secondary"
                        />
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function PlayerRow({ img, name, team }) {
    return (
        <div className="mt-1 flex items-center justify-start gap-2 min-w-0">
            {img ? (
                <img src={img} alt={name || 'Player'} className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg object-cover" />
            ) : (
                <div className="w-10 h-10 rounded-lg bg-[#1D374A]" />
            )}
            <div className="min-w-0">
                <div className="text-xs sm:text-base font-semibold text-white truncate">
                    {name || '—'}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-300/80 truncate">
                    {team || '—'}
                </div>
            </div>
        </div>
    );
}

function TeamChip({ name, logo }) {
    return (
        <div className="flex justify-start items-center gap-2 mb-2 min-w-0">
            <img
                src={logo || '/images/default_team_logo.png'}
                alt={name || 'Team'}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-md object-cover"
            />
            <div className="truncate text-slate-200 text-xs sm:text-sm">{name || '—'}</div>
        </div>
    );
}

function FreeAgentChip() {
    return (
        <div className="flex justify-start items-center gap-2 mb-2 min-w-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 grid place-content-center rounded-md border border-dashed border-[#2a4960] text-[10px] sm:text-xs text-slate-300">
                FA
            </div>
            <div className="truncate text-slate-200 text-xs sm:text-sm">Free Agent</div>
        </div>
    );
}

function ActionButton({ label, onClick, disabled, variant = 'primary' }) {
    const base =
        'px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed';
    const styles =
        variant === 'primary'
            ? 'bg-[#FF8A00] text-black hover:brightness-110'
            : 'bg-[#1D374A] text-white border border-[#2a4960] hover:bg-[#224a60]';

    return (
        <motion.button
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={`${base} ${styles}`}
            disabled={disabled}
            onClick={onClick}
        >
            {label}
        </motion.button>
    );
}
