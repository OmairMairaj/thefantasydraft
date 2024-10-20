import { NextResponse } from "next/server";
import cron from 'node-cron';
import { exec } from 'child_process';

export default function fun(req, res){
    try {
        // Schedule the cron job to run every 10 minutes
        // cron.schedule('*/60 * * * *', () => {
            // console.log('Running the Python script every 60 minutes');

            // Execute the Python script
            exec("python ../../../python/match.py", (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing script: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`Script stderr: ${stderr}`);
                }
                console.log(`Script output: ${stdout}`);
            });
        // });
        return NextResponse.json({ error: false, data: teams });
    }
    catch (err) {
        return NextResponse.json({
            error: true,
            err: err,
            message: "An unexpected error occurred please try again later"
        });
    }
};