import express from 'express';
import next from 'next';
import cron from 'node-cron';
import { exec } from 'child_process';
import path from 'path';

// Full path to the Python executable and your script
const scriptPath = path.join(process.cwd(), './python/match.py');
// const requirementsPath = path.join(process.cwd(), './python/requirements.txt');

const dev = process.env.NEXT_PUBLIC_NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    // Schedule the cron job to run every 10 minutes
    cron.schedule('*/5 * * * *', () => {
        console.log('Running the Python script every 5 minutes');

        // Install dependencies
        exec(`pip install requests pymongo -t /tmp/python_modules`, (installError) => {
            if (installError) {
                console.error(`Error installing dependencies: ${installError.message}`);
                return res.status(500).json({ error: installError.message });
            }

            // Execute the Python script
            exec(`python ./python/match.py`, { env: { PYTHONPATH: '/tmp/python_modules' } }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing script: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`Script stderr: ${stderr}`);
                }
                console.log(`Script output: ${stdout}`);
            });
        });
    });

    server.all('*', (req, res) => {
        return handle(req, res);
    });

    server.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
});
