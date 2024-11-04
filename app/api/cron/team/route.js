import { team, Match, Team } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import https from "https";
import axios from "axios";

export const dynamic = 'force-dynamic'

export async function GET(req) {
    try {
        const seasonID = process.env.NEXT_PUBLIC_SEASON_ID
        const api_url = "https://api.sportmonks.com/v3/football/teams/seasons/"
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });
        axios.defaults.httpsAgent = agent
        let full_URL = api_url + seasonID + "?include=players;"

        let team_data = [];
        let response = await axios.get(full_URL, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": process.env.NEXT_PUBLIC_SPORTMONKS_TOKEN
            },
            agent: agent
        })
        if (response.status === 200) {
            team_data = response.data.data;
        } else {
            console.log("Failed to fetch data from API");
        }

        for (const team of team_data) {
            // Consolidating data into QUERY Object
            const query = {
                id: team.id,
                seasonID: Number(seasonID),
                name: team.name,
                short_code: team.short_code,
                image_path: team.image_path,
                players: team.players.map((player) => { return player.player_id })
            };
            console.log(query)
            await connectToDb();
            const res = await Team.updateOne({ id: team.id }, { $set: query }, { upsert: true });
            // console.log(res);
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
