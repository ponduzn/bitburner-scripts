import {
    TextTransforms
} from "./text-transform.js";

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();

    const SLEEP_MS = 200;
    let batchSize = Math.max(4, ns.hacknet.numNodes());
    const currentNodes = ns.hacknet.numNodes();

    let best = null;
    let status = "";
    let hashStatus = "";

    while (true) {
        const money = ns.getServerMoneyAvailable("home");
        const currentHashes = ns.hacknet.numHashes(); 
        const maxHashes = ns.hacknet.hashCapacity();
        const fillRatio = currentHashes / maxHashes;
        let hashIncomeSec = 0;
        let hashTarget = 150;
        let hashSellAmount = 1;
        best = null;
        status = "";

        //New node
        if (currentNodes < batchSize) {
            const newCost = ns.hacknet.getPurchaseNodeCost();
            if (newCost < Infinity) {
                consider("new node", -1, newCost, 1); // small estimated gain for new node
            }
        }

        //Existing nodes
        for (let i = 0; i < currentNodes; i++) {
            consider("level", i, ns.hacknet.getLevelUpgradeCost(i, 1), estimateGain(i, "level", currentHashes, hashTarget));
            consider("ram",   i, ns.hacknet.getRamUpgradeCost(i, 1), estimateGain(i, "ram", currentHashes, hashTarget));
            consider("core",  i, ns.hacknet.getCoreUpgradeCost(i, 1), estimateGain(i, "core", currentHashes, hashTarget));
            consider("cache", i, ns.hacknet.getCacheUpgradeCost(i, 1), estimateGain(i, "cache", currentHashes, hashTarget));
        }

        //Calculate hash income from all hacknet servers.
        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
          hashIncomeSec += ns.hacknet.getNodeStats(i).production;
        }

        //Adjust buffer threshold of hashes based on hashes /s.
        if (hashIncomeSec > 12) {
          hashTarget = 1650;
          hashSellAmount = 6;
        } else if (hashIncomeSec > 11) {
          hashTarget = 1500;
          hashSellAmount = 5;
        } else if (hashIncomeSec > 10) {
          hashTarget = 1350;
          hashSellAmount = 5;
        } else if (hashIncomeSec > 9) {
          hashTarget = 1200;
          hashSellAmount = 4;
        } else if (hashIncomeSec > 8) {
          hashTarget = 1050;
          hashSellAmount = 4;
        } else if (hashIncomeSec > 6) {
          hashTarget = 900;
          hashSellAmount = 3;
        } else if (hashIncomeSec > 5) {
          hashTarget = 750;
          hashSellAmount = 3;
        } else if (hashIncomeSec > 4) {
          hashTarget = 600;
          hashSellAmount = 2;
        } else if (hashIncomeSec > 3) {
          hashTarget = 450;
          hashSellAmount = 2;
        } else if (hashIncomeSec > 2) {
          hashTarget = 300;
          hashSellAmount = 1;
        } else {
          hashTarget = 150;
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
        var nodestatusss      = currentNodes + "/" + batchSize;
        var bestsscalc        = best.type + (best.i >= 0 ? " on Node " + best.i : "");
        var costssscalc       = "$" + ns.formatNumber(best.cost);
        var moneysscalc       = "$" + ns.formatNumber(money / 2);
        var hashIncomeSeclog  = hashIncomeSec.toPrecision(4) + "/s";
        var hashesCapacity    = ns.hacknet.hashCapacity();
        var currentHashesLog  = currentHashes.toPrecision(3) + "/" + hashesCapacity;
        

        //Log
        ns.clearLog();
        ns.print(divLineLongTop.padEnd(BOX_WIDTH));
        ns.print(leftBorder + moneyss.padEnd(INIT_PAD) + TextTransforms.apply(moneysscalc.substring(0, BOX_WIDTH).padEnd(BOX_WIDTH), [TextTransforms.Color.Yellow]) + rightBorder);
        ns.print(leftBorder + nodesss.padEnd(INIT_PAD) + TextTransforms.apply(nodestatusss.substring(0, BOX_WIDTH).padEnd(BOX_WIDTH), [TextTransforms.Color.ChartsBlue]) + rightBorder);
        if (best) {
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

        //Prompt for more upgrades or exit.
        if (currentNodes >= batchSize && status === "No viable upgrades") {
          ns.clearLog();
          ns.print(divLineLongTop.padEnd(BOX_WIDTH));
          ns.print(leftBorder + TextTransforms.apply("All nodes upgraded to current target.", [TextTransforms.Color.LCyan]) + rightBorder);
          ns.print(leftBorder + TextTransforms.apply("Current nodes: " + currentNodes, [TextTransforms.Color.Blue]) + rightBorder);
          ns.print(divLineLongBottom.padEnd(BOX_WIDTH));
          

          const moreRaw = await ns.prompt(
              "Currently having " + currentNodes + " nodes, how many more? (0 to stop)",
              { type: "text" }
          );

          const more = Math.max(0, Math.floor(Number(moreRaw)));

          if (!Number.isFinite(more) || more <= 0) {
              ns.print(leftBorder + TextTransforms.apply("✨ Hacknet expansion complete. ✨", [TextTransforms.Color.LPurple]) + rightBorder);
              await ns.sleep(1000);
              ns.print(leftBorder + TextTransforms.apply("Exiting...", [TextTransforms.Color.LRed]) + rightBorder);
              await ns.sleep(3000);
              ns.ui.closeTail();
              return;
          }

          if (ns.hacknet.getPurchaseNodeCost() > money * 0.25) {
            ns.print(leftBorder + "Hacknet prices are very high." + rightBorder);
          }

          batchSize += more;
          ns.print(leftBorder + `New target: ${batchSize} nodes` + rightBorder);
          await ns.sleep(1000);
        }
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

    function estimateGain(i, type, currentHashes, hashTarget) {
      const node = ns.hacknet.getNodeStats(i);
      const base = node.production;
      const hashBufferFactor = Math.min(1, currentHashes / hashTarget);

      switch(type) {
          case "level": return base * 0.05;
          case "ram":   return base * 1.0;
          case "core":  return base * 0.5;
          case "cache": return base * 0.03 * (1 + hashBufferFactor);
      }
      return 0.0001;
    }
}
