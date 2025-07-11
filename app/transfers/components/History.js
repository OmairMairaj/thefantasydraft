'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAlert } from "@/components/AlertContext/AlertContext";

const History = () => {
    const { addAlert } = useAlert();
    const [leagueId, setLeagueId] = useState(sessionStorage.getItem("selectedLeagueID"));
    const [history, setHistory] = useState(null)
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    useEffect(() => {
        if (leagueId) {
            try {
                let URL = process.env.NEXT_PUBLIC_BACKEND_URL + `/transfer?leagueId=${leagueId}`
                axios.get(URL)
                    .then((response) => {
                        console.log("response")
                        console.log(response)
                        if (!response.data.error) setHistory(response.data.data);
                        else addAlert("An unexpected error occurred trying to retrieve history. Please try again.", "error");
                    });
            } catch (error) {
                console.log("error")
                console.log(error)
                addAlert("An unexpected error occurred trying to retrieve history. Please try again.", "error");
            }
        }
    }, [leagueId])

    return <>
        {history ?
            <div>
                {history.length > 0 ?
                    <div>
                        {history.map((item) => {
                            return <>
                                <div style={{border:"1px solid",padding:"10px 20px", borderRadius:"10px", marginBottom:"20px"}}>
                                <p>Player In : {item.playerInID.common_name}</p>
                                <p>Player Out : {item.playerOutID.common_name}</p>
                                <p>Offer : {item.is_offer+""}</p>
                                <p>Amount Offered : {item.amount}</p>
                                <p>STATUS : {item.status}</p>
                                <p>Team In : {item.teamInID?.team_name}</p>
                                <p>Team Out : {item.teamOutID?.team_name}</p>
                                <p>Time of transfer : {new Date(item.createdAt).toLocaleString('en-US', options)}</p>
                                <p>Time last updated : {new Date(item.updatedAt).toLocaleString('en-US', options)}</p>
                                </div>
                            </>
                        })}
                    </div>
                    :
                    <div>No transfers</div>
                }
            </div>
            :
            <div>Loading...</div>}
    </>
}

export default History