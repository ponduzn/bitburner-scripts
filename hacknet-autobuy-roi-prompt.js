import {
    TextTransforms
} from "./text-transform.js";

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    ns.ui.openTail();

    const SLEEP_MS = 100;   // 100 ms loop
    let batchSize = Math.max(4, ns.hacknet.numNodes());

    let best = null;         // best action per loop
    let status = "";         // human-readable status

    while (true) {
        const money = ns.getServerMoneyAvailable("home");
        best = null;          // reset best each iteration
        status = "";

        //New node
        const currentNodes = ns.hacknet.numNodes();
        if (currentNodes < batchSize) {
            const newCost = ns.hacknet.getPurchaseNodeCost();
            if (newCost < Infinity) {
                consider("new node", -1, newCost, 1); // small estimated gain for new node
            }
        }

        //Existing nodes
        for (let i = 0; i < currentNodes; i++) {
            consider("level", i, ns.hacknet.getLevelUpgradeCost(i, 1), estimateGain(i, "level"));
            consider("ram",   i, ns.hacknet.getRamUpgradeCost(i, 1), estimateGain(i, "ram"));
            consider("core",  i, ns.hacknet.getCoreUpgradeCost(i, 1), estimateGain(i, "core"));
        }

        //Determine status and execute
        if (best) {
            const actionDesc = best.type + (best.i >= 0 ? ` on Node ${best.i}` : "");

            if (best.cost <= money) {
                // we have enough money → buy it
                status = `Executing: ${actionDesc}`;
                if (best.type === "new node") ns.hacknet.purchaseNode();
                else if (best.type === "level") ns.hacknet.upgradeLevel(best.i, 1);
                else if (best.type === "ram") ns.hacknet.upgradeRam(best.i, 1);
                else if (best.type === "core") ns.hacknet.upgradeCore(best.i, 1);
            } else {
                // not enough money yet
                status = `Next action: ${actionDesc}, waiting for money`;
            }
        } else {
            status = "No viable upgrades";
        }

        var divLineShort = TextTransforms.apply("=== ", [TextTransforms.Color.Black]);
        var title = TextTransforms.apply("Hacknet ROI Manager", [TextTransforms.Color.LWhite]);
        var moneyss = TextTransforms.apply("Money : ", [TextTransforms.Color.LWhite]);
        var nodesss = TextTransforms.apply("Nodes : ", [TextTransforms.Color.LWhite]);
        var bestsss = TextTransforms.apply("Best : ", [TextTransforms.Color.LWhite]);
        var costsss = TextTransforms.apply("Cost : ", [TextTransforms.Color.LWhite]);
        var roissss = TextTransforms.apply("ROI : ", [TextTransforms.Color.LWhite]);
        var statuss = TextTransforms.apply("Status : ", [TextTransforms.Color.LWhite]);
        

        //Log
        ns.clearLog();
        ns.print(divLineShort + title + divLineShort);
        ns.print(moneyss + TextTransforms.apply("$" + ns.formatNumber(money), [TextTransforms.Color.Yellow]));
        ns.print(nodesss + TextTransforms.apply(currentNodes + "/" + batchSize, [TextTransforms.Color.ChartsBlue]));
        if (best) {
            ns.print(bestsss + TextTransforms.apply(best.type + (best.i >= 0 ? " on Node " + best.i : ""), [TextTransforms.Color.ChartsGreen]));
            ns.print(costsss + TextTransforms.apply("$" + ns.formatNumber(best.cost), [TextTransforms.Color.Red]));
            ns.print(roissss + TextTransforms.apply(best.roi.toFixed(2) + "s", [TextTransforms.Color.Blue]));
        }
        ns.print(statuss + TextTransforms.apply(status, [TextTransforms.Color.LPurple]));

        await ns.sleep(SLEEP_MS);

        //Prompt for more upgrades. or exit.
        if (currentNodes >= batchSize && status === "No viable upgrades") {
          ns.clearLog();
          ns.print(divLineShort + title + divLineShort);
          ns.print(TextTransforms.apply("All nodes upgraded to current target.", [TextTransforms.Color.LCyan]));
          ns.print(TextTransforms.apply("Current nodes: " + currentNodes, [TextTransforms.Color.Blue]));
          

          const moreRaw = await ns.prompt(
              "Currently having " + currentNodes + " nodes, how many more? (0 to stop)",
              { type: "text" }
          );

          const more = Math.max(0, Math.floor(Number(moreRaw)));

          if (!Number.isFinite(more) || more <= 0) {
              ns.print(TextTransforms.apply("Hacknet expansion complete.", [TextTransforms.Color.LPurple]));
              await ns.sleep(1000);
              ns.print(TextTransforms.apply("Exiting...", [TextTransforms.Color.LRed]));
              await ns.sleep(3000);
              ns.ui.closeTail();
              return;
          }

          if (ns.hacknet.getPurchaseNodeCost() > money * 0.25) {
            ns.print("⚠ Hacknet prices are very high. Expansion may be inefficient.");
          }

          // Increase the ceiling
          batchSize += more;
          ns.print(`New target: ${batchSize} nodes`);
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

    function estimateGain(i, type) {
        const node = ns.hacknet.getNodeStats(i);

        if (type === "level") {
            // level upgrades ~7% production gain
            return node.production * 0.07;
        } else if (type === "ram") {
            // RAM doubles production per upgrade
            return node.production * 1;
        } else if (type === "core") {
            // each core adds ~50% production
            return node.production * 0.5;
        } else {
            return 0.01; // fallback
        }
    }
}
