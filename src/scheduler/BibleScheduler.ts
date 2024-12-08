import { Config } from "../common/Config";
import { HTTPClient } from "../utils/HTTPClient";
import { Scheduler } from "./Scheduler";

import moment from "moment-timezone";
import * as nodemailer from "nodemailer";

// @ts-ignore

export class BibleScheduler extends Scheduler {
    private _config: Config | undefined;

    private old_date: number;
    private old_hour: number;
    private new_date: number;
    private new_hour: number;
    private sent: boolean;

    constructor(expression: string) {
        super(expression);
        this.sent = false;
        this.old_date = 0;
        this.old_hour = 0;
        this.new_date = 0;
        this.new_hour = 0;
    }

    private get config(): Config {
        if (this._config !== undefined) return this._config;
        else {
            console.error("Config is not ready yet.");
            process.exit(1);
        }
    }

    public setOption(options: any) {
        if (options) {
            if (options.config && options.config instanceof Config) this._config = options.config;
        }
    }

    protected async getSummary(url: string) {
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

    protected async buildContents() {
        const today = moment().add(24, "hour").tz("Asia/Seoul");
        const url = `https://qt.swim.org/user_utf/dailybible/user_print_web.php?edit_all=${today
            .tz("Asia/Seoul")
            .format("YYYY-MM-DD")}`;
        const header = await this.getSummary(url);
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
                `<h3>${today.tz("Asia/Seoul").format("M")}월 ${today
                    .tz("Asia/Seoul")
                    .format("D")}일 매일성경 큐티</h3>` +
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
                `<h3>${today.tz("Asia/Seoul").format("M")}월 ${today
                    .tz("Asia/Seoul")
                    .format("D")}일 매일성경 큐티</h3>` +
                `<b>[텍스트]</b><br>` +
                `<a href="${textLink}">${textLink}</a><br>` +
                "<br>" +
                `<b>[오디오]</b><br>` +
                `<a href="${audioLink}">${audioLink}</a><br>`;
        }
        return { subject, text, html };
    }

    protected async sendMail(address: string, subject: string, text: string, html: string) {
        return new Promise<void>((resolve, reject) => {
            const transporter = nodemailer.createTransport({
                service: "gmail", // 이메일
                auth: {
                    user: this.config.bible.auth_user, // 발송자 이메일
                    pass: this.config.bible.auth_pass, // 발송자 비밀번호
                },
            });
            const mailOptions = {
                from: "qksystemmonitor@gmail.com",
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

    protected async work() {
        try {
            const today = moment().tz("Asia/Seoul");
            today.day();

            this.new_date = today.date();
            this.new_hour = today.hour();

            if (this.old_date === 0) {
                this.old_date = this.new_date;
                this.old_hour = this.new_hour;
                return;
            }
            console.log(`${this.new_date} ${this.new_hour}:${today.minute()}`);

            if (this.old_date !== this.new_date) {
                console.log("Reset");
                this.sent = false;
            }

            if (!this.sent && this.old_hour !== 20 && this.new_hour === 20) {
                // if (!this.sent && this.new_hour >= 7) {
                const contents = await this.buildContents();
                for (const receiver of this.config.bible.receivers) {
                    await this.sendMail(receiver, contents.subject, contents.text, contents.html);
                }
                this.sent = true;
            }

            this.old_date = this.new_date;
            this.old_hour = this.new_hour;
            return;
        } catch (error) {
            console.log(error);
        }
    }
}
