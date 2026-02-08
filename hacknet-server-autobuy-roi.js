import {
    TextTransforms
} from "./text-transform.js";

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();
    ns.ui.resizeTail(340, 340);
    ns.ui.setTailTitle("Hacknet Manager");
    ns.ui.moveTail(+2025, +680);

    const SLEEP_MS = 200;
    const MAX_NODES = 20;
    const args = ns.args;
    const MONEY_ONLY = args.includes("--money");
    

    let best = null;
    let status = "";
    

    while (true) {
      let hashStatus = "Buffering";
      const money = ns.getServerMoneyAvailable("home");
      const currentHashes = ns.hacknet.numHashes(); 
      let currentNodes = ns.hacknet.numNodes();
      let hashIncomeSec = 0;
      var hashesCapacity = ns.hacknet.hashCapacity();
      let hashTarget = hashesCapacity * 0.5;
      best = null;
      status = "";
      const overflow = Math.max(0, currentHashes - hashTarget);

      

      //Calculate hash income from all hacknet servers.
      for (let i = 0; i < currentNodes; i++) {
        hashIncomeSec += ns.hacknet.getNodeStats(i).production;
      }

      //Money only mode via args.
      if (MONEY_ONLY) {
        ns.ui.resizeTail(200, 100);
        const sellAmount = Math.min(Math.floor(overflow / 4), Math.floor(hashIncomeSec / 4));
        if (sellAmount > 0) {
          ns.hacknet.spendHashes("Sell for Money", undefined, sellAmount);
          status = "Money Only Mode";

          ns.clearLog();
          ns.print(status);
          ns.print(ns.formatNumber(currentHashes, 2) + "/" + ns.formatNumber(hashesCapacity, 2));
          await ns.sleep(SLEEP_MS);
          continue;
        }
      }

      //New node
      if (currentNodes < MAX_NODES) {
        consider("new node", -1, ns.hacknet.getPurchaseNodeCost(), estimateGain(ns, -1, "new node", hashIncomeSec));
      }

      //Existing nodes
      for (let i = 0; i < currentNodes; i++) {
        consider("level", i, ns.hacknet.getLevelUpgradeCost(i, 1), estimateGain(ns, i, "level", hashIncomeSec));
        consider("ram",   i, ns.hacknet.getRamUpgradeCost(i, 1), estimateGain(ns, i, "ram", hashIncomeSec));
        consider("core",  i, ns.hacknet.getCoreUpgradeCost(i, 1), estimateGain(ns, i, "core", hashIncomeSec));
        consider("cache", i, ns.hacknet.getCacheUpgradeCost(i, 1), estimateGain(ns, i, "cache", hashIncomeSec));
      }
      
      //Sell hashes for income.
      if (overflow >= 8) {
        const sellAmount = Math.max(1, Math.floor(overflow / 4));
        if (sellAmount > 0) {
          ns.hacknet.spendHashes("Sell for Money", undefined, sellAmount);
          hashStatus = "Selling";
        }
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

      const BOX_WIDTH       = 19;
      const INIT_PAD        = 30;
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
      var sellAmStatus      = TextTransforms.apply("Sell Target:  ", [TextTransforms.Color.LWhite]);
      var sellAm            = TextTransforms.apply("Sell Am.:  ", [TextTransforms.Color.LWhite]);
      var sellAmLog         = ns.formatNumber(Math.min(Math.floor(overflow / 4), Math.floor(hashIncomeSec / 4)), 0);
      var overflowLog       = ns.formatNumber(hashesCapacity / 2 + 8, 0);
      var currentHashesLog  = ns.formatNumber(currentHashes, 2) + "/" + ns.formatNumber(hashesCapacity, 2);
      

      //Log
      ns.clearLog();
      //ns.print(ns.formulas.hacknetServers.constants());
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
        ns.print(leftBorder + sellAmStatus.padEnd(INIT_PAD) + TextTransforms.apply(overflowLog.padEnd(BOX_WIDTH), [TextTransforms.Color.Orange]) + rightBorder);
        ns.print(leftBorder + sellAm.padEnd(INIT_PAD) + TextTransforms.apply(sellAmLog.padEnd(BOX_WIDTH), [TextTransforms.Color.Orange]) + rightBorder);
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

    function estimateGain(ns, i, type, hashIncomeSec) {
      const nodes = ns.hacknet.numNodes();
      const maxNodes = 20;

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
            const reactionWindow = 2;

            const maxDesiredCapacity = Math.min(
                1_000_000,
                Math.max(2000, hashIncomeSec * 50)
            );

            const reactionBuffer = hashIncomeSec * reactionWindow;

            const manualReserve = Math.min(
                8000,
                hashIncomeSec * 10 + 300 * Math.sqrt(hashIncomeSec)
            );

            const minCapacity = ns.hacknet.numNodes() * 64 * 2;

            const desiredCapacity = Math.min(
                maxDesiredCapacity,
                Math.max(minCapacity, reactionBuffer + manualReserve)
            );

            const capacity = ns.hacknet.hashCapacity();
            if (capacity >= desiredCapacity) return 0.00001;

            const deficit = desiredCapacity - capacity;
            return deficit * 0.02;
          }
      }
      return 0.0001;
    }
}
