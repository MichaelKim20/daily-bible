import { Config } from "./common/Config";
import { DefaultServer } from "./DefaultServer";
import { BibleScheduler } from "./scheduler/BibleScheduler";
import { Scheduler } from "./scheduler/Scheduler";

import * as dotenv from "dotenv";
dotenv.config({ path: "env/.env" });

let server: DefaultServer;

async function main() {
    // Create with the arguments and read from file
    const config = Config.createWithArgument();

    console.info(`address: ${config.server.address}`);
    console.info(`port: ${config.server.port}`);

    const schedulers: Scheduler[] = [];
    if (config.scheduler.enable) {
        const scheduler = config.scheduler.getScheduler("bible");
        if (scheduler && scheduler.enable) {
            schedulers.push(new BibleScheduler(scheduler.expression));
        }
    }

    server = new DefaultServer(config, schedulers);
    return server.start().catch((error: any) => {
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case "EACCES":
                console.error(`${config.server.port} requires elevated privileges`);
                break;
            case "EADDRINUSE":
                console.error(`Port ${config.server.port} is already in use`);
                break;
            default:
                console.error(`An error occurred while starting the server: ${error.stack}`);
        }
        process.exit(1);
    });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

process.on("SIGINT", () => {
    server.stop().then(() => {
        process.exit(0);
    });
});
