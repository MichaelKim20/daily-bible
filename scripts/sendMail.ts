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

async function buildContents() {
    const today = moment();
    const to2 = today.tz("Asia/Seoul");
    const url = `https://qt.swim.org/user_utf/dailybible/user_print_web.php?edit_all=${to2
        .tz("Asia/Seoul")
        .format("YYYY-MM-DD")}`;
    const summary = await getSummary(url);
    const subject = `${to2.tz("Asia/Seoul").format("M")}월 ${to2.tz("Asia/Seoul").format("D")}일 매일성경 큐티`;
    let text = "";
    let html = "";
    const textLink = `https://qt.swim.org/user_utf/dailybible/user_print_web.php?edit_all=${to2
        .tz("Asia/Seoul")
        .format("YYYY-MM-DD")}`;
    const audioLink = `https://meditation.su.or.kr/meditation_mp3/${to2.tz("Asia/Seoul").format("YYYY")}/${to2
        .tz("Asia/Seoul")
        .format("YYYYMMDD")}.mp3`;
    if (summary !== "") {
        text =
            `${to2.tz("Asia/Seoul").format("M")}월 ${to2.tz("Asia/Seoul").format("D")}일 매일성경 큐티\n\n` +
            `[본문의 중심내용]\n` +
            summary +
            `\n\n` +
            `[텍스트]\n` +
            `${textLink}\n` +
            `\n` +
            `[오디오]\n` +
            `${audioLink}\n`;
        html =
            `<h3>${to2.tz("Asia/Seoul").format("M")}월 ${to2.tz("Asia/Seoul").format("D")}일 매일성경 큐티</h3>` +
            `<b>[본문의 중심내용]</b><br>` +
            `${summary}<br>` +
            "<br>" +
            `<b>[텍스트]</b><br>` +
            `<a href="${textLink}">${textLink}</a><br>` +
            "<br>" +
            `<b>[오디오]</b><br>` +
            `<a href="${audioLink}">${audioLink}</a><br>`;
    } else {
        text =
            `${to2.tz("Asia/Seoul").format("M")}월 ${to2.tz("Asia/Seoul").format("D")}일 매일성경 큐티\n\n` +
            `\n` +
            `[텍스트]\n` +
            `${textLink}\n` +
            `\n` +
            `[오디오]\n` +
            `${audioLink}\n`;
        html =
            `<h3>${to2.tz("Asia/Seoul").format("M")}월 ${to2.tz("Asia/Seoul").format("D")}일 매일성경 큐티</h3>` +
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
