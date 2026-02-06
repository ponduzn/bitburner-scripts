/** @param {NS} ns */
export async function main(ns) {
    let lastRedeploy = 0;
    const REDEPLOY_INTERVAL = 15 * 60 * 1000; // 10 minutes
    const worker = "workerV2.js";

    function getAllServers() {
        const discovered = ["home"];
        for (let i = 0; i < discovered.length; i++) {
            for (const n of ns.scan(discovered[i])) {
                if (!discovered.includes(n)) discovered.push(n);
            }
        }
        for (const p of ns.getPurchasedServers()) {
            if (!discovered.includes(p)) discovered.push(p);
        }
        return discovered;
    }

    function chooseBestTarget(servers) {
        const myLevel = ns.getHackingLevel();
        let best = "n00dles";
        let bestScore = 0;

        for (const s of servers) {
          if (s === "home") continue;
          if (!ns.hasRootAccess(s)) continue;
          if (ns.getServerMaxMoney(s) === 0) continue;
          if (ns.getServerRequiredHackingLevel(s) > myLevel * 0.8) continue;

          const score =
              ns.getServerMaxMoney(s) *
              ns.getServerGrowth(s) /
              ns.getServerMinSecurityLevel(s);

          if (score > bestScore) {
              bestScore = score;
              best = s;
          }
        }
        return best;
    }

    while (true) {
        let openPorts = 0;
        if (ns.fileExists("BruteSSH.exe")) openPorts++;
        if (ns.fileExists("FTPCrack.exe")) openPorts++;
        if (ns.fileExists("relaySMTP.exe")) openPorts++;
        if (ns.fileExists("HTTPWorm.exe")) openPorts++;
        if (ns.fileExists("SQLInject.exe")) openPorts++;

        const servers = getAllServers();
        const myLevel = ns.getHackingLevel();
        const target = chooseBestTarget(servers);

        const now = Date.now();
        const doRedeploy = now - lastRedeploy > REDEPLOY_INTERVAL;
        if (doRedeploy) lastRedeploy = now;

        for (const serv of servers) {
            if (serv === "home") continue;
            if (serv.startsWith("hacknet-server-")) continue;

            

            const isPserv = ns.getPurchasedServers().includes(serv);
            if (!isPserv) {
                if (ns.getServerRequiredHackingLevel(serv) > myLevel) continue;
                if (ns.getServerNumPortsRequired(serv) > openPorts) continue;
            }
            
            if (!ns.hasRootAccess(serv)) {
                if (ns.fileExists("BruteSSH.exe")) ns.brutessh(serv);
                if (ns.fileExists("FTPCrack.exe")) ns.ftpcrack(serv);
                if (ns.fileExists("relaySMTP.exe")) ns.relaysmtp(serv);
                if (ns.fileExists("HTTPWorm.exe")) ns.httpworm(serv);
                if (ns.fileExists("SQLInject.exe")) ns.sqlinject(serv);
                ns.nuke(serv);
            }

            const maxRam = ns.getServerMaxRam(serv);
            if (maxRam === 0) continue;

            const processes = ns.ps(serv);
            const running = processes.find(p => p.filename === worker);
            let runningTarget = null;
            if (running && running.args && running.args.length > 0) {
                runningTarget = running.args[0];
            }

            const needsDeploy = !running || doRedeploy || runningTarget !== target;

            if (!needsDeploy) continue;

            ns.killall(serv, true);
            ns.scp(worker, serv);

            const scriptRam = ns.getScriptRam(worker);
            const threads = Math.floor(maxRam / scriptRam);
            if (threads <= 0) continue;

            ns.exec(worker, serv, threads, target);
            ns.tprint(`Deploying to ${serv} → ${target} (${threads} threads)`);
        }

        await ns.sleep(10_000);
    }
}
