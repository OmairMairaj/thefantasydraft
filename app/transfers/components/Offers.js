'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAlert } from "@/components/AlertContext/AlertContext";

const Offers = () => {
    const { addAlert } = useAlert();
    const [leagueId, setLeagueId] = useState(sessionStorage.getItem("selectedLeagueID"));
    const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("user")));
    const [userTeam, setUserTeam] = useState(null);
    const [history, setHistory] = useState(null)

    useEffect(() => {
        if (leagueId && user) {
            try {
                axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + `/fantasyleague?leagueId=${leagueId}`)
                    .then((response) => {
                        if (response.data && !response.data.error) {
                            const league = response.data.data;
                            if (league) {
                                // Step 2: Find the user's team in the league
                                console.log(user)
                                const userTeam = league.teams.find(team => team.user_email === user.user.email);
                                if (userTeam) {
                                    setUserTeam(userTeam.team);
                                } else {
                                    console.error("No team found for the user in this league.");
                                    addAlert("No team found for the selected league.", "error");
                                }
                            } else {
                                // no league found
                                console.error("No league found. Please reload and try again");
                                addAlert("No league found. Please reload and try again", "error");
                            }
                        }
                        else {
                            // error getting league
                            console.error("Error fetching league details. Please reload and try again");
                            addAlert("Error fetching league details. Please reload and try again", "error");
                        }
                    });
            } catch (error) {
                console.log("error")
                console.log(error)
                addAlert("An unexpected error occurred trying to retrieve history. Please try again.", "error");
            }
        }
    }, [leagueId])

    useEffect(() => {
        if (userTeam) {
            try {
                let URL = process.env.NEXT_PUBLIC_BACKEND_URL + `/transfer?teamId=${userTeam._id}`
                axios.get(URL)
                    .then((response) => {
                        console.log("response")
                        console.log(response)
                        if (!response.data.error) setHistory(response.data.data.filter(item => item.status === "Pending"));
                        else addAlert("An unexpected error occurred trying to retrieve history. Please try again.", "error");
                    });
            } catch (error) {
                console.log("error")
                console.log(error)
                addAlert("An unexpected error occurred trying to retrieve history. Please try again.", "error");
            }
        }
    }, [userTeam])

    function handleClick(operation, ID) {
        try {
            const URL = process.env.NEXT_PUBLIC_BACKEND_URL + "/transfer/" + operation;
            const body = {
                "transferID": ID
            }
            axios.post(URL, body).then((response) => {
                console.log("response");
                console.log(response);
                setLeagueId(sessionStorage.getItem("selectedLeagueID"));
                setUserTeam(JSON.parse(sessionStorage.getItem("user")));
                addAlert('Offer ' + operation + 'ed successfully', 'success');
            })
        } catch (err) {
            addAlert("An unexpected error occurred. Please try again", "error");
            console.log("error");
            console.log(err);
        }
    }

    return <>
        {history ?
            <div>
                {history.length > 0 ?
                    <div>
                        {history.map((item) => {
                            return <>
                                <div style={{ border: "1px solid", padding: "10px" }}>
                                    <p>Player Transferred In : {item.playerInID.common_name}</p>
                                    <p>Player Transferred Out : {item.playerOutID.common_name}</p>
                                    <p>Offer : {item.is_offer + ""}</p>
                                    <p>Amount Offered : {item.amount}</p>
                                    <p>STATUS : {item.status}</p>
                                    <p>Going In Team : {item.teamInID?.team_name}</p>
                                    <p>Going From Team : {item.teamOutID?.team_name}</p>
                                    <br/>
                                    <button className={"bg-[#FF8A00] px-8 py-1 rounded-lg"} onClick={()=>{handleClick("reject", item._id)}}>Reject</button>
                                    <button className={"bg-[#FF8A00] px-8 py-1 rounded-lg"} onClick={()=>{handleClick("accept", item._id)}}>Accept</button>
                                </div>
                            </>
                        })}
                    </div>
                    :
                    <div>No active offers pending</div>
                }
            </div>
            :
            <div>Loading...</div>}
    </>
}

export default Offers