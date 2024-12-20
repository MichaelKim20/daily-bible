import { WebService } from "../service/WebService";

import express from "express";

export class DefaultRouter {
    private _web_service: WebService;

    constructor(service: WebService) {
        this._web_service = service;
    }

    private get app(): express.Application {
        return this._web_service.app;
    }

    public registerRoutes() {
        // Get Health Status
        this.app.get("/", [], this.getHealthStatus.bind(this));
    }

    private async getHealthStatus(req: express.Request, res: express.Response) {
        return res.status(200).json("OK");
    }

    private makeResponseData(code: number, data: any, error?: any): any {
        return {
            code,
            data,
            error,
        };
    }
}
