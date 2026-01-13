
/** @param {NS} ns **/
export async function main(ns, faction) {
    while (true) {
        await ns.share(1, faction); // one thread per script instance
        await ns.sleep(10000);
    }
}
