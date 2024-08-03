import bodyParser from "body-parser";
import cors from "cors";
import { Config } from "./common/Config";
import { DefaultRouter } from "./routers/DefaultRouter";
import { Scheduler } from "./scheduler/Scheduler";
import { WebService } from "./service/WebService";

export class DefaultServer extends WebService {
    /**
     * The configuration of the database
     * @private
     */
    private readonly config: Config;
    protected schedules: Scheduler[] = [];

    public readonly defaultRouter: DefaultRouter;

    /**
     * Constructor
     * @param config Configuration
     * @param storage
     * @param schedules
     */
    constructor(config: Config, schedules?: Scheduler[]) {
        super(config.server.port, config.server.address);

        this.config = config;
        this.defaultRouter = new DefaultRouter(this);

        if (!schedules) schedules = [];
        schedules.forEach((m) => this.schedules.push(m));
        this.schedules.forEach((m) =>
            m.setOption({
                config: this.config,
            })
        );
    }

    /**
     * Setup and start the server
     */
    public async start(): Promise<void> {
        // parse application/x-www-form-urlencoded
        this.app.use(bodyParser.urlencoded({ extended: false, limit: "1mb" }));
        // parse application/json
        this.app.use(bodyParser.json({ limit: "1mb" }));
        this.app.use(
            cors({
                allowedHeaders: "*",
                credentials: true,
                methods: "GET, POST",
                origin: "*",
                preflightContinue: false,
            })
        );

        this.defaultRouter.registerRoutes();

        for (const m of this.schedules) await m.start();

        return super.start();
    }

    public stop(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            for (const m of this.schedules) await m.stop();
            for (const m of this.schedules) await m.waitForStop();
            if (this.server != null) {
                this.server.close((err?) => {
                    if (err) reject(err);
                    else resolve();
                });
            } else resolve();
        });
    }
}
