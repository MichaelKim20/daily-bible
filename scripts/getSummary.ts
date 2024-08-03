import moment from "moment-timezone";
import { HTTPClient } from "../src/utils/HTTPClient";

import * as dotenv from "dotenv";
dotenv.config({ path: "env/.env" });

async function getSummary(url: string) {
    const client = new HTTPClient();
    const res = await client.get(url);
    if (res.status === 200) {
        try {
            const text: string = res.data;
            let p1: number;
            let p2: number;
            let s1: string;
            let s2: string;

            p1 = text.indexOf("본문의 중심내용");
            if (p1 >= 0) {
                s1 = text.substring(p1 + 8);
                p2 = s1.indexOf("</p><br />");
                if (p2 >= 0) {
                    s2 = s1.substring(0, p2);

                    s2 = s2.replace(/<\/span>/g, "");
                    s2 = s2.replace(/<br \/>/g, "");
                    s2 = s2.trim();
                    return s2;
                } else {
                    return "";
                }
            } else {
                return "";
            }
        } catch (error) {
            //
        }
        return "";
    } else {
        return "";
    }
}

async function main() {
    const today = moment();
    const to2 = today.tz("Asia/Seoul");
    const url = `https://qt.swim.org/user_utf/dailybible/user_print_web.php?edit_all=${to2
        .tz("Asia/Seoul")
        .format("YYYY-MM-DD")}`;
    const message = await getSummary(url);
    console.log(message);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
