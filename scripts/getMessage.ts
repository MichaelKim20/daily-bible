import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { parseFromString } from "dom-parser";
import { HTTPClient } from "../src/utils/HTTPClient";

async function main() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const url = "https://qt.swim.org/user_utf/dailybible/user_print_web.php?edit_all=2024-08-03";
    const client = new HTTPClient();
    const res = await client.get(url);
    const rates = [];
    if (res.status === 200) {
        try {
            const text: string = res.data;
            console.log(text);
        } catch (error) {
            //
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
