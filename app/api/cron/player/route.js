import { GameWeek, Match, Player, Team } from "@/lib/models";
import { connectToDb } from "@/lib/utils";
import { NextResponse } from "next/server";
import https from "https";
import axios from "axios";

export const dynamic = 'force-dynamic'

export async function GET(req) {
    try {
        const seasonID = process.env.NEXT_PUBLIC_SEASON_ID
        const api_url = "https://api.sportmonks.com/v3/football/players/"
        const url_options = "?include=nationality;position;detailedPosition;teams;statistics.details;"
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });
        axios.defaults.httpsAgent = agent
        let data_to_insert = [];
        await connectToDb();
        const teams = await Team.find({})
        // console.log(teams)
        const playerIDs = []
        teams.map((team) => {
            team.players.map((player) => {
                playerIDs.push({
                    playerID: player,
                    teamID: team.id,
                    team_name: team.name,
                    team_image_path: team.image_path
                })
            })
        })
        // console.log(playerIDs)
        // playerIDs.map((playerID) => {
        for (const player of playerIDs) {
            let full_URL = api_url + player.playerID + url_options
            let response = await axios.get(full_URL, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": process.env.NEXT_PUBLIC_SPORTMONKS_TOKEN
                },
                agent: agent
            })
            if (response.status !== 200) {
                console.log("Failed to fetch data from API");
                return NextResponse.json({
                    error: true,
                    message: "An unexpected error occurred. Please try again later.",
                });
            }
            let player_data = response.data.data;
            // let rating = 
            // let rating_sum = 0;
            // let rating_count = 0;
            // console.log("player_data.statistics")
            // console.log(player_data.statistics)
            // console.log("player_data.statistics.filter(i => i.type_id === 118)")
            // console.log(player_data.statistics.filter(i => i.type_id === 118))
            // if (rating_count !== 0) rating = rating_sum / rating_count;
            // console.log("player_data")
            // console.log(player_data)
            const query = {
                "id": player_data?.id,
                "name": player_data?.name,
                "common_name": player_data?.common_name,
                "image_path": player_data?.image_path,
                "nationality": player_data?.nationality?.name,
                "nationality_image_path": player_data?.nationality?.image_path,
                "positionID": player_data?.position?.id,
                "position_name": player_data?.position?.name,
                "detailed_position": player_data?.detailedposition?.name,
                "teamID": player?.teamID,
                "team_name": player?.team_name,
                "team_image_path": player?.team_image_path,
                "rating": player_data?.statistics?.filter(i => i.season_id === seasonID)[0]?.details?.filter(i => i.type_id === 118)[0]?.value?.average || 0,
                "fpl": null,
                "points": null,
            };
            data_to_insert.push(query);
            console.log(query.name);
            console.log(query.rating);
        }
        console.log(data_to_insert.length);
        await connectToDb();
        const res = await Player.insertMany(data_to_insert, { ordered: false });
        return NextResponse.json({
            res: res,
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
