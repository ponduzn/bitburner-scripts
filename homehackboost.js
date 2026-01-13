/** @param {NS} ns */
export async function main(ns) {

    const target = "n00dles";

    const moneyThresh = ns.getServerMaxMoney(target);

    const securityThresh = ns.getServerMinSecurityLevel(target);

    if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(target);
    }

    ns.nuke(target);

    const maxRam = ns.getServerMaxRam("home");
    const usedRam = ns.getServerUsedRam("home");
    const scriptRam = ns.getScriptRam("factionmemshare.js");

    const freeRam = maxRam - usedRam;
    const threads = Math.floor(freeRam / scriptRam / 1.2);

    if (threads > 0) {
        ns.exec("factionmemshare.js", "home", threads, "Faction");
    }

    // Infinite loop that continously hacks/grows/weakens the target server
    while (true) {
        if (ns.getServerSecurityLevel(target) > securityThresh + 5) {
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh * 0.75) {
            await ns.grow(target);
        } else {
            await ns.hack(target);
        }
    }
}
