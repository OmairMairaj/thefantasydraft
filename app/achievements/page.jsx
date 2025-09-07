'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Exo_2 } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLock, FaSearch, FaUserCircle } from 'react-icons/fa';
import { HiSparkles, HiTrophy } from 'react-icons/hi2';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/components/AlertContext/AlertContext';

const exo2 = Exo_2({
    weight: ['400', '500', '600', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const Achievements = () => {
    const router = useRouter();
    const { addAlert } = useAlert();

    const [user, setUser] = useState(null);
    const [leagueId, setLeagueId] = useState(null);
    const [leagueData, setLeagueData] = useState(null);
    const [userTeam, setUserTeam] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingGrid, setIsLoadingGrid] = useState(true);

    const [allAchievements, setAllAchievements] = useState([]);   // master list from DB
    const [userAch, setUserAch] = useState([]);                   // [{achievement, unlocked, count}]
    const [q, setQ] = useState('');
    const [tab, setTab] = useState('All'); // All | Unlocked | Locked

    /* ----------------------- boot: user + league ----------------------- */
    useEffect(() => {
        if (typeof window === 'undefined') return;

        let userData = null;
        if (sessionStorage.getItem('user')) {
            userData = JSON.parse(sessionStorage.getItem('user'));
        } else if (localStorage.getItem('user')) {
            userData = JSON.parse(localStorage.getItem('user'));
        } else {
            router.push('/login?redirect=' + window.location.toString());
            return;
        }

        if (userData?.user) {
            setUser(userData.user);
            const storedLeagueID = sessionStorage.getItem('selectedLeagueID');
            if (storedLeagueID) setLeagueId(storedLeagueID);
        }
    }, [router]);

    useEffect(() => {
        const run = async () => {
            if (!user?.email || !leagueId) return;
            try {
                // load league (to show header block)
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}fantasyleague?leagueId=${leagueId}`
                );
                if (data?.error) {
                    addAlert(data?.message || 'Failed to load league.', 'error');
                    return;
                }
                const league = data?.data;
                setLeagueData(league);
                const mine = league?.teams?.find(t => t.user_email === user.email)?.team;
                if (!mine) {
                    addAlert('No team found for the selected league.', 'error');
                    return;
                }
                setUserTeam(mine);
            } catch (err) {
                addAlert('Error fetching league details.', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        run();
    }, [user, leagueId, addAlert]);

    /* ----------------------- achievements data ------------------------ */
    useEffect(() => {
        const loadAchievements = async () => {
            setIsLoadingGrid(true);
            try {
                // 1) Master achievements list
                let master = [];
                try {
                    // prefer concise route if you have it
                    const resA = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}achievement`);
                    if (!resA.data?.error) master = resA.data?.data || [];
                } catch {
                    // fallback to fantasyachievement if that’s your route
                    const resB = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}fantasyachievement`);
                    if (!resB.data?.error) master = resB.data?.data || [];
                }
                setAllAchievements(master);

                // 2) User achievements
                // Try to use session user first (some apps store full user here)
                let uAchievements = user?.achievements || [];
                if (!uAchievements?.length) {
                    try {
                        // Try a user endpoint by email; change to your actual route if different
                        const resU = await axios.get(
                            `${process.env.NEXT_PUBLIC_BACKEND_URL}user?email=${encodeURIComponent(user?.email || '')}`
                        );
                        if (!resU.data?.error) {
                            uAchievements = resU.data?.data?.achievements || [];
                        }
                    } catch {
                        // fallback: by id if available
                        if (user?._id) {
                            const resU2 = await axios.get(
                                `${process.env.NEXT_PUBLIC_BACKEND_URL}user/${user._id}`
                            );
                            if (!resU2.data?.error) {
                                uAchievements = resU2.data?.data?.achievements || [];
                            }
                        }
                    }
                }
                setUserAch(uAchievements);
            } catch (err) {
                addAlert('Failed to load achievements.', 'error');
                setAllAchievements([]);
                setUserAch([]);
            } finally {
                setIsLoadingGrid(false);
            }
        };
        if (user) loadAchievements();
    }, [user, addAlert]);

    /* --------------------- merge + filter + metrics -------------------- */
    const merged = useMemo(() => {
        // Map user achievements by achievement id
        const map = new Map();
        (userAch || []).forEach(u => {
            const id = typeof u.achievement === 'object' ? u.achievement?._id : u.achievement;
            map.set(String(id), { unlocked: !!u.unlocked || (u.count || 0) > 0, count: u.count || 0 });
        });

        // Build display list from master
        const base = (allAchievements || []).map(a => {
            const id = String(a._id || a.id);
            const mine = map.get(id);
            return {
                _id: id,
                name: a.name,
                desc: a.desc,
                image_path: a.image_path,
                unlocked: mine?.unlocked || false,
                count: mine?.count || 0,
            };
        });

        // Include user-only achievements in case master didn’t return them
        userAch?.forEach(u => {
            const id = String(typeof u.achievement === 'object' ? u.achievement?._id : u.achievement);
            if (!base.find(b => b._id === id) && typeof u.achievement === 'object') {
                base.push({
                    _id: id,
                    name: u.achievement?.name || 'Achievement',
                    desc: u.achievement?.desc || '',
                    image_path: u.achievement?.image_path || '',
                    unlocked: !!u.unlocked || (u.count || 0) > 0,
                    count: u.count || 0,
                });
            }
        });

        // Sort: Unlocked first, then by name
        base.sort((a, b) => {
            if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
            return a.name.localeCompare(b.name);
        });

        return base;
    }, [allAchievements, userAch]);

    const acquiredCount = useMemo(
        () => merged.filter(m => m.unlocked).length,
        [merged]
    );

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        return merged.filter(a => {
            const matchesTab =
                tab === 'All' ? true : tab === 'Unlocked' ? a.unlocked : !a.unlocked;
            if (!needle) return matchesTab;
            const hay = `${a.name} ${a.desc}`.toLowerCase();
            return matchesTab && hay.includes(needle);
        });
    }, [merged, q, tab]);

    /* ------------------------------ UI ------------------------------- */
    if (isLoading) {
        return (
            <div className="w-full min-h-[70vh] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-t-[#FF8A00] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className={`min-h-[70vh] flex flex-col my-6 text-white px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20 pb-10 ${exo2.className}`}>
            {/* Header / Team Block */}
            <div className="bg-[#0C1922] rounded-xl p-4 sm:p-6 border border-[#1D374A] mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-0 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        {user && user.first_name ?
                            <div className={`flex justify-center items-center w-10 h-10 sm:w-14 sm:h-14 xl:w-16 xl:h-16 rounded-full bg-[#1D374A]`}>
                                <h2 className={`text-slate-300 text-base sm:text-3xl xl:text-4xl flex justify-center items-center font-bold pr-[2px] ${exo2.className}`}>{user.first_name.charAt(0).toUpperCase()}</h2>
                            </div>
                            :
                            <FaUserCircle className="text-2xl lg:text-3xl" />
                        }
                        {/* <img
                            src={userTeam?.team_image_path || '/images/default_team_logo.png'}
                            alt={userTeam?.team_name || 'Team'}
                            className="w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 rounded-lg object-cover shrink-0"
                        /> */}
                        <div className="min-w-0 max-w-[75vw] sm:max-w-none">
                            <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-extrabold uppercase leading-tight truncate">
                                {(user?.first_name && user?.last_name)
                                    ? `${user.first_name} ${user.last_name}`
                                    : (userTeam?.team_name || 'Your Team')}
                            </div>
                            <div className="text-[11px] sm:text-xs md:text-sm xl:text-base text-slate-300 truncate">
                                {user?.email || 'League'}
                            </div>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="w-full sm:w-auto text-right">
                        <div className='flex flex-row-reverse justify-between sm:flex-col w-full text-right items-end'>
                            <div className="text-2xl md:text-3xl xl:text-4xl font-extrabold">
                                {acquiredCount}
                                <span className="text-lg md:text-xl xl:text-2xl text-slate-300">
                                    /{merged.length}
                                </span>
                            </div>
                            <div className="text-[11px] md:text-sm text-slate-400">Achievements Unlocked</div>
                        </div>
                        <div className="mt-2 w-full sm:w-44 md:w-56 h-2 rounded-full bg-[#102531] overflow-hidden">
                            <div
                                className="h-full bg-[#FF8A00] transition-all"
                                style={{ width: `${merged.length ? (acquiredCount / merged.length) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-[#102531] border border-[#1D374A] w-full sm:w-auto">
                        {['All', 'Unlocked', 'Locked'].map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`px-3 py-1 rounded-md text-xs sm:text-sm ${tab === t ? 'bg-[#FF8A00] text-black' : 'text-white'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-72">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                        <input
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            placeholder="Search achievements…"
                            className="w-full pl-8 pr-3 py-2 rounded-lg text-sm bg-[#102531] text-white placeholder-slate-400 border border-[#1D374A] focus:outline-none focus:border-[#FF8A00]"
                        />
                    </div>
                </div>
            </div>

            {/* Grid */}
            {isLoadingGrid ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-40 lg:h-48 rounded-xl bg-[#0C1922] border border-[#1D374A] animate-pulse"
                        />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 rounded-xl border border-[#1D374A] bg-gradient-to-br from-[#0C1922] to-[#0C192250] text-slate-300">
                    <div className="text-3xl mb-2">🏅</div>
                    <div className="font-semibold">No achievements match your filters</div>
                    <div className="text-sm opacity-80 mt-1">Try a different tab or search term.</div>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    <AnimatePresence initial={false}>
                        {filtered.map((ach, i) => (
                            <AchievementCard key={ach._id} ach={ach} index={i} />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default Achievements;

/* ========================= Card component ========================= */

function AchievementCard({ ach, index }) {
    const unlocked = !!ach.unlocked;
    const count = ach.count || 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.25, delay: index * 0.03 }}
            className={`group relative h-40 lg:h-48 rounded-xl border overflow-hidden backdrop-blur
        ${unlocked ? 'border-[#1D374A] ring-1 ring-emerald-400/10' : 'border-[#1D374A]'}`}
        >
            {/* Image / Art */}
            <div className="absolute inset-0">
                {ach.image_path ? (
                    <img
                        src={ach.image_path}
                        alt={ach.name}
                        className={`w-full h-full object-cover transition-transform duration-300
              ${unlocked ? 'group-hover:scale-[1.03]' : 'opacity-40'} `}
                    />
                ) : (
                    <div className="w-full h-full bg-[#0C1922]" />
                )}
            </div>

            {/* Lock overlay when locked */}
            {!unlocked && (
                <div className="absolute inset-0 bg-[#0C1922]/70 backdrop-blur-[1px] grid place-items-center">
                    <div className="flex flex-col items-center text-slate-300">
                        <FaLock className="text-base sm:text-lg opacity-80" />
                        <div className="text-[10px] sm:text-xs mt-1 opacity-80">Locked</div>
                    </div>
                </div>
            )}

            {/* Gradient edge + hover glow */}
            <div
                className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${unlocked ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
                style={{
                    boxShadow:
                        unlocked
                            ? 'inset 0 0 0 1px rgba(255,138,0,.35), 0 0 24px rgba(255,138,0,.35)'
                            : 'inset 0 0 0 1px rgba(255,255,255,.05)',
                }}
            />

            {/* Top badges */}
            <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
                {/* Unlocked flair */}
                {unlocked && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#58360fa4] border border-[#FF8A00] text-amber-100 text-[10px]">
                        <HiTrophy className="text-[#FF8A00]" />
                        Unlocked
                    </div>
                )}
                {/* Count badge if multi-unlock */}
                {unlocked && count > 1 && (
                    <motion.div
                        key={`count-${count}`}
                        initial={{ opacity: 0, y: -4, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                        className="relative ml-auto"
                    >
                        {/* Outer glow ring (spins slowly) */}
                        <div
                            className="pointer-events-none absolute -inset-[2px] rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#FF8A00_0%,#FFD08A_25%,#FF8A00_50%,#FFD08A_75%,#FF8A00_100%)] opacity-60 blur-[3px] animate-[spin_6s_linear_infinite]"
                            aria-hidden
                        />

                        {/* Soft pulse halo */}
                        <span
                            className="pointer-events-none absolute -inset-2 rounded-full bg-[#FF8A00]/10 blur-xl animate-pulse"
                            aria-hidden
                        />

                        {/* Badge core */}
                        <div
                            className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0C1922]/90 border border-[#FF8A00]/40 shadow-[0_0_20px_rgba(255,138,0,0.15),inset_0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur"
                        >
                            <HiSparkles className="text-[#FF8A00] drop-shadow-[0_0_6px_rgba(255,138,0,0.7)]" />
                            <span className="text-[11px] font-bold tracking-wide text-amber-100">
                                ×{count}
                            </span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Footer info */}
            <div className="absolute left-0 right-0 bottom-0 p-2 sm:p-3">
                <div className="rounded-lg border border-[#1D374A] bg-[#0C1922]/90 p-2">
                    <div className="font-semibold text-xs sm:text-sm truncate">{ach.name}</div>
                    <div className="text-[10px] sm:text-xs text-slate-300/80 line-clamp-2 mt-0.5">
                        {ach.desc}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
