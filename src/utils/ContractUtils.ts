export class ContractUtils {
    public static StringToBuffer(hex: string): Buffer {
        const start = hex.substring(0, 2) === "0x" ? 2 : 0;
        return Buffer.from(hex.substring(start), "hex");
    }

    public static BufferToString(data: Buffer): string {
        return "0x" + data.toString("hex");
    }

    public static getTimeStamp(): number {
        return Math.floor(new Date().getTime() / 1000);
    }

    public static getTimeStampBigInt(): bigint {
        return BigInt(new Date().getTime()) / BigInt(1000);
    }

    public static getTimeStamp10(): number {
        return Math.floor(new Date().getTime() / 10000) * 10;
    }

    public static delay(interval: number): Promise<void> {
        return new Promise<void>((resolve, _) => {
            setTimeout(resolve, interval);
        });
    }
}
