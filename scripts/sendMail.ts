import moment from "moment-timezone";
import { HTTPClient } from "../src/utils/HTTPClient";

import * as nodemailer from "nodemailer";

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

async function buildContents() {
    const today = moment().tz("Asia/Seoul");
    const url = `https://qt.swim.org/user_utf/dailybible/user_print_web.php?edit_all=${today
        .tz("Asia/Seoul")
        .format("YYYY-MM-DD")}`;
    const header = await getSummary(url);
    const subject = `${today.tz("Asia/Seoul").format("M")}월 ${today.tz("Asia/Seoul").format("D")}일 매일성경 큐티`;
    let text = "";
    let html = "";
    const textLink = `https://qt.swim.org/user_utf/dailybible/user_print_web.php?edit_all=${today
        .tz("Asia/Seoul")
        .format("YYYY-MM-DD")}`;
    const audioLink = `https://meditation.su.or.kr/meditation_mp3/${today.tz("Asia/Seoul").format("YYYY")}/${today
        .tz("Asia/Seoul")
        .format("YYYYMMDD")}.mp3`;
    if (header.summary !== "") {
        text =
            `${today.tz("Asia/Seoul").format("M")}월 ${today.tz("Asia/Seoul").format("D")}일 매일성경 큐티\n\n` +
            `${header.bible}\n` +
            `\n` +
            `[본문의 중심내용]\n` +
            header.summary +
            `\n\n` +
            `[텍스트]\n` +
            `${textLink}\n` +
            `\n` +
            `[오디오]\n` +
            `${audioLink}\n`;
        html =
            `<h3>${today.tz("Asia/Seoul").format("M")}월 ${today.tz("Asia/Seoul").format("D")}일 매일성경 큐티</h3>` +
            `<b>${header.bible}</b><br>` +
            "<br>" +
            `<b>[본문의 중심내용]</b><br>` +
            `${header.summary}<br>` +
            "<br>" +
            `<b>[텍스트]</b><br>` +
            `<a href="${textLink}">${textLink}</a><br>` +
            "<br>" +
            `<b>[오디오]</b><br>` +
            `<a href="${audioLink}">${audioLink}</a><br>`;
    } else {
        text =
            `${today.tz("Asia/Seoul").format("M")}월 ${today.tz("Asia/Seoul").format("D")}일 매일성경 큐티\n\n` +
            `\n` +
            `[텍스트]\n` +
            `${textLink}\n` +
            `\n` +
            `[오디오]\n` +
            `${audioLink}\n`;
        html =
            `<h3>${today.tz("Asia/Seoul").format("M")}월 ${today.tz("Asia/Seoul").format("D")}일 매일성경 큐티</h3>` +
            `<b>[텍스트]</b><br>` +
            `<a href="${textLink}">${textLink}</a><br>` +
            "<br>" +
            `<b>[오디오]</b><br>` +
            `<a href="${audioLink}">${audioLink}</a><br>`;
    }
    return { subject, text, html };
}

async function sendMail(address: string, subject: string, text: string, html: string) {
    return new Promise<void>((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            service: "gmail", // 이메일
            auth: {
                user: process.env.EMAIL_AUTH_USER, // 발송자 이메일
                pass: process.env.EMAIL_AUTH_PASS, // 발송자 비밀번호
            },
        });
        const mailOptions = {
            from: process.env.EMAIL_AUTH_USER,
            to: address,
            subject,
            text,
            html,
        };
        transporter.sendMail(mailOptions, (error, result) => {
            if (error) reject(error);
            resolve();
        });
    });
}

async function main() {
    const contents = await buildContents();
    await sendMail("worldia@naver.com", contents.subject, contents.text, contents.html);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
