/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0];

    const maxMoney = ns.getServerMaxMoney(target);
    const minSec = ns.getServerMinSecurityLevel(target);

    const MONEY_LOW = 0.9;      // keep closer to max
    const SEC_BUFFER = 2;       // tighter security control

    while (true) {
        const sec = ns.getServerSecurityLevel(target);
        const money = ns.getServerMoneyAvailable(target);

        if (sec > minSec + SEC_BUFFER) {
            await ns.weaken(target);
            continue;
        }

        if (money < maxMoney * MONEY_LOW) {
            await ns.grow(target);
            continue;
        }

        // Prefer hacking as often as possible
        await ns.hack(target);
    }
}
