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
            const p1 = text.indexOf("본문의 중심내용");
            if (p1 >= 0) {
                const s1 = text.substring(p1 + 8);
                const p2 = s1.indexOf("</p><br />");
                if (p2 >= 0) {
                    const summary = s1
                        .substring(0, p2)
                        .replace(/<\/span>/g, "")
                        .replace(/<br \/>/g, "")
                        .trim();

                    const s3 = s1.substring(p2 + 10);
                    const p3 = s3.indexOf("<br /><br />");
                    let bible: string;
                    if (p3 >= 0) {
                        bible = s3
                            .substring(0, p3)
                            .replace(/<strong>/g, "")
                            .replace(/<\/strong>/g, "")
                            .replace(/<br \/>/g, "")
                            .replace(/\[ /g, "[")
                            .replace(/ \]/g, "]")
                            .trim();
                    } else {
                        bible = "";
                    }
                    return { summary, bible };
                } else {
                    return { summary: "", bible: "" };
                }
            } else {
                return { summary: "", bible: "" };
            }
        } catch (error) {
            //
        }
        return { summary: "", bible: "" };
    } else {
        return { summary: "", bible: "" };
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
