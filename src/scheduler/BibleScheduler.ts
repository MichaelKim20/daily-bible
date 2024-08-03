import { Config } from "../common/Config";
import { logger } from "../common/Logger";
import { ContractUtils } from "../utils/ContractUtils";
import { Scheduler } from "./Scheduler";

// @ts-ignore

export class BibleScheduler extends Scheduler {
    private _config: Config | undefined;

    private old_time_stamp: number;
    private new_time_stamp: number;

    constructor(expression: string) {
        super(expression);
        this.old_time_stamp = ContractUtils.getTimeStamp() - 120;
        this.new_time_stamp = ContractUtils.getTimeStamp();
    }

    private get config(): Config {
        if (this._config !== undefined) return this._config;
        else {
            logger.error("Config is not ready yet.");
            process.exit(1);
        }
    }

    public setOption(options: any) {
        if (options) {
            if (options.config && options.config instanceof Config) this._config = options.config;
        }
    }

    public async onStart() {}

    protected async work() {
        try {
            this.new_time_stamp = ContractUtils.getTimeStamp();
            const old_source_period = Math.floor(this.old_time_stamp / 60);
            const new_source_period = Math.floor(this.new_time_stamp / 60);
            if (old_source_period !== new_source_period) {
                this.old_time_stamp = this.new_time_stamp;
            }
        } catch (error) {
            console.log(error);
        }
    }
}
