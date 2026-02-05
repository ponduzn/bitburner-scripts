import {
    TextTransforms
} from "./text-transform.js";

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();

    const SLEEP_MS = 200;
    const MAX_NODES = 300;
    

    let best = null;
    let status = "";
    let hashStatus = "";

    while (true) {
        const money = ns.getServerMoneyAvailable("home");
        const currentHashes = ns.hacknet.numHashes(); 
        let currentNodes = ns.hacknet.numNodes();
        let hashIncomeSec = 0;
        let hashTarget = 150;
        let hashSellAmount = 1;
        best = null;
        status = "";

        //Calculate hash income from all hacknet servers.
        for (let i = 0; i < currentNodes; i++) {
          hashIncomeSec += ns.hacknet.getNodeStats(i).production;
        }

        //Adjust buffer threshold of hashes based on hashes /s.
        if (hashIncomeSec > 1024) {
          hashTarget = 120000;
          hashSellAmount = 1024;
        } else if (hashIncomeSec > 512) {
          hashTarget = 60000;
          hashSellAmount = 512;
        } else if (hashIncomeSec > 256) {
          hashTarget = 30000;
          hashSellAmount = 256;
        } else if (hashIncomeSec > 128) {
          hashTarget = 15000;
          hashSellAmount = 128;
        } else if (hashIncomeSec > 64) {
          hashTarget = 8400;
          hashSellAmount = 64;
        } else if (hashIncomeSec > 32) {
          hashTarget = 4200;
          hashSellAmount = 32;
        } else if (hashIncomeSec > 16) {
          hashTarget = 2100;
          hashSellAmount = 16;
        } else if (hashIncomeSec > 8) {
          hashTarget = 3000;
          hashSellAmount = 8;
        } else if (hashIncomeSec > 4) {
          hashTarget = 1000;
          hashSellAmount = 4;
        } else if (hashIncomeSec > 2) {
          hashTarget = 300;
          hashSellAmount = 1;
        } else {
          hashTarget = 150;
        }

        //New node
        if (currentNodes < MAX_NODES) {
          consider("new node", -1, ns.hacknet.getPurchaseNodeCost(), estimateGain(ns, -1, "new node", currentHashes, hashTarget));
        }

        //Existing nodes
        for (let i = 0; i < currentNodes; i++) {
            consider("level", i, ns.hacknet.getLevelUpgradeCost(i, 1), estimateGain(ns, i, "level", currentHashes, hashTarget));
            consider("ram",   i, ns.hacknet.getRamUpgradeCost(i, 1), estimateGain(ns, i, "ram", currentHashes, hashTarget));
            consider("core",  i, ns.hacknet.getCoreUpgradeCost(i, 1), estimateGain(ns, i, "core", currentHashes, hashTarget));
            consider("cache", i, ns.hacknet.getCacheUpgradeCost(i, 1), estimateGain(ns, i, "cache", currentHashes, hashTarget));
        }
        
        //Sell hashes for income.
        if (currentHashes > hashTarget + 5) {
          ns.hacknet.spendHashes("Sell for Money", undefined, hashSellAmount);
        } 
        if (currentHashes > hashTarget) {
          hashStatus = "Selling";
        } else {
          hashStatus = "Buffering";
        }

        //Determine status and execute
        if (best) {
            const actionDesc = best.type + (best.i >= 0 ? ` on Node ${best.i}` : "");
            if (best.cost <= (money / 2)) {
                status = actionDesc;
                if (best.type === "new node") ns.hacknet.purchaseNode();
                else if (best.type === "level") ns.hacknet.upgradeLevel(best.i, 1);
                else if (best.type === "ram") ns.hacknet.upgradeRam(best.i, 1);
                else if (best.type === "core") ns.hacknet.upgradeCore(best.i, 1);
                else if (best.type === "cache") ns.hacknet.upgradeCache(best.i, 1);
            } else {
                status = `Waiting for money`;
            }
        } else {
            status = "No viable upgrades";
        }

        const BOX_WIDTH       = 20;
        const INIT_PAD        = 29;
        const leftBorder      = TextTransforms.apply("│", [TextTransforms.Color.Black]);
        const rightBorder     = TextTransforms.apply("│", [TextTransforms.Color.Black]);
        var divLineLongTop    = TextTransforms.apply("┌─────────HackNet Manager─────────┐", [TextTransforms.Color.Black]);
        var divLineLongMiddle = TextTransforms.apply("├─────────────────────────────────┤", [TextTransforms.Color.Black]);
        var divLineLongBottom = TextTransforms.apply("└─────────────────────────────────┘", [TextTransforms.Color.Black]);
        var moneyss           = TextTransforms.apply("Avail. $: ", [TextTransforms.Color.LWhite]);
        var nodesss           = TextTransforms.apply("Nodes: ", [TextTransforms.Color.LWhite]);
        var bestsss           = TextTransforms.apply("Best: ", [TextTransforms.Color.LWhite]);
        var costsss           = TextTransforms.apply("Cost: ", [TextTransforms.Color.LWhite]);
        var statuss           = TextTransforms.apply("Status: ", [TextTransforms.Color.LWhite]);
        var hashess           = TextTransforms.apply("Hashes: ", [TextTransforms.Color.LWhite]);
        var hashstatusss      = TextTransforms.apply("Hash Status: ", [TextTransforms.Color.LWhite]);
        var hashIncomeStatus  = TextTransforms.apply("Hash Rate: ", [TextTransforms.Color.LWhite]);
        var nodestatusss      = ns.formatNumber(currentNodes, 0);
        var moneysscalc       = "$" + ns.formatNumber(money / 2);
        var hashIncomeSeclog  = hashIncomeSec.toPrecision(4) + "/s";
        var hashesCapacity    = ns.hacknet.hashCapacity();
        var currentHashesLog  = ns.formatNumber(currentHashes) + "/" + hashesCapacity;
        

        //Log
        ns.clearLog();
        ns.print(divLineLongTop.padEnd(BOX_WIDTH));
        ns.print(leftBorder + moneyss.padEnd(INIT_PAD) + TextTransforms.apply(moneysscalc.substring(0, BOX_WIDTH).padEnd(BOX_WIDTH), [TextTransforms.Color.Yellow]) + rightBorder);
        ns.print(leftBorder + nodesss.padEnd(INIT_PAD) + TextTransforms.apply(nodestatusss.padEnd(BOX_WIDTH), [TextTransforms.Color.ChartsBlue]) + rightBorder);
        if (best) {
          var bestsscalc = best.type + (best.i >= 0 ? " on " + best.i : "");
          var costssscalc = "$" + ns.formatNumber(best.cost, 2);
          ns.print(leftBorder + bestsss.padEnd(INIT_PAD) + TextTransforms.apply(bestsscalc.substring(0, BOX_WIDTH).padEnd(BOX_WIDTH), [TextTransforms.Color.ChartsGreen]) + rightBorder);
          ns.print(leftBorder + costsss.padEnd(INIT_PAD) + TextTransforms.apply(costssscalc.substring(0, BOX_WIDTH).padEnd(BOX_WIDTH), [TextTransforms.Color.Red]) + rightBorder);
        }
        ns.print(leftBorder + statuss.padEnd(INIT_PAD) + TextTransforms.apply(status.substring(0, BOX_WIDTH).padEnd(BOX_WIDTH), [TextTransforms.Color.LPurple]) + rightBorder);
        if (currentHashes > 0) {
          ns.print(divLineLongMiddle.padEnd(BOX_WIDTH));
          ns.print(leftBorder + hashIncomeStatus.padEnd(INIT_PAD) + TextTransforms.apply(hashIncomeSeclog.padEnd(BOX_WIDTH), [TextTransforms.Color.Orange]) + rightBorder);
          ns.print(leftBorder + hashess.padEnd(INIT_PAD) + TextTransforms.apply(currentHashesLog.padEnd(BOX_WIDTH), [TextTransforms.Color.Orange]) + rightBorder);
          ns.print(leftBorder + hashstatusss.padEnd(INIT_PAD) + TextTransforms.apply(hashStatus.padEnd(BOX_WIDTH), [TextTransforms.Color.Orange]) + rightBorder);
        }
        ns.print(divLineLongBottom.padEnd(BOX_WIDTH));
        

        await ns.sleep(SLEEP_MS);
    }

    //Helper
    function consider(type, i, cost, gain) {
        if (!isFinite(cost)) return;
        if (cost <= 0 || gain <= 0) return;

        const roi = cost / gain;
        if (!best || roi < best.roi) {
            best = { type, i, cost, roi };
        }
    }

    function estimateGain(ns, i, type, currentHashes, hashTarget) {
      const nodes = ns.hacknet.numNodes();
      const maxNodes = 300;

      switch (type) {
          case "new node": {
              const base = 0.0033 * ns.getHacknetMultipliers().production;

              // Horizontal pressure: more nodes → stronger bias
              const nodePressure = 1 + 2 * (nodes / maxNodes);

              // Vertical pain: upgrades getting stupid expensive
              let avgRamCost = 0;
              for (let j = 0; j < nodes; j++) {
                  avgRamCost += ns.hacknet.getRamUpgradeCost(j, 1);
              }
              avgRamCost /= Math.max(1, nodes);

              const upgradePain = Math.max(0.25, Math.min(2, Math.log10(avgRamCost) / 9));

              return base * nodePressure * upgradePain;
          }

          case "level": return ns.hacknet.getNodeStats(i).production * 0.05;
          case "ram":   return ns.hacknet.getNodeStats(i).production * 1.0;
          case "core":  return ns.hacknet.getNodeStats(i).production * 0.5;
          case "cache": {
              const base = ns.hacknet.getNodeStats(i).production;
              const hashBufferFactor = Math.min(0.75, currentHashes / hashTarget);
              return base * 0.02 * (1 + hashBufferFactor);
          }
      }
      return 0.0001;
    }
}
