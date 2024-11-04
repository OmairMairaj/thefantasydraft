import { GameWeek, Match } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import https from "https";
import axios from "axios";

export const dynamic = 'force-dynamic'

export async function GET(req) {
    try {
        const seasonID = process.env.NEXT_PUBLIC_SEASON_ID
        const api_url = "https://api.sportmonks.com/v3/football/players/537121?include=country;nationality;city;position;detailedPosition;teams;sport;"
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });
        axios.defaults.httpsAgent = agent
        let full_URL = api_url + seasonID



        let gameweek_data = [];
        let response = await axios.get(full_URL, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": process.env.NEXT_PUBLIC_SPORTMONKS_TOKEN
            },
            agent: agent
        })
        if (response.status === 200) {
            gameweek_data = response.data.data;
        } else {
            console.log("Failed to fetch data from API");
        }

        for (const gameweek of gameweek_data) {
            // Consolidating data into QUERY Object
            const query = {
                id: gameweek.id,
                seasonID: seasonID,
                name: gameweek.name,
                finished: gameweek.finished,
                is_current: gameweek.is_current,
                starting_at: gameweek.starting_at,
                ending_at: gameweek.ending_at,
                games_in_current_week: gameweek.games_in_current_week,
            };
            console.log(query)
            await connectToDb();
            const res = await GameWeek.updateOne({ id: gameweek.id }, { $set: query }, { upsert: true });
            console.log(res);
        }
        return NextResponse.json({
            error: false,
            message: "done",
        });
    } catch (err) {
        console.log(err);
        return NextResponse.json({
            error: true,
            message: "An unexpected error occurred. Please try again later.",
        });
    }
};
