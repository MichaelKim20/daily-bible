import moment from "moment-timezone";

async function main() {
    const today = moment();
    const todaySeoul = today.tz("Asia/Seoul");
    console.log(todaySeoul.month());
    console.log(todaySeoul.date());
    console.log(todaySeoul.hour());
    console.log(todaySeoul.minute());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
