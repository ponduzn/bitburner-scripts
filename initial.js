import {
    TextTransforms
} from "./text-transform.js";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  ns.ui.openTail();
  ns.ui.resizeTail(340, 405);
  ns.ui.setTailTitle("Initialization");
  ns.ui.moveTail(+1260, +30);

  const home = "home";
  const started = {
        hackScr: false,
        statsScr: false,
        buyServersScr: false,
        stocksScr: false,
        gangScr: false,
        homeBoostScr: false,
        hacknetScr: false,
        backdoorScr: false,
        augAutoBuy: false,
        autoJoinFac: false,
        buyProgScr: false,
        sleeves: false,
        homeUpg: false,
        contractSolve: false
  };

  while (true) {
    ns.clearLog();
    
    const myHackLevel = ns.getHackingLevel();
    const myMoney = ns.getServerMoneyAvailable(home);
    const hasGang = ns.gang.inGang();
    const has4s = ns.stock.has4SData();
    const hasTixAcc = ns.stock.hasTIXAPIAccess();
    const hasTixExchAcc = ns.stock.has4SDataTIXAPI();
    const hasWseAcc = ns.stock.hasWSEAccount();
    const hasFormApi = ns.fileExists("Formulas.exe", home);
    const homeRamAm = ns.getServer(home).maxRam; 

    //Control script hacking servers.
    if (!started.hackScr && !ns.isRunning("target-switch-hack-all-s.js", home)) {
      if (ns.exec("target-switch-hack-all-s.js", home) !== 0) started.hackScr = true;
    }
    //Custom stats for overview.
    if (!started.statsScr && !ns.isRunning("customstatsV2.js", home)) {
      if (ns.exec("customstatsV2.js", home) !== 0) started.statsScr = true;
    }
    //sleeves automation.
    if (!started.sleeves && homeRamAm >= 128 && !ns.isRunning("sleevesV3.js", home)) {
      if (ns.exec("sleevesV3.js", home) !== 0) started.sleeves = true;
    }
    //Upgrade home ram and cpu.
    if (!started.homeUpg && !ns.isRunning("homeupgrade.js", home)) {
      if (ns.exec("homeupgrade.js", home) !== 0) started.homeUpg = true;
    }
    //Auto Buy programs.
    if (!started.buyProgScr && !ns.isRunning("buy-programs.js", home)) {
      if (ns.exec("buy-programs.js", home) !== 0) started.buyProgScr = true;
    }
    //Auto join factions.
    if (!started.autoJoinFac && !ns.isRunning("auto-join-faction.js", home)) {
      if (ns.exec("auto-join-faction.js", home) !== 0) started.autoJoinFac = true;
    }
    //Buy servers.
    if (!started.buyServersScr && myMoney > 1_000_000 && !ns.isRunning("buy-servers.js", home)) {
      if (ns.exec("buy-servers.js", home) !== 0) started.buyServersScr = true;
    }
    //Stock trading.
    if (!started.stocksScr && homeRamAm >= 256 && has4s && hasTixAcc && hasWseAcc && hasTixExchAcc && !ns.isRunning("stocktrader-grok.js", home)) {
      if (ns.exec("stocktrader-grok.js", home) !== 0) started.stocksScr = true;
    }
    //Gang automation.
    if (!started.gangScr && hasGang && !ns.isRunning("gang-managerV2.js", home) && hasFormApi) {
      if (ns.exec("gang-managerV2.js", home) !== 0) started.gangScr = true;
    }
    //Hacknet autobuyer.
    if (!started.hacknetScr && !ns.isRunning("hacknet-server-autobuy-roi.js", home)) {
      if (ns.exec("hacknet-server-autobuy-roi.js", home) !== 0) started.hacknetScr = true;
    }
    //Auto backdoor
    if (!started.backdoorScr && myHackLevel > 50 && !ns.isRunning("backdoor.js", home)) {
      if (ns.exec("backdoor.js", home) !== 0) started.backdoorScr = true;
    }
    //Hack'n rep boost on home.
    if (!started.homeBoostScr && myHackLevel > 100 && homeRamAm >= 512 && !ns.isRunning("homehackboost.js", home)) {
      if (ns.exec("homehackboost.js", home) !== 0) started.homeBoostScr = true;
    }
    //Auto buy augments and restart.
    if (!started.augAutoBuy && hasGang && myMoney > 5_000_000_000 && !ns.isRunning("auto-augment-buy-reset.js", home)) {
      if (ns.exec("auto-augment-buy-reset.js", home) !== 0) started.augAutoBuy = true;
    }

    //Auto contract solver.
    if (!started.contractSolve && myMoney > 5_000_000 && !ns.isRunning("contract-find-solve.js", home)) {
      if (ns.exec("contract-find-solve.js", home) !== 0) started.contractSolve = true;
    }


    //Flip flags if running.
    if (ns.isRunning("target-switch-hack-all-s.js", home)) started.hackScr = true;
    if (ns.isRunning("customstatsV2.js", home)) started.statsScr = true;
    if (ns.isRunning("buy-servers.js", home)) started.buyServersScr = true;
    if (ns.isRunning("stocktrader-grok.js", home)) started.stocksScr = true;
    if (ns.isRunning("gang-managerV2.js", home)) started.gangScr = true;
    if (ns.isRunning("homehackboost.js", home)) started.homeBoostScr = true;
    if (ns.isRunning("hacknet-server-autobuy-roi.js", home)) started.hacknetScr = true;
    if (ns.isRunning("backdoor.js", home)) started.backdoorScr = true;
    if (ns.isRunning("auto-augment-buy-reset.js", home)) started.augAutoBuy = true;
    if (ns.isRunning("auto-join-faction.js", home)) started.autoJoinFac = true;
    if (ns.isRunning("buy-programs.js", home)) started.buyProgScr = true;
    if (ns.isRunning("sleevesV3.js", home)) started.sleeves = true;
    if (ns.isRunning("homeupgrade.js", home)) started.homeUpg = true;
    if (ns.isRunning("contract-find-solve.js", home)) started.contractSolve = true;


    //logging:
    const BOX_WIDTH = 23;
    const leftBorder = TextTransforms.apply("| ", [TextTransforms.Color.Black]);
    const rightBorder = TextTransforms.apply(" |", [TextTransforms.Color.Black]);
    const divLineLong = TextTransforms.apply("===================================", [TextTransforms.Color.Black]);
    ns.print(divLineLong);
    if (started.hackScr === true) ns.print(leftBorder + "Hack Control script".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("true".padEnd(5), [TextTransforms.Color.ChartsBlue]) + rightBorder);
    if (started.hackScr === false) ns.print(leftBorder + "Hack Control script".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("false".padEnd(5), [TextTransforms.Color.DRed]) + rightBorder);
    if (started.statsScr === true) ns.print(leftBorder + "Extra Overview stats".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("true".padEnd(5), [TextTransforms.Color.ChartsBlue]) + rightBorder);
    if (started.statsScr === false) ns.print(leftBorder + "Extra Overview stats".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("false".padEnd(5), [TextTransforms.Color.DRed]));
    if (started.buyServersScr === true) ns.print(leftBorder + "Server buy script".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("true".padEnd(5), [TextTransforms.Color.ChartsBlue]) + rightBorder);
    if (started.buyServersScr === false) ns.print(leftBorder + "Server buy script".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("false".padEnd(5), [TextTransforms.Color.DRed]) + rightBorder);
    if (started.stocksScr === true) ns.print(leftBorder + "Stock trader script".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("true".padEnd(5), [TextTransforms.Color.ChartsBlue]) + rightBorder);
    if (started.stocksScr === false) ns.print(leftBorder + "Stock trader script".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("false".padEnd(5), [TextTransforms.Color.DRed]) + rightBorder);
    if (started.gangScr === true) ns.print(leftBorder + "Gang automation".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("true".padEnd(5), [TextTransforms.Color.ChartsBlue]) + rightBorder);
    if (started.gangScr === false) ns.print(leftBorder + "Gang automation".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("false".padEnd(5), [TextTransforms.Color.DRed]) + rightBorder);
    if (started.homeBoostScr === true) ns.print(leftBorder + "Hack'n rep boost @ home".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("true".padEnd(5), [TextTransforms.Color.ChartsBlue]) + rightBorder);
    if (started.homeBoostScr === false) ns.print(leftBorder + "Hack'n rep boost @ home".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("false".padEnd(5), [TextTransforms.Color.DRed]) + rightBorder);
    if (started.hacknetScr === true) ns.print(leftBorder + "Hacknet autobuyer".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("true".padEnd(5), [TextTransforms.Color.ChartsBlue]) + rightBorder);
    if (started.hacknetScr === false) ns.print(leftBorder + "Hacknet autobuyer".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("false".padEnd(5), [TextTransforms.Color.DRed]) + rightBorder);
    if (started.backdoorScr === true) ns.print(leftBorder + "Auto backdoor".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("true".padEnd(5), [TextTransforms.Color.ChartsBlue]) + rightBorder);
    if (started.backdoorScr === false) ns.print(leftBorder + "Auto backdoor".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("false".padEnd(5), [TextTransforms.Color.DRed]) + rightBorder);
    if (started.augAutoBuy === true) ns.print(leftBorder + "Aug auto buy".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("true".padEnd(5), [TextTransforms.Color.ChartsBlue]) + rightBorder);
    if (started.augAutoBuy === false) ns.print(leftBorder + "Aug auto buy".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("false".padEnd(5), [TextTransforms.Color.DRed]) + rightBorder);
    if (started.autoJoinFac === true) ns.print(leftBorder + "Auto join factions".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("true".padEnd(5), [TextTransforms.Color.ChartsBlue]) + rightBorder);
    if (started.autoJoinFac === false) ns.print(leftBorder + "Auto join factions".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("false".padEnd(5), [TextTransforms.Color.DRed]) + rightBorder);
    if (started.buyProgScr === true) ns.print(leftBorder + "Auto Buy programs".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("true".padEnd(5), [TextTransforms.Color.ChartsBlue]) + rightBorder);
    if (started.buyProgScr === false) ns.print(leftBorder + "Auto Buy programs".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("false".padEnd(5), [TextTransforms.Color.DRed]) + rightBorder);
    if (started.sleeves === true) ns.print(leftBorder + "Sleeves automation".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("true".padEnd(5), [TextTransforms.Color.ChartsBlue]) + rightBorder);
    if (started.sleeves === false) ns.print(leftBorder + "Sleeves automation".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("false".padEnd(5), [TextTransforms.Color.DRed]) + rightBorder);
    if (started.homeUpg === true) ns.print(leftBorder + "Home upgrading".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("true".padEnd(5), [TextTransforms.Color.ChartsBlue]) + rightBorder);
    if (started.homeUpg === false) ns.print(leftBorder + "Home upgrading".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("false".padEnd(5), [TextTransforms.Color.DRed]) + rightBorder);
    if (started.contractSolve === true) ns.print(leftBorder + "Contract Solver".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("true".padEnd(5), [TextTransforms.Color.ChartsBlue]) + rightBorder);
    if (started.contractSolve === false) ns.print(leftBorder + "Contract Solver".padEnd(BOX_WIDTH) + " = " + TextTransforms.apply("false".padEnd(5), [TextTransforms.Color.DRed]) + rightBorder);
    ns.print(divLineLong);

    //Exit if all flags = true.
    if (Object.values(started).every(v => v)) {
      const allDone = "✨ All scripts started once. ✨";
      ns.clearLog();
      ns.print(divLineLong);
      ns.print(leftBorder + TextTransforms.apply(allDone.padEnd(BOX_WIDTH), [TextTransforms.Color.Yellow]) + rightBorder);
      ns.print(divLineLong);
      await ns.sleep(10000);
      ns.ui.closeTail();
      return;
    }
    await ns.sleep(1000);
  }
}
